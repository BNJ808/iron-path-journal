
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { TimerDialog } from './timer/TimerDialog';
import { TooltipProvider } from '@/components/ui/tooltip';

const Layout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [lastPath, setLastPath] = useState('/workout');

  // Mettre à jour le dernier chemin seulement si ce n'est pas /timer
  useEffect(() => {
    if (location.pathname !== '/timer') {
      setLastPath(location.pathname);
    }
  }, [location.pathname]);

  // Gérer l'ouverture/fermeture du timer avec une transition fluide
  const handleTimerOpenChange = (open: boolean) => {
    setIsTimerOpen(open);
    if (!open && location.pathname === '/timer') {
      // Transition fluide vers la dernière page
      navigate(lastPath, { replace: true });
    }
  };

  // Intercepter la navigation vers /timer pour ouvrir le dialog immédiatement
  useEffect(() => {
    if (location.pathname === '/timer') {
      setIsTimerOpen(true);
      // Naviguer immédiatement vers la dernière page sans afficher TimerPage
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
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <main className="flex-grow pb-20 transition-opacity duration-200">
          <Outlet />
        </main>
        <BottomNav />
        <TimerDialog open={isTimerOpen} onOpenChange={handleTimerOpenChange} />
      </div>
    </TooltipProvider>
  );
};

export default Layout;
