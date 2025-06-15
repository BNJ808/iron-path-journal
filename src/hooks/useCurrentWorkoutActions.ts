
import { useOfflineWorkouts, type ExerciseLog } from '@/hooks/useOfflineWorkouts'; // Changer l'import
import { useExerciseLastPerformance } from '@/hooks/useExerciseLastPerformance';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import type { ExerciseSet } from '@/types';

export const useCurrentWorkoutActions = () => {
  const { todayWorkout, updateWorkout } = useOfflineWorkouts(); // Utiliser la version hors ligne
  const { getLastPerformances } = useExerciseLastPerformance();

  const handleAddExercise = async (exercise: { id: string; name: string }) => {
    if (!todayWorkout) return;

    const lastPerformances = await getLastPerformances([exercise.id]);
    const lastSets = lastPerformances[exercise.id];

    const newSets: ExerciseSet[] = lastSets && lastSets.length > 0
        ? lastSets.map(set => ({ id: nanoid(), reps: String(set.reps), weight: String(set.weight), completed: false }))
        : [{ id: nanoid(), reps: '', weight: '', completed: false }];

    const newExerciseLog: ExerciseLog = {
      id: nanoid(),
      exerciseId: exercise.id,
      name: exercise.name,
      sets: newSets,
      notes: '',
    };

    const updatedExercises = [...todayWorkout.exercises, newExerciseLog];
    
    try {
      await updateWorkout({ workoutId: todayWorkout.id, exercises: updatedExercises });
      toast.info(`"${exercise.name}" ajouté à l'entraînement.`);
    } catch (error: any) {
      toast.error("Erreur à l'ajout de l'exercice: " + error.message);
    }
  };

  const handleUpdateExercise = async (updatedExercise: ExerciseLog) => {
    if (!todayWorkout) return;
    const updatedExercises = todayWorkout.exercises.map(ex => 
      ex.id === updatedExercise.id ? updatedExercise : ex
    );
    try {
      await updateWorkout({ workoutId: todayWorkout.id, exercises: updatedExercises });
    } catch (error: any) {
      toast.error("Erreur à la mise à jour de l'exercice: " + error.message);
    }
  };

  const handleUpdateWorkoutNotes = async (notes: string) => {
    if (!todayWorkout) return;
    try {
        await updateWorkout({ workoutId: todayWorkout.id, notes });
    } catch (error: any) {
        toast.error("Erreur à la mise à jour des notes: " + error.message);
    }
  };
  
  const handleRemoveExercise = async (exerciseLogId: string) => {
      if (!todayWorkout) return;
      const updatedExercises = todayWorkout.exercises.filter(ex => ex.id !== exerciseLogId);
      try {
        await updateWorkout({ workoutId: todayWorkout.id, exercises: updatedExercises });
        toast.success("Exercice retiré.");
      } catch (error: any)        {
        toast.error("Erreur à la suppression de l'exercice: " + error.message);
      }
  };

  return {
    handleAddExercise,
    handleUpdateExercise,
    handleUpdateWorkoutNotes,
    handleRemoveExercise,
  };
};
