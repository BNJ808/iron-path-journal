import { useWorkouts as useOriginalWorkouts } from './useWorkouts';
import { useOfflineStorage } from './useOfflineStorage';
import { useNetworkStatus } from './useNetworkStatus';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import type { Workout, ExerciseLog } from '@/types';

// Export the type for other files to use
export type { ExerciseLog } from '@/types';

export const useOfflineWorkouts = () => {
  const originalHook = useOriginalWorkouts();
  const { isOnline } = useNetworkStatus();
  const { user } = useAuth();
  const { 
    saveOfflineWorkout, 
    savePendingAction, 
    offlineWorkouts 
  } = useOfflineStorage();

  // Fusionner les entraînements en ligne et hors ligne
  const getTodayWorkout = () => {
    if (originalHook.todayWorkout) {
      return originalHook.todayWorkout;
    }
    
    // Chercher un entraînement du jour dans le stockage hors ligne
    const today = new Date().toISOString().split('T')[0];
    return offlineWorkouts.find(w => 
      w.status === 'in-progress' && 
      w.date.startsWith(today)
    ) || null;
  };

  const createWorkout = async (newWorkout?: { exercises?: ExerciseLog[], notes?: string }) => {
    if (!user) throw new Error("User not authenticated");
    
    if (isOnline) {
      return originalHook.createWorkout(newWorkout);
    }
    
    // Mode hors ligne
    const offlineWorkout: Workout = {
      id: nanoid(),
      user_id: user.id,
      date: new Date().toISOString(),
      exercises: newWorkout?.exercises || [],
      notes: newWorkout?.notes,
      status: 'in-progress',
    };
    
    const savedWorkout = saveOfflineWorkout(offlineWorkout);
    savePendingAction({
      type: 'create',
      data: newWorkout,
    });
    
    toast.info("Entraînement créé hors ligne. Il sera synchronisé automatiquement.");
    return savedWorkout;
  };

  const updateWorkout = async (updatedWorkout: { 
    workoutId: string; 
    exercises?: ExerciseLog[], 
    notes?: string, 
    status?: string, 
    ended_at?: string | null 
  }) => {
    if (!user) throw new Error("User not authenticated");
    
    if (isOnline) {
      return originalHook.updateWorkout(updatedWorkout);
    }
    
    // Mode hors ligne
    const existingWorkout = getTodayWorkout();
    if (!existingWorkout) throw new Error("Aucun entraînement à mettre à jour");
    
    const updatedOfflineWorkout: Workout = {
      ...existingWorkout,
      exercises: updatedWorkout.exercises || existingWorkout.exercises,
      notes: updatedWorkout.notes !== undefined ? updatedWorkout.notes : existingWorkout.notes,
      status: updatedWorkout.status || existingWorkout.status,
      ended_at: updatedWorkout.ended_at !== undefined ? updatedWorkout.ended_at : existingWorkout.ended_at,
    };
    
    const savedWorkout = saveOfflineWorkout(updatedOfflineWorkout);
    savePendingAction({
      type: 'update',
      data: updatedWorkout,
    });
    
    if (updatedWorkout.status === 'completed') {
      toast.info("Entraînement terminé hors ligne. Il sera synchronisé automatiquement.");
    }
    
    return savedWorkout;
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    if (isOnline) {
      return originalHook.deleteWorkout(workoutId);
    }
    
    // Mode hors ligne - simplement supprimer du stockage local
    const offlineWorkout = offlineWorkouts.find(w => w.id === workoutId);
    if (offlineWorkout) {
      // Si c'est un entraînement créé hors ligne, on peut le supprimer directement
      toast.info("Entraînement supprimé du stockage local.");
    } else {
      // Si c'est un entraînement existant, on doit enregistrer l'action
      savePendingAction({
        type: 'delete',
        data: { workoutId },
      });
      toast.info("Suppression programmée. Sera effectuée lors de la synchronisation.");
    }
  };

  return {
    todayWorkout: getTodayWorkout(),
    isLoadingWorkout: originalHook.isLoadingWorkout,
    createWorkout,
    updateWorkout,
    deleteWorkout,
  };
};
