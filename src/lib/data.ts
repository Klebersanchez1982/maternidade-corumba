export interface Medication {
  id: number;
  name: string;
  dosage: string;
  quantity: number;
  minStock: number;
  blocked?: boolean;
}

export interface Transaction {
  id: string;
  medicationId: number;
  medicationName: string;
  type: 'entrada' | 'saida';
  quantity: number;
  shift: 'Manhã' | 'Tarde' | 'Noite';
  user: string;
  patient?: string;
  bed?: string;
  date: string;
  timestamp: number;
}

export interface MedicationCheckout {
  id: string;
  medicationId: number;
  medicationName: string;
  quantity: number;
  userId: string;
  userName: string;
  patient?: string;
  bed?: string;
  checkoutTime: number;
  checkoutDate: string;
  returnTime?: number;
  returnDate?: string;
  returned: boolean;
}

export interface User {
  id: string;
  name: string;
  role: 'enfermeiro' | 'farmaceutico';
  password: string;
  blocked: boolean;
  isAdmin: boolean;
}

export const INITIAL_USERS: User[] = [
  { id: '1', name: 'Enf. Dayanna Sanchez', role: 'enfermeiro', password: '1234', blocked: false, isAdmin: true },
  { id: '2', name: 'Enf. Lucimara', role: 'enfermeiro', password: '1234', blocked: false, isAdmin: false },
  { id: '3', name: 'Farm. João Oliveira', role: 'farmaceutico', password: '1234', blocked: false, isAdmin: false },
];

export const INITIAL_MEDICATIONS: Medication[] = [
  { id: 1, name: 'Dipirona EV Ampola', dosage: '1g/2ml', quantity: 20, minStock: 5 },
  { id: 2, name: 'Plasil EV Ampola', dosage: '10mg/2ml', quantity: 10, minStock: 5 },
  { id: 3, name: 'Buscopam Simples EV', dosage: '20mg/ml', quantity: 15, minStock: 5 },
  { id: 4, name: 'Buscopam Composto EV', dosage: '20mg+2.5g', quantity: 15, minStock: 5 },
  { id: 5, name: 'Ondansetrona EV', dosage: '4mg/2ml', quantity: 10, minStock: 3 },
  { id: 6, name: 'Sulfato de Magnésio 50%', dosage: '50%/10ml', quantity: 15, minStock: 5 },
  { id: 7, name: 'Gluconato de Cálcio', dosage: '10%/10ml', quantity: 10, minStock: 3 },
  { id: 8, name: 'Betametasona', dosage: '4mg/ml', quantity: 10, minStock: 3 },
  { id: 9, name: 'Ringer Lactato 500ml', dosage: '500ml', quantity: 5, minStock: 3 },
  { id: 10, name: 'Soro Fisiológico 500ml', dosage: '500ml', quantity: 5, minStock: 3 },
  { id: 11, name: 'Soro Fisiológico 100ml', dosage: '100ml', quantity: 15, minStock: 5 },
  { id: 12, name: 'Soro Glicosado 500ml', dosage: '500ml', quantity: 5, minStock: 3 },
  { id: 13, name: 'Cloreto de Potássio 10ml', dosage: '19.1%/10ml', quantity: 3, minStock: 3 },
  { id: 14, name: 'Cloreto de Sódio 10ml', dosage: '20%/10ml', quantity: 3, minStock: 3 },
  { id: 15, name: 'Glicose 50% 10ml', dosage: '50%/10ml', quantity: 5, minStock: 3 },
  { id: 16, name: 'Ceftriaxona (Rocefin) EV', dosage: '1g', quantity: 4, minStock: 2 },
  { id: 17, name: 'Ampicilina (VO)', dosage: '500mg', quantity: 8, minStock: 3 },
  { id: 18, name: 'Tenoxicam 40mg EV', dosage: '40mg', quantity: 8, minStock: 3 },
  { id: 19, name: 'Tramadol EV', dosage: '100mg/2ml', quantity: 10, minStock: 3 },
  { id: 20, name: 'Paracetamol 750mg VO', dosage: '750mg', quantity: 3, minStock: 5 },
  { id: 21, name: 'Paracetamol 500mg VO', dosage: '500mg', quantity: 3, minStock: 5 },
  { id: 22, name: 'Nifedipina 10mg VO', dosage: '10mg', quantity: 8, minStock: 3 },
  { id: 23, name: 'Nifedipina 20mg VO', dosage: '20mg', quantity: 8, minStock: 3 },
  { id: 24, name: 'Dipirona 500mg VO', dosage: '500mg', quantity: 8, minStock: 3 },
  { id: 25, name: 'Metildopa 500mg VO', dosage: '500mg', quantity: 6, minStock: 3 },
  { id: 26, name: 'Sonda Foley Nº12 e 14', dosage: 'un', quantity: 3, minStock: 2 },
  { id: 27, name: 'Luva Estéril 7.0/7.5/8.0', dosage: 'par', quantity: 3, minStock: 2 },
  { id: 28, name: 'Campo Estéril', dosage: 'un', quantity: 2, minStock: 2 },
];

export function getCurrentShift(): 'Manhã' | 'Tarde' | 'Noite' {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 13) return 'Manhã';
  if (hour >= 13 && hour < 19) return 'Tarde';
  return 'Noite';
}

export function getStockStatus(med: Medication): 'critical' | 'warning' | 'ok' {
  if (med.quantity <= 0) return 'critical';
  if (med.quantity <= med.minStock) return 'critical';
  if (med.quantity <= med.minStock * 2) return 'warning';
  return 'ok';
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}
