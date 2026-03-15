import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const users = useAppStore(s => s.users);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAppStore(s => s.login);

  const activeUsers = users.filter(u => !u.blocked);
  const selectedUser = activeUsers.find(u => u.id === selectedUserId);

  const handleLogin = () => {
    if (!selectedUser) return;
    if (selectedUser.blocked) {
      setError('Usuário bloqueado. Contate o administrador.');
      return;
    }
    if (selectedUser.password === password) {
      login(selectedUser);
    } else {
      setError('Senha incorreta');
      setPassword('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm shadow-card rounded-xl bg-card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold text-foreground">Farmácia Maternidade</h1>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Selecione seu usuário</label>
            <select
              value={selectedUserId}
              onChange={e => { setSelectedUserId(e.target.value); setError(''); setPassword(''); }}
              className="w-full h-10 px-3 rounded-lg bg-muted text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
            >
              <option value="">-- Selecione --</option>
              {activeUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role === 'enfermeiro' ? 'Enfermagem' : 'Farmácia'})
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Senha</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••"
                  className="w-full h-10 px-3 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                  maxLength={20}
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Entrar
              </motion.button>
            </motion.div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground/60 mt-6 text-center">
          Senha padrão: 1234
        </p>
      </motion.div>
    </div>
  );
}
