
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EXERCISES_DATABASE } from '@/data/exercises';
import type { MuscleGroup } from '@/types';
import ExerciseCard from '@/components/ExerciseCard';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { toast } from 'sonner';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import { useAuth } from '@/contexts/AuthContext';

const WorkoutPage = () => {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const today = new Date();
  const { addWorkout } = useWorkoutHistory();
  const { user } = useAuth();
  const {
    exercises,
    notes: workoutNotes,
    addExercise: addExerciseToWorkout,
    removeExercise,
    updateExercise,
    setNotes: setWorkoutNotes,
    clearWorkout,
  } = useCurrentWorkout();

  const addExercise = (exerciseName: string) => {
    addExerciseToWorkout(exerciseName);
    setSheetOpen(false);
    setSearchTerm('');
  };

  const finishWorkout = () => {
    if (exercises.length === 0) {
      toast.error("Impossible de terminer une séance vide.");
      return;
    }
    if (!user) {
        toast.error("Vous devez être connecté pour sauvegarder une séance.");
        return;
    }

    const workout = {
      date: today.toISOString(),
      exercises: exercises,
      notes: workoutNotes,
    };
    
    addWorkout(workout, {
      onSuccess: () => {
        toast.success("Séance terminée et sauvegardée !");
        clearWorkout();
      },
      onError: (error) => {
        toast.error(`Erreur lors de la sauvegarde: ${error.message}`);
      }
    });
  };

  const muscleGroups = Object.keys(EXERCISES_DATABASE) as MuscleGroup[];

  const filteredExercisesByGroup = muscleGroups.map(group => {
    const exercisesInGroup = Object.values(EXERCISES_DATABASE[group]).flat();
    const filtered = exercisesInGroup.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
    return { group, exercises: filtered };
  }).filter(g => g.exercises.length > 0);


  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-accent-blue">Séance du jour</h1>
        <p className="text-gray-400 mt-1 capitalize">
          {format(today, "eeee d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {exercises.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun exercice ajouté pour le moment.</p>
        ) : (
          exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onUpdateExercise={updateExercise}
              onRemoveExercise={removeExercise}
            />
          ))
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Ajouter un exercice
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80%] flex flex-col">
          <SheetHeader>
            <SheetTitle>Choisir un exercice</SheetTitle>
          </SheetHeader>
          <div className="px-3 pt-2 pb-4">
            <input
              type="text"
              placeholder="Rechercher un exercice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none"
            />
          </div>
          <div className="overflow-y-auto flex-grow pr-3">
            <Accordion 
              type="single" 
              collapsible 
              className="w-full"
              // Ouvre le premier groupe si la recherche donne des résultats
              value={searchTerm && filteredExercisesByGroup.length > 0 ? filteredExercisesByGroup[0].group : undefined}
            >
              {filteredExercisesByGroup.length > 0 ? (
                filteredExercisesByGroup.map(({ group, exercises }) => (
                  <AccordionItem value={group} key={group}>
                    <AccordionTrigger>{group}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col items-start">
                        {exercises.map(exName => (
                           <Button key={exName} variant="link" className="text-left justify-start w-full p-2 h-auto text-base text-foreground" onClick={() => addExercise(exName)}>
                             {exName}
                           </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <p className="text-center text-gray-500 py-6">Aucun exercice ne correspond à votre recherche.</p>
              )}
            </Accordion>
          </div>
        </SheetContent>
      </Sheet>

      <div className="mt-6">
        <Label htmlFor="workout-notes" className="text-lg font-semibold text-gray-300 mb-2 block">
            Notes de la séance
        </Label>
        <Textarea
            id="workout-notes"
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            placeholder="Ajouter des notes générales sur la séance (ex: niveau d'énergie, etc.)"
            className="bg-gray-700/50 border-gray-600/50 min-h-[100px]"
            rows={3}
        />
      </div>

      <Button 
        className="w-full mt-6 bg-accent-blue hover:bg-blue-600 text-white font-bold" 
        onClick={finishWorkout} 
        disabled={exercises.length === 0}
      >
        Terminer la séance
      </Button>
    </div>
  );
};

export default WorkoutPage;
