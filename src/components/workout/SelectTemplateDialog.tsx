
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
import { WorkoutTemplate } from "@/hooks/useWorkoutTemplates";

interface SelectTemplateDialogProps {
  templates: WorkoutTemplate[];
  onSelectTemplate: (template: WorkoutTemplate) => void;
  children: React.ReactNode;
}

export const SelectTemplateDialog = ({ templates, onSelectTemplate, children }: SelectTemplateDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (template: WorkoutTemplate) => {
    onSelectTemplate(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choisir un modèle</DialogTitle>
          <DialogDescription>
            Démarrez un entraînement à partir d'un de vos modèles enregistrés.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
        {templates.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Vous n'avez aucun modèle de séance.</p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {templates.map(template => (
              <Button
                key={template.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSelect(template)}
              >
                {template.name}
              </Button>
            ))}
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
