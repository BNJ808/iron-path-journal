
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
import { PlusCircle, Star } from "lucide-react";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useFavoriteExercises } from "@/hooks/useFavoriteExercises";

interface AddExerciseDialogProps {
  onAddExercise: (exercise: { id: string; name: string }) => void;
}

export const AddExerciseDialog = ({ onAddExercise }: AddExerciseDialogProps) => {
  const [open, setOpen] = useState(false);
  const { workouts } = useWorkoutHistory();
  const { isFavorite, toggleFavorite } = useFavoriteExercises();

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
        const aIsFavorite = isFavorite(a.id);
        const bIsFavorite = isFavorite(b.id);
        if (aIsFavorite !== bIsFavorite) {
            return bIsFavorite ? 1 : -1;
        }

        const freqA = exerciseFrequencies.get(a.id) || 0;
        const freqB = exerciseFrequencies.get(b.id) || 0;
        if (freqB !== freqA) {
            return freqB - freqA;
        }
        return a.name.localeCompare(b.name);
      })
    }));
  }, [exerciseFrequencies, isFavorite]);

  const handleSelect = (exercise: { id: string; name: string }) => {
    onAddExercise(exercise);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-accent-blue hover:bg-accent-blue/90 text-primary-foreground">
          <PlusCircle />
          Ajouter un exercice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choisir un exercice</DialogTitle>
          <DialogDescription>
            Recherchez un exercice ou parcourez les catégories. Les exercices favoris et les plus fréquents apparaissent en premier.
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Rechercher un exercice..." />
          <CommandList>
            <CommandEmpty>Aucun exercice trouvé.</CommandEmpty>
            {sortedGroupedExercises.map((group) => (
              <CommandGroup key={group.group}>
                <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-yellow">{group.group}</div>
                {group.exercises.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.name}
                    onSelect={() => handleSelect(exercise)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{exercise.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(exercise.id);
                        }}
                        className="p-1 -m-1 rounded-full hover:bg-accent"
                        aria-label={isFavorite(exercise.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Star className={`h-4 w-4 transition-colors ${isFavorite(exercise.id) ? 'text-accent-yellow fill-accent-yellow' : 'text-foreground fill-transparent'}`} />
                      </button>
                    </div>
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
