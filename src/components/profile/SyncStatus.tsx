
import { useEffect, useState } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Cloud } from 'lucide-react';
import { toast } from 'sonner';

export const SyncStatus = () => {
  const { settings, isLoading, syncFromLocalStorage } = useUserSettings();
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Auto-sync au démarrage si en ligne
  useEffect(() => {
    if (isOnline && !isLoading && settings) {
      handleSync();
    }
  }, [isOnline, isLoading, settings]);

  const handleSync = async () => {
    if (!isOnline) {
      toast.error('Impossible de synchroniser hors ligne');
      return;
    }

    setIsSyncing(true);
    try {
      await syncFromLocalStorage();
      setLastSyncTime(new Date());
      toast.success('Paramètres synchronisés avec succès');
    } catch (error: any) {
      toast.error('Erreur lors de la synchronisation: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Cloud className="h-5 w-5 text-primary" />
          Synchronisation multi-plateforme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastSyncTime && (
          <div className="text-sm text-muted-foreground">
            Dernière synchronisation : {lastSyncTime.toLocaleString('fr-FR')}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing || !isOnline}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
        </Button>
      </CardContent>
    </Card>
  );
};
