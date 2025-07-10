
import { Button } from '@/components/ui/button';
import { List, PlusCircle } from 'lucide-react';
import type { WorkoutTemplate, ExerciseLog } from '@/hooks/useWorkoutTemplates';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { WorkoutTemplateCard } from './WorkoutTemplateCard';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';

interface StartWorkoutProps {
  onStartWorkout: () => void;
  onStartFromTemplate: (template: WorkoutTemplate) => void;
  templates: WorkoutTemplate[];
  isLoadingTemplates: boolean;
  onUpdateTemplate: (id: string, name: string, exercises: ExerciseLog[], color?: string) => void;
  onDeleteTemplate: (id: string) => void;
  onCreateTemplate: (template: { name: string; exercises: ExerciseLog[] }) => Promise<any>;
}

export const StartWorkout = ({ 
  onStartWorkout, 
  onStartFromTemplate, 
  templates, 
  isLoadingTemplates, 
  onUpdateTemplate, 
  onDeleteTemplate, 
  onCreateTemplate 
}: StartWorkoutProps) => {
  const [orderedTemplates, setOrderedTemplates] = useState(templates);

  useEffect(() => {
    setOrderedTemplates(templates);
  }, [templates]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedTemplates.findIndex(t => t.id === active.id);
      const newIndex = orderedTemplates.findIndex(t => t.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        setOrderedTemplates(arrayMove(orderedTemplates, oldIndex, newIndex));
      }
    }
  };

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
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedTemplates.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto mb-4">
                  {orderedTemplates.map(template => (
                    <div key={template.id} onClick={() => onStartFromTemplate(template)}>
                      <WorkoutTemplateCard
                        template={template}
                        onUpdate={onUpdateTemplate}
                        onDelete={onDeleteTemplate}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
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
