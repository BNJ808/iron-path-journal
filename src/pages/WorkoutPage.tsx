
import { useWorkouts, ExerciseLog } from '@/hooks/useWorkouts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AddExerciseDialog } from '@/components/workout/AddExerciseDialog';
import { ExerciseItem } from '@/components/workout/ExerciseItem';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { Save } from 'lucide-react';

const WorkoutPage = () => {
  const { todayWorkout, isLoadingWorkout, createWorkout, updateWorkout } = useWorkouts();

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

    const newExerciseLog: ExerciseLog = {
      id: nanoid(),
      exerciseId: exercise.id,
      name: exercise.name,
      sets: [{ id: nanoid(), reps: '', weight: '' }],
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
          sets: ex.sets.map(s => ({...s, reps: Number(s.reps) || 0, weight: Number(s.weight) || 0}))
                     .filter(s => s.reps > 0 || s.weight > 0)
      })).filter(ex => ex.sets.length > 0);

      try {
        await updateWorkout({ workoutId: todayWorkout.id, exercises: cleanedExercises });
        toast.success("Entraînement terminé et sauvegardé !");
      } catch (error: any) {
        toast.error("Erreur à la sauvegarde de l'entraînement: " + error.message);
      }
  };

  if (isLoadingWorkout) {
    return (
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100">Entraînement du jour</h1>
      
      {todayWorkout ? (
        <div className="space-y-4">
          {todayWorkout.exercises.length === 0 ? (
            <div className="text-center text-gray-400 py-8 px-4 rounded-lg bg-gray-800/50">
              <p>Commencez par ajouter un exercice à votre séance.</p>
            </div>
          ) : (
            todayWorkout.exercises.map(ex => (
              <ExerciseItem 
                key={ex.id} 
                exercise={ex} 
                onUpdate={handleUpdateExercise}
                onRemove={handleRemoveExercise}
              />
            ))
          )}

          <AddExerciseDialog onAddExercise={handleAddExercise} />
          
          <div className="border-t border-gray-700 pt-4"></div>

          <Button onClick={handleFinishWorkout} disabled={!todayWorkout || todayWorkout.exercises.length === 0} className="w-full bg-accent-blue hover:bg-accent-blue/90">
            <Save />
            Terminer et Sauvegarder
          </Button>

        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">Aucun entraînement en cours pour aujourd'hui.</p>
          <Button onClick={handleStartWorkout}>Démarrer un entraînement</Button>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;
