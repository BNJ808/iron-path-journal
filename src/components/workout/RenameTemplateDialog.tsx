
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { WorkoutTemplate } from "@/hooks/useWorkoutTemplates";

interface RenameTemplateDialogProps {
  template: WorkoutTemplate;
  onRename: (id: string, name: string) => void;
  children: React.ReactNode;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Le nom du modèle est requis." }),
});

export const RenameTemplateDialog = ({ template, onRename, children }: RenameTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: template.name },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onRename(template.id, values.name);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) form.reset({ name: template.name });
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Renommer le modèle</DialogTitle>
              <DialogDescription>
                Modifiez le nom de votre modèle de séance.
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau nom du modèle</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Push Day" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Annuler</Button>
                </DialogClose>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
