import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getCurrentShift } from '@/lib/data';
import MedicationList from '@/components/MedicationList';
import TransactionHistory from '@/components/TransactionHistory';
import MedicationTracker from '@/components/MedicationTracker';
import AdminNurses from '@/components/AdminNurses';
import AdminMedications from '@/components/AdminMedications';
import SupportPage from '@/components/SupportPage';
import { Package, ClipboardList, LogOut, Settings, ArrowLeftRight, Headphones, Users, Pill, AlertTriangle } from 'lucide-react';

type Tab = 'estoque' | 'historico' | 'controle' | 'admin_users' | 'admin_meds' | 'suporte';

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('estoque');
  const currentUser = useAppStore(s => s.currentUser);
  const logout = useAppStore(s => s.logout);
  const checkouts = useAppStore(s => s.checkouts);
  const shift = getCurrentShift();

  const isAdmin = currentUser?.isAdmin === true;
  const myPendingCount = checkouts.filter(c => !c.returned && c.userId === currentUser?.id).length;
  const allPending = checkouts.filter(c => !c.returned);
  const allPendingCount = allPending.length;

  const [showAdminMenu, setShowAdminMenu] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 shadow-divider bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-foreground">Farmácia Maternidade</h1>
            <p className="text-xs text-muted-foreground">
              {currentUser?.name} · Turno: {shift}
              {isAdmin && <span className="ml-1 text-primary font-medium">(Admin)</span>}
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

      {/* Admin pending notifications */}
      {isAdmin && allPendingCount > 0 && tab === 'estoque' && (
        <div className="shrink-0 px-4 py-2 bg-warning/10 border-b border-warning/20">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
            <span className="text-xs font-medium text-warning">
              {allPendingCount} medicamento(s) pendente(s) de devolução
            </span>
          </div>
          <div className="mt-1 space-y-0.5">
            {allPending.slice(0, 5).map(c => (
              <p key={c.id} className="text-[11px] text-foreground">
                • <span className="font-medium">{c.userName}</span> — {c.medicationName} ({c.quantity}x)
              </p>
            ))}
            {allPendingCount > 5 && (
              <p className="text-[11px] text-muted-foreground">e mais {allPendingCount - 5}...</p>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {tab === 'estoque' && <MedicationList />}
        {tab === 'historico' && <TransactionHistory />}
        {tab === 'controle' && <MedicationTracker />}
        {tab === 'admin_users' && isAdmin && <AdminNurses />}
        {tab === 'admin_meds' && isAdmin && <AdminMedications />}
        {tab === 'suporte' && <SupportPage />}
      </main>

      {/* Admin submenu */}
      {isAdmin && showAdminMenu && (
        <div className="shrink-0 flex bg-card shadow-[0_-1px_0_0_rgba(0,0,0,0.05)]">
          <button
            onClick={() => { setTab('admin_users'); setShowAdminMenu(false); }}
            className={`flex-1 flex flex-col items-center py-2 text-[10px] font-medium transition-colors ${
              tab === 'admin_users' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Users className="h-3.5 w-3.5 mb-0.5" />
            Enfermeiras
          </button>
          <button
            onClick={() => { setTab('admin_meds'); setShowAdminMenu(false); }}
            className={`flex-1 flex flex-col items-center py-2 text-[10px] font-medium transition-colors ${
              tab === 'admin_meds' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Pill className="h-3.5 w-3.5 mb-0.5" />
            Medicamentos
          </button>
        </div>
      )}

      {/* Tab Bar */}
      <nav className="shrink-0 flex shadow-[0_-1px_0_0_rgba(0,0,0,0.05)] bg-card">
        <button
          onClick={() => { setTab('estoque'); setShowAdminMenu(false); }}
          className={`flex-1 flex flex-col items-center py-2.5 text-[11px] font-medium transition-colors ${
            tab === 'estoque' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Package className="h-4 w-4 mb-0.5" />
          Estoque
        </button>
        <button
          onClick={() => { setTab('historico'); setShowAdminMenu(false); }}
          className={`flex-1 flex flex-col items-center py-2.5 text-[11px] font-medium transition-colors ${
            tab === 'historico' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <ClipboardList className="h-4 w-4 mb-0.5" />
          Histórico
        </button>
        <button
          onClick={() => { setTab('controle'); setShowAdminMenu(false); }}
          className={`flex-1 flex flex-col items-center py-2.5 text-[11px] font-medium transition-colors relative ${
            tab === 'controle' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <ArrowLeftRight className="h-4 w-4 mb-0.5" />
          Controle
          {myPendingCount > 0 && (
            <span className="absolute top-1.5 right-1/4 h-4 min-w-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
              {myPendingCount}
            </span>
          )}
        </button>
        {isAdmin && (
          <button
            onClick={() => setShowAdminMenu(!showAdminMenu)}
            className={`flex-1 flex flex-col items-center py-2.5 text-[11px] font-medium transition-colors ${
              tab === 'admin_users' || tab === 'admin_meds' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Settings className="h-4 w-4 mb-0.5" />
            Cadastros
          </button>
        )}
        <button
          onClick={() => { setTab('suporte'); setShowAdminMenu(false); }}
          className={`flex-1 flex flex-col items-center py-2.5 text-[11px] font-medium transition-colors ${
            tab === 'suporte' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Headphones className="h-4 w-4 mb-0.5" />
          Suporte
        </button>
      </nav>
    </div>
  );
}
