
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
}

export const TimerControls = ({ isRunning, onStartPause, onReset }: TimerControlsProps) => {
  return (
    <div className="flex gap-4">
      <Button onClick={onStartPause} size="lg" className="w-40 bg-accent-blue hover:bg-blue-600 text-white font-bold">
        {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
        {isRunning ? 'Pause' : 'Démarrer'}
      </Button>
      <Button onClick={onReset} variant="secondary" size="lg" className="px-4">
        <RotateCcw />
      </Button>
    </div>
  );
};
