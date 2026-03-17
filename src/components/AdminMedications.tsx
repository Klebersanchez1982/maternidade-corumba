import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Medication } from '@/lib/data';
import { Plus, Edit2, X, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminMedications() {
  const medications = useAppStore(s => s.medications);
  const addMedication = useAppStore(s => s.addMedication);
  const updateMedication = useAppStore(s => s.updateMedication);
  const toggleBlockMedication = useAppStore(s => s.toggleBlockMedication);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStock, setMinStock] = useState('');
  const [lote, setLote] = useState('');
  const [validade, setValidade] = useState('');
  const [controlled, setControlled] = useState(false);
  const [search, setSearch] = useState('');

  const resetForm = () => {
    setName(''); setDosage(''); setQuantity(''); setMinStock('');
    setLote(''); setValidade(''); setControlled(false);
    setShowForm(false); setEditingId(null);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedDosage = dosage.trim();
    if (!trimmedName || !trimmedDosage) {
      toast.error('Nome e dosagem são obrigatórios');
      return;
    }
    if (trimmedName.length > 100 || trimmedDosage.length > 50) {
      toast.error('Nome (máx 100) ou dosagem (máx 50) muito longo');
      return;
    }
    const qty = parseInt(quantity) || 0;
    const min = parseInt(minStock) || 3;

    const medData = {
      name: trimmedName,
      dosage: trimmedDosage,
      quantity: qty,
      minStock: min,
      lote: lote.trim() || undefined,
      validade: validade || undefined,
      controlled,
    };

    if (editingId !== null) {
      updateMedication(editingId, medData);
      toast.success('Medicamento atualizado');
    } else {
      addMedication(medData);
      toast.success('Medicamento cadastrado');
    }
    resetForm();
  };

  const startEdit = (med: Medication) => {
    setEditingId(med.id);
    setName(med.name);
    setDosage(med.dosage);
    setQuantity(String(med.quantity));
    setMinStock(String(med.minStock));
    setLote(med.lote || '');
    setValidade(med.validade || '');
    setControlled(med.controlled || false);
    setShowForm(true);
  };

  const filtered = medications
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.blocked && !b.blocked) return 1;
      if (!a.blocked && b.blocked) return -1;
      return a.name.localeCompare(b.name, 'pt-BR');
    });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Medicamentos</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> Novo
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pb-3">
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{editingId !== null ? 'Editar Medicamento' : 'Novo Medicamento'}</span>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do medicamento" maxLength={100} className="w-full h-9 px-3 rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" />
              <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Dosagem (ex: 500mg)" maxLength={50} className="w-full h-9 px-3 rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" />
              <div className="flex gap-2">
                <input type="number" inputMode="numeric" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Qtd" className="flex-1 h-9 px-3 rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" />
                <input type="number" inputMode="numeric" value={minStock} onChange={e => setMinStock(e.target.value)} placeholder="Est. mínimo" className="flex-1 h-9 px-3 rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" />
              </div>
              <div className="flex gap-2">
                <input value={lote} onChange={e => setLote(e.target.value)} placeholder="Lote" maxLength={50} className="flex-1 h-9 px-3 rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" />
                <input type="date" value={validade} onChange={e => setValidade(e.target.value)} placeholder="Validade" className="flex-1 h-9 px-3 rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" />
              </div>
              <label className="flex items-center gap-2 px-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={controlled}
                  onChange={e => setControlled(e.target.checked)}
                  className="h-4 w-4 rounded border-primary text-primary focus:ring-primary/30"
                />
                <span className="text-xs text-foreground">Controle especial (destaque em vermelho)</span>
              </label>
              <button onClick={handleSave} className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                {editingId !== null ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 pb-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar medicamento..."
          className="w-full h-9 px-3 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {filtered.map(med => (
          <div key={med.id} className="flex items-center justify-between py-2.5 shadow-divider">
            <div className="flex-1 min-w-0 mr-2">
              <p className={`text-sm font-medium truncate ${med.blocked ? 'text-muted-foreground line-through' : med.controlled ? 'text-destructive' : 'text-foreground'}`}>
                {med.name}
                {med.controlled && !med.blocked && <span className="ml-1 text-[10px] font-bold">⚠</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {med.dosage} · Qtd: {med.quantity} · Mín: {med.minStock}
                {med.lote && ` · Lote: ${med.lote}`}
                {med.validade && ` · Val: ${new Date(med.validade).toLocaleDateString('pt-BR')}`}
                {med.blocked && ' · Bloqueado'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => startEdit(med)} className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent">
                <Edit2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => { toggleBlockMedication(med.id); toast.success(med.blocked ? 'Medicamento desbloqueado' : 'Medicamento bloqueado'); }}
                className={`h-7 w-7 rounded-md flex items-center justify-center ${med.blocked ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-warning/10 text-warning hover:bg-warning/20'}`}
                title={med.blocked ? 'Desbloquear' : 'Bloquear'}
              >
                {med.blocked ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}