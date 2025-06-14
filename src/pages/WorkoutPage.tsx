
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { nanoid } from 'nanoid';
import { EXERCISES_DATABASE } from '@/data/exercises';
import type { Exercise, MuscleGroup } from '@/types';

const WorkoutPage = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const today = new Date();

  const addExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      id: nanoid(),
      name: exerciseName,
      sets: [
        { id: nanoid(), reps: 0, weight: 0, isCompleted: false }
      ],
    };
    setExercises(prev => [...prev, newExercise]);
    setSheetOpen(false);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const muscleGroups = Object.keys(EXERCISES_DATABASE) as MuscleGroup[];

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
            <div key={exercise.id} className="custom-card p-4 flex justify-between items-center">
              <span className="font-semibold">{exercise.name}</span>
              <Button variant="ghost" size="icon" onClick={() => removeExercise(exercise.id)}>
                <Trash2 className="h-5 w-5 text-red-500" />
              </Button>
            </div>
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
          <div className="overflow-y-auto flex-grow pr-3">
            <Accordion type="single" collapsible className="w-full">
              {muscleGroups.map((group) => (
                <AccordionItem value={group} key={group}>
                  <AccordionTrigger>{group}</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col items-start">
                      {Object.values(EXERCISES_DATABASE[group]).flat().map(exName => (
                         <Button key={exName} variant="link" className="text-left justify-start w-full p-2 h-auto text-base text-foreground" onClick={() => addExercise(exName)}>
                           {exName}
                         </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default WorkoutPage;
