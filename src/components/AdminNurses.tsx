import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { User } from '@/lib/data';
import { UserPlus, Edit2, Trash2, Ban, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminNurses() {
  const users = useAppStore(s => s.users);
  const addUser = useAppStore(s => s.addUser);
  const updateUser = useAppStore(s => s.updateUser);
  const deleteUser = useAppStore(s => s.deleteUser);
  const toggleBlockUser = useAppStore(s => s.toggleBlockUser);
  const currentUser = useAppStore(s => s.currentUser);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'enfermeiro' | 'tecnico'>('tecnico');
  const [password, setPassword] = useState('');
  const [canInventory, setCanInventory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setRole('enfermeiro');
    setPassword('');
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      toast.error('Nome inválido (máx 100 caracteres)');
      return;
    }
    if (!password && !editingId) {
      toast.error('Senha é obrigatória');
      return;
    }
    if (password && password.length > 20) {
      toast.error('Senha muito longa (máx 20 caracteres)');
      return;
    }

    if (editingId) {
      const data: Partial<Omit<User, 'id'>> = { name: trimmedName, role };
      if (password) data.password = password;
      updateUser(editingId, data);
      toast.success('Usuário atualizado');
    } else {
      addUser({ name: trimmedName, role, password: password || '1234', blocked: false, isAdmin: false });
      toast.success('Usuário cadastrado');
    }
    resetForm();
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setName(user.name);
    setRole(user.role === 'farmaceutico' ? 'tecnico' : user.role as 'enfermeiro' | 'tecnico');
    setPassword('');
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) {
      toast.error('Não é possível excluir seu próprio usuário');
      return;
    }
    deleteUser(id);
    setConfirmDelete(null);
    toast.success('Usuário excluído');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Enfermeiras / Usuários</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
        >
          <UserPlus className="h-3.5 w-3.5" /> Novo
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-3"
          >
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  {editingId ? 'Editar Usuário' : 'Novo Usuário'}
                </span>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nome completo"
                maxLength={100}
                className="w-full h-9 px-3 rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
              />
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'enfermeiro' | 'tecnico')}
                className="w-full h-9 px-3 rounded-md bg-background text-sm text-foreground outline-none"
              >
                <option value="tecnico">Técnico(a)</option>
                <option value="enfermeiro">Enfermagem</option>
              </select>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={editingId ? 'Nova senha (deixe vazio para manter)' : 'Senha'}
                maxLength={20}
                className="w-full h-9 px-3 rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
              />
              <button
                onClick={handleSave}
                className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                {editingId ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {[...users].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(user => (
          <div key={user.id} className="flex items-center justify-between py-2.5 shadow-divider">
            <div className="flex-1 min-w-0 mr-2">
              <div className="flex items-center gap-1.5">
                <p className={`text-sm font-medium truncate ${user.blocked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {user.name}
                </p>
                {user.isAdmin && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">ADM</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.role === 'tecnico' ? 'Técnico(a)' : user.role === 'enfermeiro' ? 'Enfermagem' : 'Farmácia'}
                {user.blocked && ' · Bloqueado'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => startEdit(user)} className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent">
                <Edit2 className="h-3 w-3" />
              </button>
              {!user.isAdmin && (
                <button
                  onClick={() => toggleBlockUser(user.id)}
                  className={`h-7 w-7 rounded-md flex items-center justify-center ${user.blocked ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-warning/10 text-warning hover:bg-warning/20'}`}
                  title={user.blocked ? 'Desbloquear' : 'Bloquear'}
                >
                  {user.blocked ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                </button>
              )}
              {user.id !== currentUser?.id && !user.isAdmin && (
                confirmDelete === user.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(user.id)} className="text-[10px] px-2 py-1 rounded bg-destructive text-destructive-foreground font-medium">Sim</button>
                    <button onClick={() => setConfirmDelete(null)} className="text-[10px] px-2 py-1 rounded bg-muted text-foreground font-medium">Não</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(user.id)} className="h-7 w-7 rounded-md bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
