
import { Button } from '@/components/ui/button';
import { List, PlusCircle } from 'lucide-react';
import type { WorkoutTemplate, ExerciseLog } from '@/hooks/useWorkoutTemplates';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { WorkoutTemplateCard } from './WorkoutTemplateCard';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
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
  const [orderedTemplates, setOrderedTemplates] = useState<WorkoutTemplate[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Charger l'ordre sauvegardé depuis le localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('workoutTemplatesOrder');
    if (savedOrder && templates.length > 0) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const orderedList = orderIds
          .map((id: string) => templates.find(t => t.id === id))
          .filter(Boolean);
        
        // Ajouter les nouveaux templates qui ne sont pas dans l'ordre sauvegardé
        const newTemplates = templates.filter(t => !orderIds.includes(t.id));
        setOrderedTemplates([...orderedList, ...newTemplates]);
      } catch {
        setOrderedTemplates(templates);
      }
    } else {
      setOrderedTemplates(templates);
    }
  }, [templates]);

  // Sauvegarder l'ordre dans le localStorage
  const saveOrder = (newOrder: WorkoutTemplate[]) => {
    const orderIds = newOrder.map(t => t.id);
    localStorage.setItem('workoutTemplatesOrder', JSON.stringify(orderIds));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 3,
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
        
        if (oldIndex === -1 || newIndex === -1) return items;
        
        // Échanger les positions directement
        const newItems = [...items];
        [newItems[oldIndex], newItems[newIndex]] = [newItems[newIndex], newItems[oldIndex]];
        
        // Sauvegarder le nouvel ordre
        saveOrder(newItems);
        
        return newItems;
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
              <SortableContext items={orderedTemplates.map(t => t.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 max-w-6xl mx-auto mb-4">
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
              
              <DragOverlay dropAnimation={null}>
                {activeTemplate ? (
                  <div className={`${activeTemplate.color} text-white rounded-lg shadow-2xl p-1.5 min-h-[32px] flex flex-col gap-0.5 opacity-90 transform scale-105`}>
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
