import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { ClipboardCheck, Check, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryChecklist() {
  const medications = useAppStore(s => s.medications);
  const performInventory = useAppStore(s => s.performInventory);

  const sortedMeds = useMemo(
    () => [...medications].filter(m => !m.blocked).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [medications]
  );

  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const updateQty = (id: number, val: string) => {
    setQuantities(prev => ({ ...prev, [id]: val }));
  };

  const toggleCheck = (id: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    const items = sortedMeds
      .filter(m => checked.has(m.id))
      .map(m => ({
        medicationId: m.id,
        newQty: quantities[m.id] !== undefined ? Math.max(0, parseInt(quantities[m.id]) || 0) : m.quantity,
      }));

    if (items.length === 0) {
      toast.error('Marque ao menos um medicamento');
      return;
    }

    performInventory(items);
    setChecked(new Set());
    setQuantities({});
    toast.success('Checklist salvo com sucesso!');
  };

  const handleReset = () => {
    setChecked(new Set());
    setQuantities({});
  };

  const checkedCount = checked.size;
  const totalCount = sortedMeds.length;

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Checklist</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {checkedCount}/{totalCount} verificados
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Confira a quantidade física de cada medicamento. Marque os itens conferidos e ajuste se necessário.
        </p>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {sortedMeds.map(med => {
          const isChecked = checked.has(med.id);
          const currentVal = quantities[med.id] !== undefined ? quantities[med.id] : String(med.quantity);
          const newQty = parseInt(currentVal) || 0;
          const diff = newQty - med.quantity;

          return (
            <div
              key={med.id}
              className={`flex items-center gap-3 py-2.5 shadow-divider transition-colors ${isChecked ? 'bg-primary/5 -mx-4 px-4 rounded-lg' : ''}`}
            >
              <button
                onClick={() => toggleCheck(med.id)}
                className={`shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isChecked
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground/30 text-transparent'
                }`}
              >
                <Check className="h-3 w-3" />
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{med.name}</p>
                <p className="text-xs text-muted-foreground">{med.dosage} · Sistema: {med.quantity}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={currentVal}
                  onChange={e => updateQty(med.id, e.target.value)}
                  className="w-14 h-8 text-center rounded-md bg-muted text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
                {diff !== 0 && (
                  <span className={`text-[10px] font-bold min-w-[28px] text-center ${diff > 0 ? 'text-success' : 'text-destructive'}`}>
                    {diff > 0 ? `+${diff}` : diff}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 z-10 px-4 py-3 bg-card shadow-[0_-1px_0_0_rgba(0,0,0,0.05)] flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 h-10 rounded-lg bg-muted text-foreground text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Limpar
        </button>
        <button
          onClick={handleSave}
          className="flex-[2] h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5 hover:opacity-90"
        >
          <ClipboardCheck className="h-3.5 w-3.5" /> Salvar Checklist ({checkedCount})
        </button>
      </div>
    </div>
  );
}
