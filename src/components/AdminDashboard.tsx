import { useAppStore } from '@/lib/store';
import { getStockStatus } from '@/lib/data';
import { Package, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Users, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const medications = useAppStore(s => s.medications);
  const users = useAppStore(s => s.users);
  const transactions = useAppStore(s => s.transactions);
  const checkouts = useAppStore(s => s.checkouts);

  const activeMeds = medications.filter(m => !m.blocked);
  const criticalMeds = activeMeds.filter(m => getStockStatus(m) === 'critical');
  const warningMeds = activeMeds.filter(m => getStockStatus(m) === 'warning');
  const pendingCheckouts = checkouts.filter(c => !c.returned);
  const activeUsers = users.filter(u => !u.blocked);

  const today = new Date().toLocaleDateString('pt-BR');
  const todayTransactions = transactions.filter(t => t.date === today);
  const todaySaidas = todayTransactions.filter(t => t.type === 'saida');
  const todayEntradas = todayTransactions.filter(t => t.type === 'entrada');

  // Top medications by usage
  const medUsage: Record<string, number> = {};
  transactions.filter(t => t.type === 'saida').forEach(t => {
    medUsage[t.medicationName] = (medUsage[t.medicationName] || 0) + t.quantity;
  });
  const topMeds = Object.entries(medUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top users by activity
  const userActivity: Record<string, number> = {};
  transactions.filter(t => t.type === 'saida').forEach(t => {
    userActivity[t.user] = (userActivity[t.user] || 0) + 1;
  });
  const topUsers = Object.entries(userActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-sm font-semibold text-foreground">Dashboard</h2>
        <p className="text-xs text-muted-foreground">Visão geral do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-3">
        <div className="bg-card rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-[11px] text-muted-foreground">Medicamentos</span>
          </div>
          <p className="text-lg font-bold text-foreground">{activeMeds.length}</p>
          <p className="text-[10px] text-muted-foreground">{medications.filter(m => m.blocked).length} bloqueados</p>
        </div>

        <div className="bg-card rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-[11px] text-muted-foreground">Usuários Ativos</span>
          </div>
          <p className="text-lg font-bold text-foreground">{activeUsers.length}</p>
          <p className="text-[10px] text-muted-foreground">{users.filter(u => u.blocked).length} bloqueados</p>
        </div>

        <div className="bg-card rounded-lg p-3 border border-destructive/30">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-[11px] text-muted-foreground">Estoque Crítico</span>
          </div>
          <p className="text-lg font-bold text-destructive">{criticalMeds.length}</p>
          <p className="text-[10px] text-warning">{warningMeds.length} em alerta</p>
        </div>

        <div className="bg-card rounded-lg p-3 border border-warning/30">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-[11px] text-muted-foreground">Pendentes</span>
          </div>
          <p className="text-lg font-bold text-warning">{pendingCheckouts.length}</p>
          <p className="text-[10px] text-muted-foreground">devoluções</p>
        </div>
      </div>

      {/* Today */}
      <div className="px-4 pb-3">
        <div className="bg-card rounded-lg p-3 border border-border">
          <h3 className="text-xs font-semibold text-foreground mb-2">Movimentações Hoje ({today})</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <ArrowUpCircle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs text-foreground"><strong>{todaySaidas.length}</strong> saídas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowDownCircle className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-foreground"><strong>{todayEntradas.length}</strong> entradas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Stock List */}
      {criticalMeds.length > 0 && (
        <div className="px-4 pb-3">
          <div className="bg-destructive/5 rounded-lg p-3 border border-destructive/20">
            <h3 className="text-xs font-semibold text-destructive mb-2">⚠ Estoque Crítico</h3>
            {criticalMeds.sort((a, b) => a.quantity - b.quantity).map(m => (
              <div key={m.id} className="flex justify-between py-1">
                <span className="text-xs text-foreground truncate">{m.name}</span>
                <span className="text-xs font-bold text-destructive">{m.quantity} un</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top medications */}
      {topMeds.length > 0 && (
        <div className="px-4 pb-3">
          <div className="bg-card rounded-lg p-3 border border-border">
            <h3 className="text-xs font-semibold text-foreground mb-2">Medicamentos Mais Utilizados</h3>
            {topMeds.map(([name, qty], i) => (
              <div key={name} className="flex justify-between py-1">
                <span className="text-xs text-foreground truncate">{i + 1}. {name}</span>
                <span className="text-xs font-medium text-muted-foreground">{qty} un</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top users */}
      {topUsers.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-card rounded-lg p-3 border border-border">
            <h3 className="text-xs font-semibold text-foreground mb-2">Usuários Mais Ativos</h3>
            {topUsers.map(([name, count], i) => (
              <div key={name} className="flex justify-between py-1">
                <span className="text-xs text-foreground truncate">{i + 1}. {name}</span>
                <span className="text-xs font-medium text-muted-foreground">{count} movim.</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
