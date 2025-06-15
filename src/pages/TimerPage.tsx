
import { Timer } from 'lucide-react';

const TimerPage = () => {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
      <div className="flex items-center gap-2 mb-2">
        <Timer className="h-6 w-6 text-accent-green" />
        <h1 className="text-2xl font-bold text-muted-foreground">Minuteur</h1>
      </div>
      <p className="text-muted-foreground">Le minuteur est affiché dans la fenêtre.</p>
    </div>
  );
};

export default TimerPage;
