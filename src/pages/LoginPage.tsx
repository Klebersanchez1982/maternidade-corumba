import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Shield } from 'lucide-react';
import { User } from '@/lib/data';

const DEV_USER: User = {
  id: '__dev__',
  name: 'Desenvolvedor',
  role: 'enfermeiro',
  password: 'dev@@2026',
  blocked: false,
  isAdmin: true,
  canInventory: true,
};

export default function LoginPage() {
  const users = useAppStore(s => s.users);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [devMode, setDevMode] = useState(false);
  const [devTapCount, setDevTapCount] = useState(0);
  const login = useAppStore(s => s.login);

  const activeUsers = users.filter(u => !u.blocked);
  const selectedUser = devMode ? DEV_USER : activeUsers.find(u => u.id === selectedUserId);

  const handleTitleTap = () => {
    const newCount = devTapCount + 1;
    setDevTapCount(newCount);
    if (newCount >= 7) {
      setDevMode(true);
      setSelectedUserId('');
      setPassword('');
      setError('');
      setDevTapCount(0);
    }
    setTimeout(() => setDevTapCount(0), 3000);
  };

  const handleLogin = () => {
    if (!selectedUser) return;

    if (devMode) {
      if (password === DEV_USER.password) {
        login(DEV_USER);
      } else {
        setError('Senha incorreta');
        setPassword('');
      }
      return;
    }

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
        <div className="flex items-center gap-2 mb-6 cursor-default select-none" onClick={handleTitleTap}>
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold text-foreground">Farmácia Maternidade</h1>
        </div>

        <div className="space-y-3">
          {!devMode ? (
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Selecione seu usuário</label>
              <select
                value={selectedUserId}
                onChange={e => { setSelectedUserId(e.target.value); setError(''); setPassword(''); }}
                className="w-full h-10 px-3 rounded-lg bg-muted text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
              >
                <option value="">-- Selecione --</option>
                {activeUsers.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role === 'enfermeiro' ? 'Enfermagem' : user.role === 'tecnico' ? 'Técnico(a)' : 'Farmácia'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-primary/5 rounded-lg p-3">
              <p className="text-xs text-primary font-medium">Acesso Desenvolvedor</p>
            </div>
          )}

          {(selectedUser || devMode) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Senha</label>
                <input
                  type="password"
                  inputMode={devMode ? undefined : "numeric"}
                  pattern={devMode ? undefined : "[0-9]*"}
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
              {devMode && (
                <button
                  onClick={() => { setDevMode(false); setPassword(''); setError(''); }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  Voltar ao login normal
                </button>
              )}
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