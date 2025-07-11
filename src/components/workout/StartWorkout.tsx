
import { Button } from '@/components/ui/button';
import { List, PlusCircle } from 'lucide-react';
import type { WorkoutTemplate, ExerciseLog } from '@/hooks/useWorkoutTemplates';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { WorkoutTemplateCard } from './WorkoutTemplateCard';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
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
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // Conserver l'ordre existant si il y en a un, sinon utiliser l'ordre par défaut
    if (orderedTemplates.length === 0 || orderedTemplates.length !== templates.length) {
      setOrderedTemplates(templates);
    } else {
      // Mettre à jour les données tout en conservant l'ordre
      const updatedTemplates = orderedTemplates.map(orderedTemplate => {
        const updatedTemplate = templates.find(t => t.id === orderedTemplate.id);
        return updatedTemplate || orderedTemplate;
      }).filter(template => templates.some(t => t.id === template.id));
      
      // Ajouter les nouveaux templates à la fin
      const newTemplates = templates.filter(t => !orderedTemplates.some(ot => ot.id === t.id));
      setOrderedTemplates([...updatedTemplates, ...newTemplates]);
    }
  }, [templates]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setOrderedTemplates((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const activeTemplate = activeId ? orderedTemplates.find(t => t.id === activeId) : null;

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
            <DndContext 
              collisionDetection={closestCenter} 
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <SortableContext items={orderedTemplates.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-w-6xl mx-auto mb-4">
                  {orderedTemplates.map(template => (
                    <WorkoutTemplateCard
                      key={template.id}
                      template={template}
                      onUpdate={onUpdateTemplate}
                      onDelete={onDeleteTemplate}
                      onStart={onStartFromTemplate}
                    />
                  ))}
                </div>
              </SortableContext>
              
              <DragOverlay dropAnimation={{
                duration: 200,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
              }}>
                {activeTemplate ? (
                  <div className={`${activeTemplate.color} text-white rounded-lg shadow-2xl p-2 min-h-[45px] flex flex-col gap-1 opacity-90 transform rotate-2 scale-110`}>
                    <div className="font-semibold text-xs leading-tight truncate">{activeTemplate.name}</div>
                    {activeTemplate.exercises.length > 0 && (
                      <div className="text-xs opacity-80 leading-tight truncate">
                        {activeTemplate.exercises.length} exercice{activeTemplate.exercises.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ) : null}
              </DragOverlay>
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
