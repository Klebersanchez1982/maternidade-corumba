import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Medication, Transaction, User, MedicationCheckout, INITIAL_MEDICATIONS, INITIAL_USERS } from './data';

interface AppState {
  currentUser: User | null;
  users: User[];
  medications: Medication[];
  transactions: Transaction[];
  checkouts: MedicationCheckout[];

  // Auth
  login: (user: User) => void;
  logout: () => void;

  // User CRUD
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<Omit<User, 'id'>>) => void;
  deleteUser: (id: string) => void;
  toggleBlockUser: (id: string) => void;

  // Medication CRUD
  addMedication: (med: Omit<Medication, 'id'>) => void;
  updateMedication: (id: number, data: Partial<Omit<Medication, 'id'>>) => void;
  deleteMedication: (id: number) => void;
  toggleBlockMedication: (id: number) => void;
  deleteMedication: (id: number) => void;

  // Dispense / Restock
  dispenseMedication: (medId: number, qty: number, shift: 'Manhã' | 'Tarde' | 'Noite', patient: string, bed: string) => void;
  restockMedication: (medId: number, qty: number) => void;

  // Checkout tracking
  checkoutMedication: (medId: number, qty: number, patient?: string, bed?: string) => void;
  returnMedication: (checkoutId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: INITIAL_USERS,
      medications: INITIAL_MEDICATIONS,
      transactions: [],
      checkouts: [],

      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),

      // User CRUD
      addUser: (userData) => {
        const state = get();
        const id = String(Date.now());
        set({ users: [...state.users, { ...userData, id }] });
      },
      updateUser: (id, data) => {
        set({ users: get().users.map(u => u.id === id ? { ...u, ...data } : u) });
      },
      deleteUser: (id) => {
        set({ users: get().users.filter(u => u.id !== id) });
      },
      toggleBlockUser: (id) => {
        set({ users: get().users.map(u => u.id === id ? { ...u, blocked: !u.blocked } : u) });
      },

      // Medication CRUD
      addMedication: (medData) => {
        const state = get();
        const maxId = state.medications.reduce((max, m) => Math.max(max, m.id), 0);
        set({ medications: [...state.medications, { ...medData, id: maxId + 1 }] });
      },
      updateMedication: (id, data) => {
        set({ medications: get().medications.map(m => m.id === id ? { ...m, ...data } : m) });
      },
      deleteMedication: (id) => {
        set({ medications: get().medications.filter(m => m.id !== id) });
      },
      toggleBlockMedication: (id) => {
        set({ medications: get().medications.map(m => m.id === id ? { ...m, blocked: !m.blocked } : m) });
      },

      // Dispense
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

        // Also create a checkout record
        const checkout: MedicationCheckout = {
          id: crypto.randomUUID(),
          medicationId: medId,
          medicationName: med.name,
          quantity: qty,
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          patient,
          bed,
          checkoutTime: Date.now(),
          checkoutDate: new Date().toLocaleDateString('pt-BR'),
          returned: false,
        };

        set({
          medications: state.medications.map(m =>
            m.id === medId ? { ...m, quantity: Math.max(0, m.quantity - qty) } : m
          ),
          transactions: [transaction, ...state.transactions],
          checkouts: [checkout, ...state.checkouts],
        });
      },

      // Restock
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

      // Checkout tracking
      checkoutMedication: (medId, qty, patient, bed) => {
        const state = get();
        const med = state.medications.find(m => m.id === medId);
        if (!med || !state.currentUser) return;

        const checkout: MedicationCheckout = {
          id: crypto.randomUUID(),
          medicationId: medId,
          medicationName: med.name,
          quantity: qty,
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          patient,
          bed,
          checkoutTime: Date.now(),
          checkoutDate: new Date().toLocaleDateString('pt-BR'),
          returned: false,
        };

        set({ checkouts: [checkout, ...state.checkouts] });
      },

      returnMedication: (checkoutId) => {
        const state = get();
        const checkout = state.checkouts.find(c => c.id === checkoutId);
        if (!checkout || !state.currentUser) return;
        // Only the user who checked out can return (or admin)
        if (checkout.userId !== state.currentUser.id && !state.currentUser.isAdmin) return;

        // Create return transaction
        const transaction: Transaction = {
          id: crypto.randomUUID(),
          medicationId: checkout.medicationId,
          medicationName: checkout.medicationName,
          type: 'entrada',
          quantity: checkout.quantity,
          shift: 'Manhã',
          user: state.currentUser.name,
          date: new Date().toLocaleDateString('pt-BR'),
          timestamp: Date.now(),
        };

        set({
          checkouts: state.checkouts.map(c =>
            c.id === checkoutId
              ? { ...c, returned: true, returnTime: Date.now(), returnDate: new Date().toLocaleDateString('pt-BR') }
              : c
          ),
          medications: state.medications.map(m =>
            m.id === checkout.medicationId ? { ...m, quantity: m.quantity + checkout.quantity } : m
          ),
          transactions: [transaction, ...state.transactions],
        });
      },
    }),
    { name: 'pharma-store' }
  )
);
