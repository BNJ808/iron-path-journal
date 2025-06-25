
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Bell, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { requestNotificationPermission } from '@/utils/notificationUtils';

interface TimerSettingsProps {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  onToggleSound: () => void;
  onToggleNotifications: (enabled: boolean) => void;
}

export const TimerSettings = ({ 
  soundEnabled, 
  notificationsEnabled, 
  onToggleSound, 
  onToggleNotifications 
}: TimerSettingsProps) => {
  const handleToggleSound = () => {
    onToggleSound();
    toast.info(soundEnabled ? 'Son désactivé' : 'Son activé');
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        onToggleNotifications(true);
        toast.success('Notifications activées');
      } else {
        toast.error('Autorisation des notifications refusée');
      }
    } else {
      onToggleNotifications(false);
      toast.info('Notifications désactivées');
    }
  };

  return (
    <div className="mb-4 flex gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleSound}
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
        onClick={handleToggleNotifications}
        className={cn(
          "flex items-center gap-2",
          notificationsEnabled ? "text-accent-green" : "text-gray-500"
        )}
      >
        {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        {notificationsEnabled ? 'Notifications activées' : 'Notifications désactivées'}
      </Button>
    </div>
  );
};
