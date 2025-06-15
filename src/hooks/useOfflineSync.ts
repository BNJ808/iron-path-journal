
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useNetworkStatus } from './useNetworkStatus';
import { useOfflineStorage } from './useOfflineStorage';
import { useWorkouts } from './useWorkouts';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export const useOfflineSync = () => {
  const { isOnline } = useNetworkStatus();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { createWorkout, updateWorkout } = useWorkouts();
  const { 
    pendingActions, 
    offlineWorkouts, 
    removePendingAction, 
    removeOfflineWorkout,
    hasPendingActions 
  } = useOfflineStorage();

  // Synchroniser automatiquement quand on revient en ligne
  useEffect(() => {
    if (isOnline && user && (pendingActions.length > 0 || offlineWorkouts.length > 0)) {
      syncOfflineData();
    }
  }, [isOnline, user, pendingActions.length, offlineWorkouts.length]);

  const syncOfflineData = async () => {
    if (!isOnline || !user) return;

    let successCount = 0;
    let errorCount = 0;

    // Synchroniser les entraînements hors ligne
    for (const workout of offlineWorkouts) {
      try {
        if (workout.status === 'completed') {
          // Créer l'entraînement terminé
          await createWorkout({
            exercises: workout.exercises,
            notes: workout.notes,
          });
          
          // Puis le marquer comme terminé
          const createdWorkout = await createWorkout({
            exercises: workout.exercises,
            notes: workout.notes,
          });
          
          await updateWorkout({
            workoutId: createdWorkout.id,
            status: 'completed',
            ended_at: workout.ended_at,
          });
        } else {
          // Créer l'entraînement en cours
          await createWorkout({
            exercises: workout.exercises,
            notes: workout.notes,
          });
        }
        
        removeOfflineWorkout(workout.id);
        successCount++;
      } catch (error) {
        console.error('Erreur lors de la synchronisation de l\'entraînement:', error);
        errorCount++;
      }
    }

    // Synchroniser les actions en attente
    for (const action of pendingActions) {
      try {
        switch (action.type) {
          case 'create':
            await createWorkout(action.data);
            break;
          case 'update':
            await updateWorkout(action.data);
            break;
          default:
            console.warn('Type d\'action non supporté:', action.type);
        }
        
        removePendingAction(action.id);
        successCount++;
      } catch (error) {
        console.error('Erreur lors de la synchronisation de l\'action:', error);
        errorCount++;
      }
    }

    // Invalider les requêtes pour rafraîchir les données
    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['workouts', user.id] });
      queryClient.invalidateQueries({ queryKey: ['workout', 'today', user.id] });
    }

    // Afficher le résultat de la synchronisation
    if (successCount > 0 && errorCount === 0) {
      toast.success(`${successCount} élément(s) synchronisé(s) avec succès`);
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`${successCount} élément(s) synchronisé(s), ${errorCount} erreur(s)`);
    } else if (errorCount > 0) {
      toast.error(`Erreur lors de la synchronisation (${errorCount} échec(s))`);
    }
  };

  const forcSync = () => {
    if (!isOnline) {
      toast.error('Impossible de synchroniser hors ligne');
      return;
    }
    
    if (!hasPendingActions && offlineWorkouts.length === 0) {
      toast.info('Aucune donnée à synchroniser');
      return;
    }
    
    syncOfflineData();
  };

  return {
    isOnline,
    hasPendingActions,
    hasOfflineData: offlineWorkouts.length > 0,
    syncOfflineData,
    forcSync,
  };
};
