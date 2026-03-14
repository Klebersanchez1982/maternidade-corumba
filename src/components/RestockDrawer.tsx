import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  medId: number;
  onClose: () => void;
}

export default function RestockDrawer({ medId, onClose }: Props) {
  const med = useAppStore(s => s.medications.find(m => m.id === medId));
  const restock = useAppStore(s => s.restockMedication);
  const [qty, setQty] = useState(1);

  if (!med) return null;

  const handleConfirm = () => {
    if (qty <= 0) return;
    restock(medId, qty);
    toast.success(`${qty}x ${med.name} adicionado ao estoque`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/20"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 bg-card rounded-t-xl shadow-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Registrar Entrada</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">{med.name}</p>
              <p className="text-xs text-muted-foreground">{med.dosage} · Estoque atual: {med.quantity}</p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Quantidade a adicionar</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="h-9 w-9 rounded-lg bg-muted text-foreground font-medium text-sm hover:bg-accent"
                >−</button>
                <input
                  type="number"
                  value={qty}
                  onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-9 w-16 text-center rounded-lg bg-muted text-sm text-foreground outline-none"
                />
                <button
                  onClick={() => setQty(qty + 1)}
                  className="h-9 w-9 rounded-lg bg-muted text-foreground font-medium text-sm hover:bg-accent"
                >+</button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={qty <= 0}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity mt-2"
            >
              Confirmar Entrada
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
