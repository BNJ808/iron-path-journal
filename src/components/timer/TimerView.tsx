
import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Utiliser des références pour gérer le timer de manière plus précise
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Vérifier si les notifications sont disponibles et autorisées
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Fonction pour gérer la fin du timer
  const handleTimerEnd = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
    startTimeRef.current = null;
    
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
  }, [soundEnabled, notificationsEnabled]);

  // Timer principal utilisant une approche basée sur le temps réel
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Démarrer le timer avec l'heure actuelle
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        handleTimerEnd();
      }
    }, 100); // Vérifier plus fréquemment pour plus de précision

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, duration, handleTimerEnd]);

  // Gérer la visibilité de la page pour maintenir la précision du timer
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && startTimeRef.current) {
        // Page devient invisible, sauvegarder l'état
        console.log('Timer continue en arrière-plan');
      } else if (!document.hidden && isRunning && startTimeRef.current) {
        // Page redevient visible, recalculer le temps restant
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          handleTimerEnd();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, duration, handleTimerEnd]);

  const handleSetDuration = useCallback((newDuration: number) => {
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setIsRunning(false);
    startTimeRef.current = null;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleStartPause = () => {
    if (timeLeft > 0) {
      if (!isRunning) {
        // Redémarrer - réinitialiser le temps de départ
        startTimeRef.current = Date.now() - (duration - timeLeft) * 1000;
      }
      setIsRunning(prev => !prev);
    }
  };

  const handleReset = useCallback(() => {
    setTimeLeft(duration);
    setIsRunning(false);
    startTimeRef.current = null;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [duration]);

  // Nettoyage à la désactivation du composant
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
