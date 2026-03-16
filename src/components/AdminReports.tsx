import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatDateTime } from '@/lib/data';
import { FileSpreadsheet, FileText, Download, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReports() {
  const transactions = useAppStore(s => s.transactions);
  const checkouts = useAppStore(s => s.checkouts);
  const inventoryLogs = useAppStore(s => s.inventoryLogs);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const parseDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const filterByPeriod = () => {
    if (!startDate || !endDate) return transactions;
    const start = parseDate(startDate).getTime();
    const end = parseDate(endDate);
    end.setHours(23, 59, 59, 999);
    return transactions.filter(t => t.timestamp >= start && t.timestamp <= end.getTime());
  };

  const filterCheckoutsByPeriod = () => {
    if (!startDate || !endDate) return checkouts;
    const start = parseDate(startDate).getTime();
    const end = parseDate(endDate);
    end.setHours(23, 59, 59, 999);
    return checkouts.filter(c => c.checkoutTime >= start && c.checkoutTime <= end.getTime());
  };

  const exportExcel = async () => {
    const filtered = filterByPeriod();
    const filteredCheckouts = filterCheckoutsByPeriod();
    if (filtered.length === 0 && filteredCheckouts.length === 0) {
      toast.error('Nenhum dado encontrado no período');
      return;
    }

    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    // Transactions sheet
    const txData = filtered.map(t => ({
      'Data': t.date,
      'Tipo': t.type === 'saida' ? 'Saída' : 'Entrada',
      'Medicamento': t.medicationName,
      'Quantidade': t.quantity,
      'Turno': t.shift,
      'Usuário': t.user,
      'Paciente': t.patient || '-',
      'Leito': t.bed || '-',
    }));
    const ws1 = XLSX.utils.json_to_sheet(txData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Movimentações');

    // Checkouts sheet
    const coData = filteredCheckouts.map(c => ({
      'Medicamento': c.medicationName,
      'Quantidade': c.quantity,
      'Usuário': c.userName,
      'Paciente': c.patient || '-',
      'Leito': c.bed || '-',
      'Data Retirada': c.checkoutDate,
      'Hora Retirada': new Date(c.checkoutTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      'Devolvido': c.returned ? 'Sim' : 'Não',
      'Data Devolução': c.returnDate || '-',
      'Hora Devolução': c.returnTime ? new Date(c.returnTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
    }));
    const ws2 = XLSX.utils.json_to_sheet(coData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Controle');

    const period = startDate && endDate ? `_${startDate}_a_${endDate}` : '';
    XLSX.writeFile(wb, `relatorio_farmacia${period}.xlsx`);
    toast.success('Relatório Excel exportado');
  };

  const exportPDF = async () => {
    const today = new Date().toLocaleDateString('pt-BR');
    const todayTransactions = transactions.filter(t => t.date === today);
    const todayCheckouts = checkouts.filter(c => c.checkoutDate === today);

    if (todayTransactions.length === 0 && todayCheckouts.length === 0) {
      toast.error('Nenhum dado para hoje');
      return;
    }

    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(14);
    doc.text('Relatório Diário - Farmácia Maternidade', 14, 20);
    doc.setFontSize(10);
    doc.text(`Data: ${today}`, 14, 28);

    let y = 35;

    // Transactions table
    if (todayTransactions.length > 0) {
      doc.setFontSize(11);
      doc.text('Movimentações', 14, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        head: [['Tipo', 'Medicamento', 'Qtd', 'Turno', 'Usuário', 'Paciente', 'Leito']],
        body: todayTransactions.map(t => [
          t.type === 'saida' ? 'Saída' : 'Entrada',
          t.medicationName,
          t.quantity,
          t.shift,
          t.user,
          t.patient || '-',
          t.bed || '-',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Checkouts table
    if (todayCheckouts.length > 0) {
      doc.setFontSize(11);
      doc.text('Controle de Medicamentos', 14, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        head: [['Medicamento', 'Qtd', 'Usuário', 'Retirada', 'Devolvido', 'Devolução']],
        body: todayCheckouts.map(c => [
          c.medicationName,
          c.quantity,
          c.userName,
          new Date(c.checkoutTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          c.returned ? 'Sim' : 'Não',
          c.returnTime ? new Date(c.returnTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });
    }

    doc.save(`relatorio_diario_${today.replace(/\//g, '-')}.pdf`);
    toast.success('Relatório PDF exportado');
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-sm font-semibold text-foreground">Relatórios</h2>
        <p className="text-xs text-muted-foreground">Exportar dados em Excel ou PDF</p>
      </div>

      {/* PDF Daily */}
      <div className="px-4 pb-3">
        <div className="bg-card rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-destructive" />
            <h3 className="text-xs font-semibold text-foreground">Relatório Diário (PDF)</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            Exporta todas as movimentações e controle do dia atual em PDF.
          </p>
          <button
            onClick={exportPDF}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" /> Exportar PDF Hoje
          </button>
        </div>
      </div>

      {/* Excel by Period */}
      <div className="px-4 pb-4">
        <div className="bg-card rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="h-4 w-4 text-success" />
            <h3 className="text-xs font-semibold text-foreground">Relatório por Período (Excel)</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            Selecione o período para exportar movimentações e controle em Excel.
          </p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">Data Início</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-md bg-muted text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">Data Fim</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-md bg-muted text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-success text-success-foreground font-medium hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" /> Exportar Excel
            </button>
          </div>
        </div>
      </div>
      {/* Inventory Log */}
      <div className="px-4 pb-4">
        <div className="bg-card rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold text-foreground">Histórico de Inventários</h3>
          </div>
          {inventoryLogs.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">Nenhum inventário realizado.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-auto">
              {inventoryLogs.map(log => (
                <div key={log.id} className="bg-muted rounded-md p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{log.userName}</span>
                    <span className="text-[10px] text-muted-foreground">{formatDateTime(log.timestamp)}</span>
                  </div>
                  {log.items.map((item, i) => (
                    <p key={i} className="text-[11px] text-foreground">
                      • {item.medicationName}: <span className="text-muted-foreground">{item.previousQty}</span> → <span className="font-medium">{item.newQty}</span>
                      <span className={`ml-1 text-[10px] font-bold ${item.newQty > item.previousQty ? 'text-success' : item.newQty < item.previousQty ? 'text-destructive' : ''}`}>
                        ({item.newQty - item.previousQty > 0 ? '+' : ''}{item.newQty - item.previousQty})
                      </span>
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
