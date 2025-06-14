
import { Outlet, useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const Layout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-grow pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
