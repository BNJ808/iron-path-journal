
import { Wifi, WifiOff, Sync, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { cn } from '@/lib/utils';

export const OfflineIndicator = () => {
  const { isOnline, hasPendingActions, hasOfflineData, forcSync } = useOfflineSync();
  
  const showSyncButton = isOnline && (hasPendingActions || hasOfflineData);
  const showPendingBadge = !isOnline && (hasPendingActions || hasOfflineData);

  return (
    <div className="flex items-center gap-2">
      {/* Indicateur de connexion */}
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        isOnline 
          ? "bg-accent-green/20 text-accent-green" 
          : "bg-accent-red/20 text-accent-red"
      )}>
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>En ligne</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Hors ligne</span>
          </>
        )}
      </div>

      {/* Badge pour données en attente */}
      {showPendingBadge && (
        <Badge variant="outline" className="flex items-center gap-1 text-accent-yellow border-accent-yellow">
          <AlertCircle className="h-3 w-3" />
          En attente de sync
        </Badge>
      )}

      {/* Bouton de synchronisation manuelle */}
      {showSyncButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={forcSync}
          className="flex items-center gap-1 h-7 px-2"
        >
          <Sync className="h-3 w-3" />
          Synchroniser
        </Button>
      )}
    </div>
  );
};
