
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from './BottomNav';
import { OfflineIndicator } from './OfflineIndicator';
import { TimerDialog } from './timer/TimerDialog';

const Layout = () => {
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header avec indicateur hors ligne et timer */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Carnet Muscu</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTimerOpen(true)}
              className="flex items-center gap-1"
            >
              <Timer className="h-4 w-4" />
            </Button>
            <OfflineIndicator />
          </div>
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="flex-1 pb-20">
        <Outlet />
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
