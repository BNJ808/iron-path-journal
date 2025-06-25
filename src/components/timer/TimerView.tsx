
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { playTripleBeep } from '@/utils/audioUtils';
import { sendNotification } from '@/utils/notificationUtils';
import { TimerSettings } from './TimerSettings';
import { TimerDisplay } from './TimerDisplay';
import { TimerPresets } from './TimerPresets';
import { TimerControls } from './TimerControls';

export const TimerView = () => {
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Vérifier si les notifications sont disponibles et autorisées
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      setIsRunning(false);
      toast.info("Le temps est écoulé !");
      
      // Jouer le son si activé
      if (soundEnabled) {
        try {
          playTripleBeep();
        } catch (error) {
          console.log('Impossible de jouer le son:', error);
        }
      }

      // Envoyer une notification si autorisée
      if (notificationsEnabled) {
        sendNotification();
      }
      
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft, soundEnabled, notificationsEnabled]);

  const handleSetDuration = useCallback((newDuration: number) => {
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setIsRunning(false);
  }, []);

  const handleStartPause = () => {
    if (timeLeft > 0) {
      setIsRunning(prev => !prev);
    }
  };

  const handleReset = useCallback(() => {
    setTimeLeft(duration);
    setIsRunning(false);
  }, [duration]);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <TimerSettings
        soundEnabled={soundEnabled}
        notificationsEnabled={notificationsEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
        onToggleNotifications={setNotificationsEnabled}
      />

      <TimerDisplay timeLeft={timeLeft} duration={duration} />

      <TimerPresets
        currentDuration={duration}
        onDurationSelect={handleSetDuration}
      />

      <TimerControls
        isRunning={isRunning}
        onStartPause={handleStartPause}
        onReset={handleReset}
      />
    </div>
  );
};
