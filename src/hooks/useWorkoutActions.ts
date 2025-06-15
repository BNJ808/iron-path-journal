
import { useWorkouts, type ExerciseLog } from '@/hooks/useWorkouts';
import { useWorkoutTemplates, type WorkoutTemplate } from '@/hooks/useWorkoutTemplates';
import { useExerciseLastPerformance } from '@/hooks/useExerciseLastPerformance';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import type { ExerciseSet } from '@/types';

export const useWorkoutActions = () => {
  const { todayWorkout, createWorkout, updateWorkout, deleteWorkout } = useWorkouts();
  const { createTemplate } = useWorkoutTemplates();
  const { getLastPerformances, updateLastPerformances } = useExerciseLastPerformance();

  const handleStartWorkout = async () => {
    try {
      await createWorkout({});
      toast.success("Entraînement commencé !");
    } catch (error: any) {
      toast.error("Erreur au démarrage de l'entraînement: " + error.message);
    }
  };

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
        await updateWorkout({ workoutId: todayWorkout.id, exercises: cleanedExercises, notes: todayWorkout.notes, status: 'completed' });
        toast.success("Entraînement terminé et sauvegardé !");
      } catch (error: any) {
        toast.error("Erreur à la sauvegarde de l'entraînement: " + error.message);
      }
  };

  const handleSaveAsTemplate = async (name:string) => {
    if(!todayWorkout || todayWorkout.exercises.length === 0) {
        toast.error("Ajoutez des exercices avant d'enregistrer un modèle.");
        return;
    }
    
    const templateExercises = todayWorkout.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({
            id: s.id,
            reps: Number(s.reps) || 0,
            weight: Number(s.weight) || 0,
        })).filter(s => s.reps > 0 || s.weight > 0),
        notes: ex.notes
    })).filter(ex => ex.sets.length > 0);

    if (templateExercises.length === 0) {
        toast.info("Veuillez remplir des séries avant d'enregistrer un modèle.");
        return;
    }

    try {
        await createTemplate({
            name,
            exercises: templateExercises,
            notes: todayWorkout.notes || ''
        });
        toast.success(`Modèle "${name}" enregistré !`);
    } catch (error:any) {
        toast.error("Erreur lors de l'enregistrement du modèle: " + error.message);
    }
  }

  const handleStartFromTemplate = async (template: WorkoutTemplate) => {
    if (todayWorkout) {
        toast.error("Un entraînement est déjà en cours.");
        return;
    }
    try {
        const exerciseIds = template.exercises.map(ex => ex.exerciseId);
        const lastPerformances = await getLastPerformances(exerciseIds);

        const newExercises = template.exercises.map(exercise => {
            const lastSets = lastPerformances[exercise.exerciseId];
            
            let newSets: ExerciseSet[];
            if (lastSets && lastSets.length > 0) {
                newSets = lastSets.map(set => ({ id: nanoid(), reps: String(set.reps), weight: String(set.weight), completed: false }));
            } else if (exercise.sets.length > 0) {
                newSets = exercise.sets.map(set => ({ id: nanoid(), reps: String(set.reps || ''), weight: String(set.weight), completed: false }));
            } else {
                newSets = [{ id: nanoid(), reps: '', weight: '', completed: false }];
            }

            return {
                id: nanoid(),
                exerciseId: exercise.exerciseId,
                name: exercise.name,
                notes: exercise.notes || '',
                sets: newSets
            };
        });

        await createWorkout({
            exercises: newExercises,
            notes: template.notes || ''
        });
        toast.success(`Entraînement démarré à partir de "${template.name}" !`);
    } catch (error: any) {
        toast.error("Erreur lors du démarrage de l'entraînement: " + error.message);
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
    handleAddExercise,
    handleUpdateExercise,
    handleUpdateWorkoutNotes,
    handleRemoveExercise,
    handleFinishWorkout,
    handleSaveAsTemplate,
    handleStartFromTemplate,
    handleCancelWorkout,
  };
};
