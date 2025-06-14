
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import { SelectTemplateDialog } from '@/components/workout/SelectTemplateDialog';
import type { WorkoutTemplate } from '@/hooks/useWorkoutTemplates';

interface StartWorkoutProps {
  onStartWorkout: () => void;
  onStartFromTemplate: (template: WorkoutTemplate) => void;
  templates: WorkoutTemplate[];
  isLoadingTemplates: boolean;
}

export const StartWorkout = ({ onStartWorkout, onStartFromTemplate, templates, isLoadingTemplates }: StartWorkoutProps) => {
  return (
    <div className="text-center py-10 space-y-4">
      <p className="text-gray-400 mb-4">Aucun entraînement en cours pour aujourd'hui.</p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button onClick={onStartWorkout}>Démarrer un entraînement vide</Button>
        <SelectTemplateDialog templates={templates} onSelectTemplate={onStartFromTemplate}>
            <Button variant="secondary" disabled={isLoadingTemplates || templates.length === 0}>
                <List className="mr-2 h-4 w-4" />
                Démarrer depuis un modèle
            </Button>
        </SelectTemplateDialog>
      </div>
    </div>
  );
};
