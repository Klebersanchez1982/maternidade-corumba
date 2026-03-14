import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ArrowDownCircle, ArrowUpCircle, Search } from 'lucide-react';

export default function TransactionHistory() {
  const transactions = useAppStore(s => s.transactions);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'entrada' | 'saida'>('all');

  const filtered = transactions.filter(t => {
    const matchSearch = t.medicationName.toLowerCase().includes(search.toLowerCase()) ||
      t.user.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background px-4 pt-4 pb-2">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por medicamento ou usuário..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'saida', 'entrada'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'saida' ? 'Saídas' : 'Entradas'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center mt-8">Nenhum registro encontrado</p>
        ) : (
          filtered.map(t => (
            <div key={t.id} className="py-2.5 shadow-divider">
              <div className="flex items-start gap-2">
                {t.type === 'saida' ? (
                  <ArrowUpCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                ) : (
                  <ArrowDownCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.medicationName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.quantity} un · {t.shift} · {t.user}
                  </p>
                  {t.patient && (
                    <p className="text-xs text-muted-foreground">
                      Paciente: {t.patient} {t.bed && `· Leito ${t.bed}`}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{t.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
