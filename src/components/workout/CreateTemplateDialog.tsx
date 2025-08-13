
import { useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter, 
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddExerciseDialog } from "./AddExerciseDialog";
import type { ExerciseLog } from "@/types";
import { useExerciseOverrides } from "@/hooks/useExerciseOverrides";
import { Trash2 } from "lucide-react";

interface CreateTemplateDialogProps {
  children: React.ReactNode;
  onCreate: (template: { name: string; exercises: ExerciseLog[] }) => Promise<any>;
}

export const CreateTemplateDialog = ({ children, onCreate }: CreateTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const { overridesMap } = useExerciseOverrides();

  const handleAddExercise = (exercise: { id: string; name: string }) => {
    if (exercises.some(e => e.exerciseId === exercise.id)) {
      toast.info(`"${exercise.name}" est déjà dans le modèle.`);
      return;
    }
    const newExerciseLog: ExerciseLog = {
      id: nanoid(),
      exerciseId: exercise.id,
      name: overridesMap.get(exercise.id)?.override_name ?? exercise.name,
      sets: [],
      notes: '',
    };
    setExercises(prev => [...prev, newExerciseLog]);
  };

  const handleRemoveExercise = (logId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== logId));
  };

  const resetState = () => {
    setName("");
    setExercises([]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Veuillez donner un nom au modèle.");
      return;
    }
    if (exercises.length === 0) {
      toast.error("Veuillez ajouter au moins un exercice.");
      return;
    }

    try {
      await onCreate({ name, exercises });
      setOpen(false);
    } catch (error: any) {
      toast.error(`Erreur lors de la création du modèle: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetState();
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau modèle</DialogTitle>
          <DialogDescription>
            Nommez votre modèle et ajoutez les exercices que vous souhaitez inclure.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Ex: Push Day"
            />
          </div>
          <div className="space-y-2">
            <Label>Exercices</Label>
            <div className="h-48 w-full rounded-md border p-2 overflow-y-auto space-y-2">
              {exercises.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center p-4">Aucun exercice ajouté.</p>
              ) : (
                exercises.map(ex => (
                  <div key={ex.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                    <span>{overridesMap.get(ex.exerciseId)?.override_name ?? ex.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveExercise(ex.id)} aria-label="Supprimer l'exercice">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
          <AddExerciseDialog onAddExercise={handleAddExercise} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Annuler</Button>
          </DialogClose>
          <Button onClick={handleSave}>Enregistrer le modèle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
