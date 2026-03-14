import { useAppStore } from '@/lib/store';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';

const Index = () => {
  const currentUser = useAppStore(s => s.currentUser);
  return currentUser ? <DashboardPage /> : <LoginPage />;
};

export default Index;
