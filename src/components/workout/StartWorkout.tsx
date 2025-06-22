
import { Button } from '@/components/ui/button';
import { List, Pencil, Trash2, PlusCircle } from 'lucide-react';
import type { WorkoutTemplate, ExerciseLog } from '@/hooks/useWorkoutTemplates';
import { EditTemplateDialog } from './EditTemplateDialog';
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
import { CreateTemplateDialog } from './CreateTemplateDialog';

interface StartWorkoutProps {
  onStartWorkout: () => void;
  onStartFromTemplate: (template: WorkoutTemplate) => void;
  templates: WorkoutTemplate[];
  isLoadingTemplates: boolean;
  onUpdateTemplate: (id: string, name: string, exercises: ExerciseLog[]) => void;
  onDeleteTemplate: (id: string) => void;
  onCreateTemplate: (template: { name: string; exercises: ExerciseLog[] }) => Promise<any>;
}

export const StartWorkout = ({ onStartWorkout, onStartFromTemplate, templates, isLoadingTemplates, onUpdateTemplate, onDeleteTemplate, onCreateTemplate }: StartWorkoutProps) => {
  return (
    <div className="text-center py-10 space-y-6">
      <Button onClick={onStartWorkout}>Démarrer un entraînement de zéro</Button>

      <div className="border-t border-border pt-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center justify-center gap-2">
            <List className="h-5 w-5" />
            Démarrer depuis un modèle
        </h2>
        {isLoadingTemplates ? (
            <p className="text-gray-400">Chargement des modèles...</p>
        ) : (
          <>
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
                  <EditTemplateDialog template={template} onUpdate={onUpdateTemplate}>
                    <Button variant="ghost" size="icon" aria-label="Modifier le modèle">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </EditTemplateDialog>
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
            <div className="max-w-md mx-auto mt-4">
              <CreateTemplateDialog onCreate={onCreateTemplate}>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer un nouveau modèle
                </Button>
              </CreateTemplateDialog>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
