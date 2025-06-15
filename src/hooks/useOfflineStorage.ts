
import { useState, useEffect } from 'react';
import type { Workout, ExerciseLog } from '@/types';

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

interface OfflineWorkout extends Workout {
  isOffline?: boolean;
  pendingSyncId?: string;
}

export const useOfflineStorage = () => {
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [offlineWorkouts, setOfflineWorkouts] = useState<OfflineWorkout[]>([]);

  // Charger les données hors ligne au démarrage
  useEffect(() => {
    const loadOfflineData = () => {
      try {
        const storedActions = localStorage.getItem('pendingWorkoutActions');
        const storedWorkouts = localStorage.getItem('offlineWorkouts');
        
        if (storedActions) {
          setPendingActions(JSON.parse(storedActions));
        }
        
        if (storedWorkouts) {
          setOfflineWorkouts(JSON.parse(storedWorkouts));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données hors ligne:', error);
      }
    };

    loadOfflineData();
  }, []);

  // Sauvegarder les actions en attente
  const savePendingAction = (action: Omit<PendingAction, 'id' | 'timestamp'>) => {
    const newAction: PendingAction = {
      ...action,
      id: `pending_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
    };
    
    const updatedActions = [...pendingActions, newAction];
    setPendingActions(updatedActions);
    
    try {
      localStorage.setItem('pendingWorkoutActions', JSON.stringify(updatedActions));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'action:', error);
    }
    
    return newAction.id;
  };

  // Sauvegarder un entraînement hors ligne
  const saveOfflineWorkout = (workout: Workout) => {
    const offlineWorkout: OfflineWorkout = {
      ...workout,
      isOffline: true,
      pendingSyncId: `offline_${Date.now()}_${Math.random()}`,
    };
    
    const updatedWorkouts = [...offlineWorkouts.filter(w => w.id !== workout.id), offlineWorkout];
    setOfflineWorkouts(updatedWorkouts);
    
    try {
      localStorage.setItem('offlineWorkouts', JSON.stringify(updatedWorkouts));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde hors ligne:', error);
    }
    
    return offlineWorkout;
  };

  // Supprimer une action en attente
  const removePendingAction = (actionId: string) => {
    const updatedActions = pendingActions.filter(a => a.id !== actionId);
    setPendingActions(updatedActions);
    
    try {
      localStorage.setItem('pendingWorkoutActions', JSON.stringify(updatedActions));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'action:', error);
    }
  };

  // Supprimer un entraînement hors ligne
  const removeOfflineWorkout = (workoutId: string) => {
    const updatedWorkouts = offlineWorkouts.filter(w => w.id !== workoutId);
    setOfflineWorkouts(updatedWorkouts);
    
    try {
      localStorage.setItem('offlineWorkouts', JSON.stringify(updatedWorkouts));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entraînement hors ligne:', error);
    }
  };

  // Nettoyer toutes les données hors ligne
  const clearOfflineData = () => {
    setPendingActions([]);
    setOfflineWorkouts([]);
    
    try {
      localStorage.removeItem('pendingWorkoutActions');
      localStorage.removeItem('offlineWorkouts');
    } catch (error) {
      console.error('Erreur lors du nettoyage des données hors ligne:', error);
    }
  };

  return {
    pendingActions,
    offlineWorkouts,
    savePendingAction,
    saveOfflineWorkout,
    removePendingAction,
    removeOfflineWorkout,
    clearOfflineData,
    hasPendingActions: pendingActions.length > 0,
    hasOfflineWorkouts: offlineWorkouts.length > 0,
  };
};
