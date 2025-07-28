import { useOfflineWorkouts } from '@/hooks/useOfflineWorkouts';
import { useExerciseLastPerformance } from '@/hooks/useExerciseLastPerformance';
import { toast } from 'sonner';

export const useWorkoutLifecycle = () => {
  const { todayWorkout, createWorkout, updateWorkout, deleteWorkout } = useOfflineWorkouts();
  const { updateLastPerformances } = useExerciseLastPerformance();

  const handleStartWorkout = async () => {
    try {
      await createWorkout({});
      toast.success("Entraînement commencé !");
    } catch (error: any) {
      toast.error("Erreur au démarrage de l'entraînement: " + error.message);
    }
  };

  const handleFinishWorkout = async () => {
      if(!todayWorkout) return;
      
      const cleanedExercises = todayWorkout.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(s => ({...s, id: s.id, reps: Number(s.reps) || 0, weight: Number(s.weight) || 0, completed: !!s.completed}))
                     .filter(s => s.reps > 0 || s.weight > 0)
      })).filter(ex => ex.sets.length > 0);

      // Créer un Map pour éviter les doublons d'exercices
      const performanceMap = new Map<string, { exerciseId: string; sets: any[]; notes?: string }>();

      cleanedExercises.forEach(ex => {
          const completedSets = ex.sets
              .filter(s => s.completed) // On met à jour les perfs seulement pour les séries cochées "Fait"
              .map(({ id, reps, weight }) => ({ id, reps, weight }));

          if (completedSets.length > 0) {
              // Si l'exercice existe déjà, on fusionne les sets
              if (performanceMap.has(ex.exerciseId)) {
                  const existing = performanceMap.get(ex.exerciseId)!;
                  existing.sets = [...existing.sets, ...completedSets];
                  // Garder les notes les plus récentes (non vides)
                  if (ex.notes && ex.notes.trim()) {
                      existing.notes = ex.notes;
                  }
              } else {
                  performanceMap.set(ex.exerciseId, {
                      exerciseId: ex.exerciseId,
                      sets: completedSets,
                      notes: ex.notes && ex.notes.trim() ? ex.notes : undefined
                  });
              }
          }
      });

      const performancesToUpdate = Array.from(performanceMap.values());

      try {
        if (performancesToUpdate.length > 0) {
            await updateLastPerformances(performancesToUpdate as any);
        }
        await updateWorkout({ 
            workoutId: todayWorkout.id, 
            exercises: cleanedExercises, 
            notes: todayWorkout.notes, 
            status: 'completed',
            ended_at: new Date().toISOString()
        });
        toast.success("Entraînement terminé et sauvegardé !");
      } catch (error: any) {
        toast.error("Erreur à la sauvegarde de l'entraînement: " + error.message);
      }
  };

  const handleCancelWorkout = async () => {
    if (!todayWorkout) return;
    try {
      await deleteWorkout(todayWorkout.id);
      toast.success("Entraînement annulé.");
    } catch (error: any) {
      toast.error("Erreur lors de l'annulation de l'entraînement: " + error.message);
    }
  };

  const handleValidateRunning = async () => {
    try {
      // Créer un entraînement vide pour la sortie running
      const workout = await createWorkout({
        exercises: [],
        notes: "RUNNING_SESSION" // Marqueur spécial pour identifier les sorties running
      });
      
      // Immédiatement le marquer comme terminé
      await updateWorkout({ 
        workoutId: workout.id, 
        exercises: [], 
        notes: "RUNNING_SESSION", // Garder le marqueur
        status: 'completed',
        ended_at: new Date().toISOString()
      });
      
      toast.success("Sortie running validée !");
    } catch (error: any) {
      toast.error("Erreur lors de la validation de la sortie running: " + error.message);
    }
  };

  return {
    handleStartWorkout,
    handleFinishWorkout,
    handleCancelWorkout,
    handleValidateRunning,
  };
};
