
import { useWorkouts, ExerciseLog } from '@/hooks/useWorkouts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AddExerciseDialog } from '@/components/workout/AddExerciseDialog';
import { ExerciseItem } from '@/components/workout/ExerciseItem';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { Save, Bookmark, List } from 'lucide-react';
import { useWorkoutTemplates, WorkoutTemplate } from '@/hooks/useWorkoutTemplates';
import { SaveTemplateDialog } from '@/components/workout/SaveTemplateDialog';
import { SelectTemplateDialog } from '@/components/workout/SelectTemplateDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const WorkoutPage = () => {
  const { todayWorkout, isLoadingWorkout, createWorkout, updateWorkout, deleteWorkout } = useWorkouts();
  const { templates, isLoadingTemplates, createTemplate } = useWorkoutTemplates();

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
        const newExercises = template.exercises.map(exercise => ({
            id: nanoid(),
            exerciseId: exercise.exerciseId,
            name: exercise.name,
            notes: exercise.notes || '',
            sets: exercise.sets.length > 0 
                ? exercise.sets.map(set => ({ id: nanoid(), reps: '', weight: set.weight }))
                : [{ id: nanoid(), reps: '', weight: '' }]
        }));

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
            <div className="text-center text-muted-foreground py-8 px-4 rounded-lg bg-secondary">
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
          
          <div className="border-t border-border pt-4"></div>

          <div className="flex flex-col sm:flex-row gap-2">
              <SaveTemplateDialog onSave={handleSaveAsTemplate}>
                  <Button variant="outline" className="w-full" disabled={todayWorkout.exercises.length === 0}>
                      <Bookmark className="mr-2 h-4 w-4" />
                      Enregistrer en modèle
                  </Button>
              </SaveTemplateDialog>
              <Button onClick={handleFinishWorkout} disabled={!todayWorkout || todayWorkout.exercises.length === 0} className="w-full bg-accent-blue hover:bg-accent-blue/90">
                  <Save className="mr-2 h-4 w-4" />
                  Terminer et Sauvegarder
              </Button>
          </div>
          
          <div className="mt-8 text-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="link" className="text-destructive hover:text-destructive/90">
                  Annuler l'entraînement en cours
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action ne peut pas être annulée. Cela supprimera définitivement votre entraînement en cours.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Retour</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelWorkout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Oui, annuler
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

        </div>
      ) : (
        <div className="text-center py-10 space-y-4">
          <p className="text-gray-400 mb-4">Aucun entraînement en cours pour aujourd'hui.</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={handleStartWorkout}>Démarrer un entraînement vide</Button>
            <SelectTemplateDialog templates={templates} onSelectTemplate={handleStartFromTemplate}>
                <Button variant="secondary" disabled={isLoadingTemplates || templates.length === 0}>
                    <List className="mr-2 h-4 w-4" />
                    Démarrer depuis un modèle
                </Button>
            </SelectTemplateDialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;
