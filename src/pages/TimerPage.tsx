
import { TimerView } from '@/components/timer/TimerView';

const TimerPage = () => {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
      <h1 className="text-2xl font-bold text-accent-green mb-6">Minuteur de Repos</h1>
      <TimerView />
    </div>
  );
};

export default TimerPage;
