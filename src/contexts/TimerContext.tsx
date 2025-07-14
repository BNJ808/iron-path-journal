import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { playTripleBeep } from '@/utils/audioUtils';
import { sendNotification } from '@/utils/notificationUtils';

interface TimerContextType {
  duration: number;
  timeLeft: number;
  isRunning: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  setDuration: (duration: number) => void;
  setTimeLeft: (time: number) => void;
  setIsRunning: (running: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  startPause: () => void;
  reset: () => void;
  formatTime: (seconds: number) => string;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const handleTimerEnd = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
    startTimeRef.current = null;
    
    toast.info("Le temps est écoulé !");
    
    if (soundEnabled) {
      try {
        playTripleBeep();
      } catch (error) {
        console.log('Impossible de jouer le son:', error);
      }
    }

    if (notificationsEnabled) {
      sendNotification();
    }
  }, [soundEnabled, notificationsEnabled]);

  // Main timer logic
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

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
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, duration, handleTimerEnd]);

  // Page visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning && startTimeRef.current) {
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

  const startPause = () => {
    if (timeLeft > 0) {
      if (!isRunning) {
        startTimeRef.current = Date.now() - (duration - timeLeft) * 1000;
      }
      setIsRunning(prev => !prev);
    }
  };

  const reset = useCallback(() => {
    setTimeLeft(duration);
    setIsRunning(false);
    startTimeRef.current = null;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const value: TimerContextType = {
    duration,
    timeLeft,
    isRunning,
    soundEnabled,
    notificationsEnabled,
    setDuration: handleSetDuration,
    setTimeLeft,
    setIsRunning,
    setSoundEnabled,
    setNotificationsEnabled,
    startPause,
    reset,
    formatTime,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};