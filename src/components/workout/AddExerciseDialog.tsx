
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { groupedExercises } from "@/data/exercises";
import { PlusCircle } from "lucide-react";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";

interface AddExerciseDialogProps {
  onAddExercise: (exercise: { id: string; name: string }) => void;
}

export const AddExerciseDialog = ({ onAddExercise }: AddExerciseDialogProps) => {
  const [open, setOpen] = useState(false);
  const { workouts } = useWorkoutHistory();

  const exerciseFrequencies = useMemo(() => {
    const frequencies = new Map<string, number>();
    if (workouts) {
      workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          frequencies.set(exercise.exerciseId, (frequencies.get(exercise.exerciseId) || 0) + 1);
        });
      });
    }
    return frequencies;
  }, [workouts]);

  const sortedGroupedExercises = useMemo(() => {
    return groupedExercises.map(group => ({
      ...group,
      exercises: [...group.exercises].sort((a, b) => {
        const freqA = exerciseFrequencies.get(a.id) || 0;
        const freqB = exerciseFrequencies.get(b.id) || 0;
        if (freqB !== freqA) {
            return freqB - freqA;
        }
        return a.name.localeCompare(b.name);
      })
    }));
  }, [exerciseFrequencies]);

  const handleSelect = (exercise: { id: string; name: string }) => {
    onAddExercise(exercise);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <PlusCircle />
          Ajouter un exercice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choisir un exercice</DialogTitle>
          <DialogDescription>
            Recherchez un exercice ou parcourez les catégories. Les exercices les plus fréquents apparaissent en premier.
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Rechercher un exercice..." />
          <CommandList>
            <CommandEmpty>Aucun exercice trouvé.</CommandEmpty>
            {sortedGroupedExercises.map((group) => (
              <CommandGroup key={group.group}>
                <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-purple">{group.group}</div>
                {group.exercises.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.name}
                    onSelect={() => handleSelect(exercise)}
                  >
                    {exercise.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
