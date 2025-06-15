
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { WorkoutTemplate } from "@/hooks/useWorkoutTemplates";
import { Pencil, Trash2 } from "lucide-react";
import { RenameTemplateDialog } from "./RenameTemplateDialog";

interface SelectTemplateDialogProps {
  templates: WorkoutTemplate[];
  onSelectTemplate: (template: WorkoutTemplate) => void;
  children: React.ReactNode;
  onUpdateTemplate: (id: string, name: string) => void;
  onDeleteTemplate: (id: string) => void;
}

export const SelectTemplateDialog = ({ templates, onSelectTemplate, children, onUpdateTemplate, onDeleteTemplate }: SelectTemplateDialogProps) => {
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
              <div key={template.id} className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start flex-1"
                  onClick={() => handleSelect(template)}
                >
                  {template.name}
                </Button>
                <RenameTemplateDialog template={template} onRename={onUpdateTemplate}>
                  <Button variant="ghost" size="icon" aria-label="Renommer le modèle">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </RenameTemplateDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Supprimer le modèle">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible et supprimera définitivement ce modèle.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteTemplate(template.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
