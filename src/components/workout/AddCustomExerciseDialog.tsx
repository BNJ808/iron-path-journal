
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EXERCISES_DATABASE } from '@/data/exercises';
import { Plus } from 'lucide-react';

const muscleGroups = Object.keys(EXERCISES_DATABASE);

const formSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }).max(50, { message: 'Le nom ne doit pas dépasser 50 caractères.' }),
  group: z.enum(muscleGroups as [string, ...string[]], {
    errorMap: () => ({ message: 'Veuillez sélectionner un groupe musculaire.' }),
  }),
});

interface AddCustomExerciseDialogProps {
  children: React.ReactNode;
  onExerciseCreated: (exercise: { id: string; name: string }) => void;
  addCustomExercise: (exercise: { name: string; group: string }) => { id: string; name: string };
}

export const AddCustomExerciseDialog = ({ children, onExerciseCreated, addCustomExercise }: AddCustomExerciseDialogProps) => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newExercise = addCustomExercise(values);
    if(newExercise) {
        onExerciseCreated(newExercise);
    }
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un exercice personnalisé</DialogTitle>
          <DialogDescription>
            Ajoutez un nouvel exercice qui sera disponible pour vos futurs entraînements.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'exercice</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Développé incliné à la machine" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Groupe musculaire</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un groupe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {muscleGroups.map(group => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Annuler</Button>
              </DialogClose>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter l'exercice
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
