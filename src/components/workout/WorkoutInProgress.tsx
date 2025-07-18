
import { useMemo } from 'react';
import type { Workout, ExerciseLog } from '@/types';
import { Button } from '@/components/ui/button';
import { AddExerciseDialog } from '@/components/workout/AddExerciseDialog';
import { ExerciseItem } from '@/components/workout/ExerciseItem';
import { Save, Bookmark, StickyNote } from 'lucide-react';
import { SaveTemplateDialog } from '@/components/workout/SaveTemplateDialog';
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
import { Textarea } from '@/components/ui/textarea';
import { useExerciseDatabase } from '@/hooks/useExerciseDatabase';
import { MUSCLE_GROUP_COLORS } from '@/data/exercises';

interface WorkoutInProgressProps {
  workout: Workout;
  onAddExercise: (exercise: { id: string; name: string }) => void;
  onUpdateExercise: (updatedExercise: ExerciseLog) => void;
  onRemoveExercise: (exerciseLogId: string) => void;
  onUpdateWorkoutNotes: (notes: string) => void;
  onSaveAsTemplate: (name: string) => void;
  onFinishWorkout: () => void;
  onCancelWorkout: () => void;
}

export const WorkoutInProgress = ({
  workout,
  onAddExercise,
  onUpdateExercise,
  onRemoveExercise,
  onUpdateWorkoutNotes,
  onSaveAsTemplate,
  onFinishWorkout,
  onCancelWorkout,
}: WorkoutInProgressProps) => {
  const { getGroupForExercise } = useExerciseDatabase();

  const groupedWorkoutExercises = useMemo(() => {
    const groups: Record<string, ExerciseLog[]> = {};
    workout.exercises.forEach(exercise => {
      const groupName = getGroupForExercise(exercise.exerciseId) || 'Autres';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(exercise);
    });
    return Object.entries(groups).sort(([groupA], [groupB]) => groupA.localeCompare(groupB));
  }, [workout.exercises, getGroupForExercise]);

  const hasUncompletedSets = useMemo(() => {
    if (!workout || !workout.exercises) return false;
    // Une série non complétée a des données mais n'est pas marquée comme terminée.
    return workout.exercises.some(ex =>
      ex.sets.some(s => !s.completed && (String(s.reps).trim() || String(s.weight).trim()))
    );
  }, [workout]);

  return (
    <div className="space-y-4">
      {workout.exercises.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 px-4 rounded-lg bg-secondary">
          <p>Commencez par ajouter un exercice à votre séance.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedWorkoutExercises.map(([groupName, exercises]) => (
            <div key={groupName}>
              <h3 className={`text-lg font-semibold uppercase tracking-wider mb-3 ${MUSCLE_GROUP_COLORS[groupName] || 'text-accent-yellow'}`}>{groupName}</h3>
              <div className="space-y-4">
                {exercises.map(ex => (
                  <ExerciseItem 
                    key={ex.id} 
                    exercise={ex} 
                    onUpdate={onUpdateExercise}
                    onRemove={onRemoveExercise}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddExerciseDialog onAddExercise={onAddExercise} />
      
      <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="workout-notes" className="flex items-center gap-2 font-semibold text-sm text-gray-300">
                <StickyNote className="h-4 w-4 text-accent-yellow" />
                Notes sur la séance
            </label>
            <Textarea
                id="workout-notes"
                placeholder="Comment vous sentez-vous ? Des remarques sur votre énergie, des douleurs..."
                value={workout.notes || ''}
                onChange={(e) => onUpdateWorkoutNotes(e.target.value)}
                rows={3}
                className="text-base"
            />
          </div>
      </div>

      <div className="border-t border-border pt-4"></div>

      <div className="flex flex-col sm:flex-row gap-2">
          <SaveTemplateDialog onSave={onSaveAsTemplate}>
              <Button variant="outline" className="w-full" disabled={workout.exercises.length === 0}>
                  <Bookmark className="mr-2 h-4 w-4 text-accent-purple" />
                  Enregistrer en modèle
              </Button>
          </SaveTemplateDialog>
          
          {hasUncompletedSets ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={workout.exercises.length === 0} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Terminer et Sauvegarder
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Terminer l'entraînement ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Une ou plusieurs séries n'ont pas été marquées comme faites. Elles n'influenceront pas vos records ou statistiques. Voulez-vous continuer ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Retour</AlertDialogCancel>
                  <AlertDialogAction onClick={onFinishWorkout}>
                    Oui, terminer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button onClick={onFinishWorkout} disabled={workout.exercises.length === 0} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Terminer et Sauvegarder
            </Button>
          )}
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
              <AlertDialogAction onClick={onCancelWorkout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Oui, annuler
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
