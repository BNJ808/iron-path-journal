
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { TimerDialog } from './timer/TimerDialog';

const Layout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [lastPath, setLastPath] = useState('/');

  useEffect(() => {
    if (location.pathname !== '/timer') {
      setLastPath(location.pathname);
    }
  }, [location.pathname]);

  const handleTimerOpenChange = (open: boolean) => {
    setIsTimerOpen(open);
    if (!open && location.pathname === '/timer') {
      navigate(lastPath, { replace: true });
    }
  };

  useEffect(() => {
    if (location.pathname === '/timer') {
      setIsTimerOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/timer') {
      setIsTimerOpen(true);
      navigate(lastPath, { replace: true });
    }
  }, [location.pathname, navigate, lastPath]);

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
      <TimerDialog open={isTimerOpen} onOpenChange={handleTimerOpenChange} />
    </div>
  );
};

export default Layout;
