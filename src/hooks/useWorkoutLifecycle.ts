
import { useWorkouts } from '@/hooks/useWorkouts';
import { useExerciseLastPerformance } from '@/hooks/useExerciseLastPerformance';
import { toast } from 'sonner';

export const useWorkoutLifecycle = () => {
  const { todayWorkout, createWorkout, updateWorkout, deleteWorkout } = useWorkouts();
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

      const performancesToUpdate = cleanedExercises
        .map(ex => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets
                .filter(s => s.completed) // On met à jour les perfs seulement pour les séries cochées "Fait"
                .map(({ id, reps, weight }) => ({ id, reps, weight }))
        }))
        .filter(ex => ex.sets.length > 0);

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

  return {
    handleStartWorkout,
    handleFinishWorkout,
    handleCancelWorkout,
  };
};
