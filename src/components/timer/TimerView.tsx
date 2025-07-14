
import { TimerSettings } from './TimerSettings';
import { TimerDisplay } from './TimerDisplay';
import { TimerPresets } from './TimerPresets';
import { TimerControls } from './TimerControls';
import { useTimer } from '@/contexts/TimerContext';

export const TimerView = () => {
  const {
    duration,
    timeLeft,
    isRunning,
    soundEnabled,
    notificationsEnabled,
    setDuration,
    setSoundEnabled,
    setNotificationsEnabled,
    startPause,
    reset,
  } = useTimer();

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <TimerSettings
        soundEnabled={soundEnabled}
        notificationsEnabled={notificationsEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onToggleNotifications={setNotificationsEnabled}
      />

      <TimerDisplay timeLeft={timeLeft} duration={duration} />

      <TimerPresets
        currentDuration={duration}
        onDurationSelect={setDuration}
      />

      <TimerControls
        isRunning={isRunning}
        onStartPause={startPause}
        onReset={reset}
      />
    </div>
  );
};
