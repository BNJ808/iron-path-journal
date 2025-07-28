
import { useWorkouts } from '@/hooks/useWorkouts';
import { useWorkoutTemplates, type WorkoutTemplate } from '@/hooks/useWorkoutTemplates';
import { useExerciseLastPerformance } from '@/hooks/useExerciseLastPerformance';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import type { ExerciseSet } from '@/types';

export const useWorkoutTemplateActions = () => {
  const { todayWorkout, createWorkout } = useWorkouts();
  const { createTemplate } = useWorkoutTemplates();
  const { getLastPerformances, getLastNotes } = useExerciseLastPerformance();

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
        const lastNotes = await getLastNotes(exerciseIds);

        const newExercises = template.exercises.map(exercise => {
            const lastSets = lastPerformances[exercise.exerciseId];
            const previousNotes = lastNotes[exercise.exerciseId] || exercise.notes || '';
            
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
                notes: previousNotes,
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

  return {
    handleSaveAsTemplate,
    handleStartFromTemplate,
  };
};
