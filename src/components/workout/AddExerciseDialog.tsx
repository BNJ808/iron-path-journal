
import { useState } from "react";
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

interface AddExerciseDialogProps {
  onAddExercise: (exercise: { id: string; name: string }) => void;
}

export const AddExerciseDialog = ({ onAddExercise }: AddExerciseDialogProps) => {
  const [open, setOpen] = useState(false);

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
            Recherchez un exercice ou parcourez les catégories.
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Rechercher un exercice..." />
          <CommandList>
            <CommandEmpty>Aucun exercice trouvé.</CommandEmpty>
            {groupedExercises.map((group) => (
              <CommandGroup key={group.group} heading={group.group}>
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
