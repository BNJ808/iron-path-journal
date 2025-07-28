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

      // Créer deux Maps séparés pour les performances et les notes
      const performanceMap = new Map<string, { exerciseId: string; sets: any[] }>();
      const notesMap = new Map<string, { exerciseId: string; notes: string }>();

      cleanedExercises.forEach(ex => {
          const completedSets = ex.sets
              .filter(s => s.completed) // On met à jour les perfs seulement pour les séries cochées "Fait"
              .map(({ id, reps, weight }) => ({ id, reps, weight }));

          // Sauvegarder les performances si il y a des sets complétés
          if (completedSets.length > 0) {
              if (performanceMap.has(ex.exerciseId)) {
                  const existing = performanceMap.get(ex.exerciseId)!;
                  existing.sets = [...existing.sets, ...completedSets];
              } else {
                  performanceMap.set(ex.exerciseId, {
                      exerciseId: ex.exerciseId,
                      sets: completedSets
                  });
              }
          }

          // Sauvegarder les notes si elles existent et ne sont pas vides
          if (ex.notes && ex.notes.trim()) {
              notesMap.set(ex.exerciseId, {
                  exerciseId: ex.exerciseId,
                  notes: ex.notes.trim()
              });
          }
      });

      const performancesToUpdate = Array.from(performanceMap.values());
      const notesToUpdate = Array.from(notesMap.values());

      try {
        // Sauvegarder les performances avec sets
        if (performancesToUpdate.length > 0) {
            console.log('Saving performances with sets:', performancesToUpdate);
            await updateLastPerformances(performancesToUpdate as any);
        }
        
        // Sauvegarder seulement les notes pour les exercices qui en ont
        if (notesToUpdate.length > 0) {
            console.log('Saving notes only:', notesToUpdate);
            await updateLastPerformances(notesToUpdate.map(note => ({
                exerciseId: note.exerciseId,
                sets: [], // Sets vides pour indiquer qu'on ne veut pas écraser les performances
                notes: note.notes
            })) as any);
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
