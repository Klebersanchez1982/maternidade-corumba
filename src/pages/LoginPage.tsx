import { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_USERS, User } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { Shield } from 'lucide-react';

const PASSWORDS: Record<string, string> = {
  '1': '1234',
  '2': '1234',
  '3': '1234',
};

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAppStore(s => s.login);

  const handleLogin = () => {
    if (!selectedUser) return;
    if (PASSWORDS[selectedUser.id] === password) {
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

        <p className="text-xs text-muted-foreground mb-4">Selecione seu usuário</p>

        <div className="space-y-1.5 mb-4">
          {MOCK_USERS.map(user => (
            <button
              key={user.id}
              onClick={() => { setSelectedUser(user); setError(''); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                selectedUser?.id === user.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent text-foreground'
              }`}
            >
              <span className="font-medium">{user.name}</span>
              <span className={`ml-2 text-xs ${
                selectedUser?.id === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}>
                {user.role === 'enfermeiro' ? 'Enfermagem' : 'Farmácia'}
              </span>
            </button>
          ))}
        </div>

        {selectedUser && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <label className="text-xs text-muted-foreground mb-1.5 block">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••"
              className="w-full h-10 px-3 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
            {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="w-full mt-3 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Entrar
            </motion.button>
          </motion.div>
        )}

        <p className="text-[10px] text-muted-foreground/60 mt-6 text-center">
          Senha padrão: 1234
        </p>
      </motion.div>
    </div>
  );
}
