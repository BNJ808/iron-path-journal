
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Timer, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import BottomNav from './BottomNav';
import { OfflineIndicator } from './OfflineIndicator';
import { TimerDialog } from './timer/TimerDialog';
import { useTimer } from '@/contexts/TimerContext';

const Layout = () => {
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const { isRunning, timeLeft, formatTime, reset } = useTimer();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header avec indicateur hors ligne et timer */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Carnet Muscu</h1>
          <div className="flex items-center gap-2">
            {isRunning && (
              <div className="flex items-center gap-1 bg-accent-green/20 text-accent-green px-2 py-1 rounded-md text-sm font-mono">
                <Timer className="h-3 w-3" />
                <span>{formatTime(timeLeft)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="h-5 w-5 p-0 ml-1 hover:bg-accent-green/30"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTimerOpen(true)}
              className="flex items-center gap-1"
            >
              <Timer className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href="https://musclewiki.com/fr-fr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ouvrir MuscleWiki dans un nouvel onglet"
              >
                MuscleWiki
              </a>
            </Button>
            <OfflineIndicator />
          </div>
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
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
