import { useState } from 'react';
import { Search } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getStockStatus } from '@/lib/data';
import DispenseDrawer from './DispenseDrawer';
import RestockDrawer from './RestockDrawer';

export default function MedicationList() {
  const medications = useAppStore(s => s.medications);
  const currentUser = useAppStore(s => s.currentUser);
  const [search, setSearch] = useState('');
  const [dispenseId, setDispenseId] = useState<number | null>(null);
  const [restockId, setRestockId] = useState<number | null>(null);

  const isAdmin = currentUser?.isAdmin === true;

  const filtered = medications
    .filter(m => !m.blocked && m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));


  const critical = filtered.filter(m => getStockStatus(m) === 'critical').length;

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="sticky top-0 z-10 bg-background px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar medicamento..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {critical > 0 && (
          <p className="text-xs text-destructive mt-2 font-medium">
            ⚠ {critical} item(ns) com estoque crítico
          </p>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {filtered.map(med => {
          const status = getStockStatus(med);
          return (
            <div
              key={med.id}
              className="flex items-center justify-between py-2.5 shadow-divider"
            >
              <div className="flex-1 min-w-0 mr-3">
                <p className={`text-sm font-medium truncate ${med.controlled ? 'text-destructive' : 'text-foreground'}`}>
                  {med.name}
                  {med.controlled && <span className="ml-1 text-[10px] font-bold">⚠</span>}
                </p>
                <p className="text-xs text-muted-foreground">{med.dosage}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium min-w-[3ch] text-right ${
                  status === 'critical' ? 'text-destructive' :
                  status === 'warning' ? 'text-warning' : 'text-foreground'
                }`}>
                  {med.quantity}
                </span>
                <button
                  onClick={() => setDispenseId(med.id)}
                  className="text-[11px] px-2 py-1 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90"
                >
                  Saída
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setRestockId(med.id)}
                    className="text-[11px] px-2 py-1 rounded-md bg-muted text-foreground font-medium hover:bg-accent"
                  >
                    Entrada
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {dispenseId && (
        <DispenseDrawer medId={dispenseId} onClose={() => setDispenseId(null)} />
      )}
      {restockId && (
        <RestockDrawer medId={restockId} onClose={() => setRestockId(null)} />
      )}
    </div>
  );
}
