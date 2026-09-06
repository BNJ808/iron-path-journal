
import { Wifi, WifiOff, RotateCw, AlertCircle } from 'lucide-react';
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
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
        isOnline
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      )}>
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            <span className="hidden sm:inline">En ligne</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span className="hidden sm:inline">Hors ligne</span>
          </>
        )}
      </div>

      {/* Badge pour données en attente */}
      {showPendingBadge && (
        <Badge variant="outline" className="flex items-center gap-1 text-yellow-700 border-yellow-400 bg-yellow-50">
          <AlertCircle className="h-3 w-3" />
          <span className="hidden sm:inline">En attente</span>
        </Badge>
      )}

      {/* Bouton de synchronisation manuelle */}
      {showSyncButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={forcSync}
          className="flex items-center gap-1 h-7 px-2 text-xs font-semibold"
        >
          <RotateCw className="h-3 w-3" />
          <span className="hidden sm:inline">Sync</span>
        </Button>
      )}
    </div>
  );
};
