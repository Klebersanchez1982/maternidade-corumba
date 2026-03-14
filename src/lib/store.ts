import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Medication, Transaction, User, MOCK_MEDICATIONS } from './data';

interface AppState {
  currentUser: User | null;
  medications: Medication[];
  transactions: Transaction[];
  login: (user: User) => void;
  logout: () => void;
  dispenseMedication: (medId: number, qty: number, shift: 'Manhã' | 'Tarde' | 'Noite', patient: string, bed: string) => void;
  restockMedication: (medId: number, qty: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      medications: MOCK_MEDICATIONS,
      transactions: [],
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      dispenseMedication: (medId, qty, shift, patient, bed) => {
        const state = get();
        const med = state.medications.find(m => m.id === medId);
        if (!med || !state.currentUser) return;

        const transaction: Transaction = {
          id: crypto.randomUUID(),
          medicationId: medId,
          medicationName: med.name,
          type: 'saida',
          quantity: qty,
          shift,
          user: state.currentUser.name,
          patient,
          bed,
          date: new Date().toLocaleDateString('pt-BR'),
          timestamp: Date.now(),
        };

        set({
          medications: state.medications.map(m =>
            m.id === medId ? { ...m, quantity: Math.max(0, m.quantity - qty) } : m
          ),
          transactions: [transaction, ...state.transactions],
        });
      },
      restockMedication: (medId, qty) => {
        const state = get();
        const med = state.medications.find(m => m.id === medId);
        if (!med || !state.currentUser) return;

        const transaction: Transaction = {
          id: crypto.randomUUID(),
          medicationId: medId,
          medicationName: med.name,
          type: 'entrada',
          quantity: qty,
          shift: 'Manhã',
          user: state.currentUser.name,
          date: new Date().toLocaleDateString('pt-BR'),
          timestamp: Date.now(),
        };

        set({
          medications: state.medications.map(m =>
            m.id === medId ? { ...m, quantity: m.quantity + qty } : m
          ),
          transactions: [transaction, ...state.transactions],
        });
      },
    }),
    { name: 'pharma-store' }
  )
);
