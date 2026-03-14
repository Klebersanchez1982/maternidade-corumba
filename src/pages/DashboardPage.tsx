import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getCurrentShift } from '@/lib/data';
import MedicationList from '@/components/MedicationList';
import TransactionHistory from '@/components/TransactionHistory';
import { Package, ClipboardList, LogOut } from 'lucide-react';

type Tab = 'estoque' | 'historico';

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('estoque');
  const currentUser = useAppStore(s => s.currentUser);
  const logout = useAppStore(s => s.logout);
  const shift = getCurrentShift();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 shadow-divider bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-foreground">Farmácia Maternidade</h1>
            <p className="text-xs text-muted-foreground">
              {currentUser?.name} · Turno: {shift}
            </p>
          </div>
          <button
            onClick={logout}
            className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Sair"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {tab === 'estoque' ? <MedicationList /> : <TransactionHistory />}
      </main>

      {/* Tab Bar */}
      <nav className="shrink-0 flex shadow-[0_-1px_0_0_rgba(0,0,0,0.05)] bg-card">
        <button
          onClick={() => setTab('estoque')}
          className={`flex-1 flex flex-col items-center py-2.5 text-[11px] font-medium transition-colors ${
            tab === 'estoque' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Package className="h-4 w-4 mb-0.5" />
          Estoque
        </button>
        <button
          onClick={() => setTab('historico')}
          className={`flex-1 flex flex-col items-center py-2.5 text-[11px] font-medium transition-colors ${
            tab === 'historico' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <ClipboardList className="h-4 w-4 mb-0.5" />
          Histórico
        </button>
      </nav>
    </div>
  );
}
