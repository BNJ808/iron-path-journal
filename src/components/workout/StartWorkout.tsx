
import { Button } from '@/components/ui/button';
import { List, Pencil, Trash2 } from 'lucide-react';
import type { WorkoutTemplate } from '@/hooks/useWorkoutTemplates';
import { RenameTemplateDialog } from './RenameTemplateDialog';
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

interface StartWorkoutProps {
  onStartWorkout: () => void;
  onStartFromTemplate: (template: WorkoutTemplate) => void;
  templates: WorkoutTemplate[];
  isLoadingTemplates: boolean;
  onUpdateTemplate: (id: string, name: string) => void;
  onDeleteTemplate: (id: string) => void;
}

export const StartWorkout = ({ onStartWorkout, onStartFromTemplate, templates, isLoadingTemplates, onUpdateTemplate, onDeleteTemplate }: StartWorkoutProps) => {
  return (
    <div className="text-center py-10 space-y-6">
      <p className="text-gray-400 mb-4">Aucun entraînement en cours pour aujourd'hui.</p>
      
      <Button onClick={onStartWorkout}>Démarrer un entraînement vide</Button>

      <div className="border-t border-border pt-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center justify-center gap-2">
            <List className="h-5 w-5" />
            Ou démarrer depuis un modèle
        </h2>
        {isLoadingTemplates ? (
            <p className="text-gray-400">Chargement des modèles...</p>
        ) : templates.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Vous n'avez aucun modèle de séance.</p>
        ) : (
          <div className="space-y-2 max-w-md mx-auto">
            {templates.map(template => (
              <div key={template.id} className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start flex-1"
                  onClick={() => onStartFromTemplate(template)}
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
    </div>
  );
};
