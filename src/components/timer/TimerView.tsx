import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Bell, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PRESET_DURATIONS = [
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '1m 30s', value: 90 },
  { label: '2m', value: 120 },
  { label: '3m', value: 180 },
];

// Fonction pour créer un son de notification simple
const createBeepSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

// Fonction pour jouer 3 beeps de suite
const playTripleBeep = () => {
  createBeepSound();
  setTimeout(() => createBeepSound(), 300);
  setTimeout(() => createBeepSound(), 600);
};

// Fonction pour demander la permission des notifications
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Fonction pour envoyer une notification
const sendNotification = () => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification('Iron Path Journal', {
      body: 'Votre temps de repos est terminé !',
      icon: '/placeholder.svg',
      badge: '/placeholder.svg',
      silent: false,
      requireInteraction: true
    });

    // Auto-fermer après 10 secondes
    setTimeout(() => {
      notification.close();
    }, 10000);
  }
};

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

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
    toast.info(soundEnabled ? 'Son désactivé' : 'Son activé');
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        toast.success('Notifications activées');
      } else {
        toast.error('Autorisation des notifications refusée');
      }
    } else {
      setNotificationsEnabled(false);
      toast.info('Notifications désactivées');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (timeLeft / duration) : 0;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Contrôles son et notifications */}
      <div className="mb-4 flex gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSound}
          className={cn(
            "flex items-center gap-2",
            soundEnabled ? "text-accent-green" : "text-gray-500"
          )}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {soundEnabled ? 'Son activé' : 'Son désactivé'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleNotifications}
          className={cn(
            "flex items-center gap-2",
            notificationsEnabled ? "text-accent-green" : "text-gray-500"
          )}
        >
          {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          {notificationsEnabled ? 'Notifications activées' : 'Notifications désactivées'}
        </Button>
      </div>

      {/* Cercle de progression et temps */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <svg className="absolute w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-700"
            stroke="currentColor"
            strokeWidth="4"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
          />
          <circle
            className="text-accent-green"
            stroke="currentColor"
            strokeWidth="4"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - progress)}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>
        <span className="text-6xl font-mono font-bold">{formatTime(timeLeft)}</span>
      </div>

      {/* Durées prédéfinies */}
      <p className="text-gray-400 mb-4">Choisissez une durée prédéfinie :</p>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {PRESET_DURATIONS.map(({ label, value }) => (
          <Button
            key={value}
            variant={duration === value ? 'default' : 'outline'}
            onClick={() => handleSetDuration(value)}
            className={cn(
              duration === value && 'bg-accent-green hover:bg-green-600 text-black border-accent-green'
            )}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Contrôles du timer */}
      <div className="flex gap-4">
        <Button onClick={handleStartPause} size="lg" className="w-40 bg-accent-blue hover:bg-blue-600 text-white font-bold">
          {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRunning ? 'Pause' : 'Démarrer'}
        </Button>
        <Button onClick={handleReset} variant="secondary" size="lg" className="px-4">
          <RotateCcw />
        </Button>
      </div>
    </div>
  );
};
