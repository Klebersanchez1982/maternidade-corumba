import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatDateTime } from '@/lib/data';
import { AlertTriangle, RotateCcw, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function MedicationTracker() {
  const checkouts = useAppStore(s => s.checkouts);
  const returnMedication = useAppStore(s => s.returnMedication);
  const currentUser = useAppStore(s => s.currentUser);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const filtered = filter === 'pending'
    ? checkouts.filter(c => !c.returned)
    : checkouts;

  // My pending returns
  const myPending = checkouts.filter(c => !c.returned && c.userId === currentUser?.id);

  const handleReturn = (checkoutId: string, userId: string) => {
    if (currentUser?.id !== userId && !currentUser?.isAdmin) {
      toast.error('Somente quem retirou o medicamento pode devolvê-lo');
      return;
    }
    returnMedication(checkoutId);
    toast.success('Medicamento devolvido e estoque atualizado');
  };

  const getTimeSince = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* My pending alerts */}
      {myPending.length > 0 && (
        <div className="px-4 pt-4">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs font-semibold text-warning">Você tem {myPending.length} medicamento(s) pendente(s) de devolução!</span>
            </div>
            {myPending.map(c => (
              <div key={c.id} className="flex items-center justify-between py-1">
                <span className="text-xs text-foreground">{c.medicationName} ({c.quantity}x) - há {getTimeSince(c.checkoutTime)}</span>
                <button
                  onClick={() => handleReturn(c.id, c.userId)}
                  className="text-[10px] px-2 py-1 rounded bg-success text-success-foreground font-medium hover:opacity-90 flex items-center gap-1"
                >
                  <RotateCcw className="h-2.5 w-2.5" /> Devolver
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="px-4 pt-4 pb-2 flex gap-1">
        {(['pending', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {f === 'pending' ? 'Pendentes' : 'Todos'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center mt-8">Nenhum registro encontrado</p>
        ) : (
          filtered.map(c => (
            <div key={c.id} className={`py-2.5 shadow-divider ${!c.returned && Date.now() - c.checkoutTime > 4 * 60 * 60 * 1000 ? 'bg-destructive/5 -mx-4 px-4 rounded' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <div className="flex items-center gap-1.5">
                    {!c.returned && Date.now() - c.checkoutTime > 4 * 60 * 60 * 1000 && (
                      <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                    )}
                    <p className="text-sm font-medium text-foreground truncate">{c.medicationName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {c.quantity}x · {c.userName}
                  </p>
                  {c.patient && (
                    <p className="text-xs text-muted-foreground">
                      Paciente: {c.patient} {c.bed && `· Leito ${c.bed}`}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      Retirada: {formatDateTime(c.checkoutTime)}
                    </span>
                  </div>
                  {c.returned && c.returnTime && (
                    <div className="flex items-center gap-1">
                      <RotateCcw className="h-2.5 w-2.5 text-success" />
                      <span className="text-[11px] text-success">
                        Devolvido: {formatDateTime(c.returnTime)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  {c.returned ? (
                    <span className="text-[10px] px-2 py-1 rounded bg-success/10 text-success font-medium">Devolvido</span>
                  ) : (currentUser?.id === c.userId || currentUser?.isAdmin) ? (
                    <button
                      onClick={() => handleReturn(c.id, c.userId)}
                      className="text-[10px] px-2 py-1 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 flex items-center gap-1"
                    >
                      <RotateCcw className="h-2.5 w-2.5" /> Devolver
                    </button>
                  ) : (
                    <span className="text-[10px] px-2 py-1 rounded bg-warning/10 text-warning font-medium">Pendente</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
