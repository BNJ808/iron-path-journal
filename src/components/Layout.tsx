
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Timer, X, User, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import BottomNav from './BottomNav';
import { OfflineIndicator } from './OfflineIndicator';
import { TimerDialog } from './timer/TimerDialog';
import RouteSeo from './RouteSeo';
import { useTimer } from '@/contexts/TimerContext';

const Layout = () => {
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const { isRunning, timeLeft, formatTime, reset } = useTimer();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <RouteSeo />

      {/* Header épuré */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-border/60">
        <div className="container mx-auto px-4 h-14 flex justify-between items-center">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-bold tracking-tight font-['Space_Grotesk']">Carnet Muscu</h1>
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Performance</span>
          </div>

          <div className="flex items-center gap-1">
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-sm font-mono font-semibold"
                >
                  <Timer className="h-3.5 w-3.5" />
                  <span>{formatTime(timeLeft)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="h-5 w-5 p-0 ml-0.5 hover:bg-primary/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTimerOpen(true)}
              className="h-9 w-9 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
              aria-label="Ouvrir le minuteur"
            >
              <Timer className="h-[18px] w-[18px]" />
            </Button>

            <Button asChild variant="ghost" size="sm" className="hidden sm:flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <a
                href="https://musclewiki.com/fr-fr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ouvrir MuscleWiki dans un nouvel onglet"
              >
                MuscleWiki
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>

            <OfflineIndicator />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="h-9 w-9 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
              aria-label="Profil"
            >
              <User className="h-[18px] w-[18px]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 pb-20">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Navigation du bas */}
      <BottomNav onTimerClick={() => setIsTimerOpen(true)} />

      {/* Dialog du timer */}
      <TimerDialog
        open={isTimerOpen}
        onOpenChange={setIsTimerOpen}
      />
    </div>
  );
};

export default Layout;
