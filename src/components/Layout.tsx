
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { OfflineIndicator } from './OfflineIndicator';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header avec indicateur hors ligne */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-lg font-semibold">FitTracker</h1>
          <OfflineIndicator />
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      
      {/* Navigation du bas */}
      <BottomNav />
    </div>
  );
};

export default Layout;
