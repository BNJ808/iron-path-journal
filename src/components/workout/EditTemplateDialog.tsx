
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from 'nanoid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { WorkoutTemplate, ExerciseLog } from "@/hooks/useWorkoutTemplates";
import { AddExerciseDialog } from "./AddExerciseDialog";
import { Trash2 } from "lucide-react";

const TEMPLATE_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-cyan-500',
];

interface EditTemplateDialogProps {
  template: WorkoutTemplate;
  onUpdate: (id: string, name: string, exercises: ExerciseLog[], color?: string) => void;
  children: React.ReactNode;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Le nom du modèle est requis." }),
});

export const EditTemplateDialog = ({ template, onUpdate, children }: EditTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [exercises, setExercises] = useState<ExerciseLog[]>(template.exercises);
  const [selectedColor, setSelectedColor] = useState(template.color || TEMPLATE_COLORS[0]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: template.name },
  });

  const handleAddExercise = (exercise: { id: string; name: string }) => {
    const newExerciseLog: ExerciseLog = {
      id: nanoid(),
      exerciseId: exercise.id,
      name: exercise.name,
      sets: [{ id: nanoid(), reps: '8', weight: '10', completed: false }], // Default set
      notes: '',
    };
    setExercises(currentExercises => [...currentExercises, newExerciseLog]);
  };

  const handleRemoveExercise = (logId: string) => {
    setExercises(currentExercises => currentExercises.filter(ex => ex.id !== logId));
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onUpdate(template.id, values.name, exercises, selectedColor);
    form.reset({ name: values.name });
    setOpen(false);
  };
  
  const resetState = () => {
    form.reset({ name: template.name });
    setExercises(template.exercises);
    setSelectedColor(template.color || TEMPLATE_COLORS[0]);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetState();
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Modifier le modèle</DialogTitle>
          <DialogDescription>
            Modifiez le nom, la couleur et les exercices de votre modèle de séance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du modèle</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Push Day" {...field} autoFocus={false} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Couleur du modèle</Label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full ${color} border-2 ${
                      selectedColor === color ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Exercices</h4>
              <div className="space-y-2">
                {exercises.map(ex => (
                  <div key={ex.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                    <span>{ex.name}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveExercise(ex.id)}>
                      <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                  </div>
                ))}
                 {exercises.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Aucun exercice dans ce modèle.</p>}
              </div>
              <AddExerciseDialog onAddExercise={handleAddExercise} />
            </div>

            <DialogFooter className="mt-4 pt-4 border-t sticky bottom-0 bg-background">
                <DialogClose asChild>
                    <Button type="button" variant="outline">Annuler</Button>
                </DialogClose>
              <Button type="submit">Enregistrer les modifications</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
