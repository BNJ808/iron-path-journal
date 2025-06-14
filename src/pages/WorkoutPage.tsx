import { useWorkouts, ExerciseLog } from '@/hooks/useWorkouts';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { useWorkoutTemplates, type WorkoutTemplate } from '@/hooks/useWorkoutTemplates';
import { useExerciseLastPerformance } from '@/hooks/useExerciseLastPerformance';
import { WorkoutInProgress } from '@/components/workout/WorkoutInProgress';
import { StartWorkout } from '@/components/workout/StartWorkout';
import { WorkoutLoadingSkeleton } from '@/components/workout/WorkoutLoadingSkeleton';
import type { ExerciseSet } from '@/types';

const WorkoutPage = () => {
  const { todayWorkout, isLoadingWorkout, createWorkout, updateWorkout, deleteWorkout } = useWorkouts();
  const { templates, isLoadingTemplates, createTemplate } = useWorkoutTemplates();
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

    const newSets = lastSets && lastSets.length > 0
        ? lastSets.map(set => ({ id: nanoid(), reps: String(set.reps), weight: String(set.weight) }))
        : [{ id: nanoid(), reps: '', weight: '' }];

    const newExerciseLog: ExerciseLog = {
      id: nanoid(),
      exerciseId: exercise.id,
      name: exercise.name,
      sets: newSets,
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
      // Note: This updates on every change. For a better UX, you might want to debounce this.
      await updateWorkout({ workoutId: todayWorkout.id, exercises: updatedExercises });
    } catch (error: any) {
      toast.error("Erreur à la mise à jour de l'exercice: " + error.message);
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
          sets: ex.sets.map(s => ({...s, id: s.id, reps: Number(s.reps) || 0, weight: Number(s.weight) || 0}))
                     .filter(s => s.reps > 0 || s.weight > 0)
      })).filter(ex => ex.sets.length > 0);

      const performancesToUpdate = cleanedExercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets as { id: string; reps: number; weight: number }[]
      }));

      try {
        if (performancesToUpdate.length > 0) {
            await updateLastPerformances(performancesToUpdate);
        }
        await updateWorkout({ workoutId: todayWorkout.id, exercises: cleanedExercises, status: 'completed' });
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
        })).filter(s => s.reps > 0 || s.weight > 0)
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
            
            let newSets;
            if (lastSets && lastSets.length > 0) {
                newSets = lastSets.map(set => ({ id: nanoid(), reps: String(set.reps), weight: String(set.weight) }));
            } else if (exercise.sets.length > 0) {
                newSets = exercise.sets.map(set => ({ id: nanoid(), reps: '', weight: String(set.weight) }));
            } else {
                newSets = [{ id: nanoid(), reps: '', weight: '' }];
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


  if (isLoadingWorkout) {
    return <WorkoutLoadingSkeleton />;
  }
  
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100">Entraînement du jour</h1>
      
      {todayWorkout ? (
        <WorkoutInProgress
          workout={todayWorkout}
          onAddExercise={handleAddExercise}
          onUpdateExercise={handleUpdateExercise}
          onRemoveExercise={handleRemoveExercise}
          onSaveAsTemplate={handleSaveAsTemplate}
          onFinishWorkout={handleFinishWorkout}
          onCancelWorkout={handleCancelWorkout}
        />
      ) : (
        <StartWorkout
          onStartWorkout={handleStartWorkout}
          onStartFromTemplate={handleStartFromTemplate}
          templates={templates}
          isLoadingTemplates={isLoadingTemplates}
        />
      )}
    </div>
  );
};

export default WorkoutPage;
