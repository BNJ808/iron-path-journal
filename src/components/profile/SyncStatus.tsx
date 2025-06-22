
import { useEffect, useState } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Cloud, CloudOff, Check, AlertCircle } from 'lucide-react';
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

  const getSyncStatusBadge = () => {
    if (!isOnline) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-red-400 border-red-400">
          <CloudOff className="h-3 w-3" />
          Hors ligne
        </Badge>
      );
    }

    if (isSyncing) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-blue-400 border-blue-400">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Synchronisation...
        </Badge>
      );
    }

    if (lastSyncTime) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-green-400 border-green-400">
          <Check className="h-3 w-3" />
          Synchronisé
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1 text-yellow-400 border-yellow-400">
        <AlertCircle className="h-3 w-3" />
        En attente
      </Badge>
    );
  };

  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Synchronisation multi-plateforme
          </div>
          {getSyncStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Vos paramètres sont automatiquement synchronisés sur tous vos appareils :</p>
          <ul className="mt-2 ml-4 list-disc space-y-1 text-xs">
            <li>Thème et couleurs</li>
            <li>Ordre des cartes de statistiques</li>
            <li>Plages de dates de filtrage</li>
            <li>Exercices favoris</li>
            <li>Paramètres du minuteur</li>
            <li>Préférences d'entraînement</li>
          </ul>
        </div>

        {lastSyncTime && (
          <div className="text-xs text-muted-foreground">
            Dernière synchronisation : {lastSyncTime.toLocaleString('fr-FR')}
          </div>
        )}

        <div className="flex gap-2">
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
        </div>

        {!isOnline && (
          <div className="text-xs text-yellow-400 bg-yellow-400/10 p-2 rounded">
            ⚠️ Hors ligne - La synchronisation reprendra automatiquement une fois connecté
          </div>
        )}
      </CardContent>
    </Card>
  );
};
