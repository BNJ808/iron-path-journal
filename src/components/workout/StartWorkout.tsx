
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { List, PlusCircle, Play, Settings } from 'lucide-react';
import type { WorkoutTemplate, ExerciseLog } from '@/hooks/useWorkoutTemplates';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { WorkoutTemplateCard } from './WorkoutTemplateCard';
import { CustomExerciseManagement } from './CustomExerciseManagement';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';

interface StartWorkoutProps {
  onStartWorkout: () => void;
  onStartFromTemplate: (template: WorkoutTemplate) => void;
  onValidateRunning: () => void;
  templates: WorkoutTemplate[];
  isLoadingTemplates: boolean;
  onUpdateTemplate: (id: string, name: string, exercises: ExerciseLog[], color?: string) => void;
  onDeleteTemplate: (id: string) => void;
  onCreateTemplate: (template: { name: string; exercises: ExerciseLog[] }) => Promise<any>;
}

export const StartWorkout = ({ 
  onStartWorkout, 
  onStartFromTemplate, 
  onValidateRunning,
  templates, 
  isLoadingTemplates, 
  onUpdateTemplate, 
  onDeleteTemplate, 
  onCreateTemplate 
}: StartWorkoutProps) => {
  const [orderedTemplates, setOrderedTemplates] = useState<WorkoutTemplate[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isValidateRunning, setIsValidateRunning] = useState(false);

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

  const handleStartWorkout = () => {
    if (isValidateRunning) {
      onValidateRunning();
    } else {
      onStartWorkout();
    }
  };

  return (
    <div className="text-center py-10 space-y-6">
      <div className="space-y-4">
        <Button onClick={handleStartWorkout} className="w-full max-w-md">
          <Play className="mr-2 h-4 w-4" />
          {isValidateRunning ? 'Valider la sortie running' : 'Démarrer un entraînement de zéro'}
        </Button>
        
        <div className="flex items-center justify-center space-x-2 text-sm">
          <Checkbox 
            id="validate-running" 
            checked={isValidateRunning}
            onCheckedChange={(checked) => setIsValidateRunning(checked === true)}
          />
          <label 
            htmlFor="validate-running" 
            className="text-muted-foreground cursor-pointer"
          >
            Valider une sortie running
          </label>
        </div>
      </div>

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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-w-4xl mx-auto mb-4">
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
                  <div className={`${activeTemplate.color} text-white rounded-xl shadow-2xl p-2 min-h-[56px] flex flex-col gap-0.5 opacity-90 transform scale-105 ring-1 ring-white/10`}>
                    <div className="font-semibold text-xs leading-tight truncate">{activeTemplate.name}</div>
                    {activeTemplate.exercises.length > 0 && (
                      <div className="space-y-px">
                        {activeTemplate.exercises.slice(0, 3).map((ex, i) => (
                          <div key={i} className="text-[9px] opacity-75 leading-tight truncate">
                            • {ex.name}
                          </div>
                        ))}
                        {activeTemplate.exercises.length > 3 && (
                          <div className="text-[9px] opacity-60 leading-tight">
                            +{activeTemplate.exercises.length - 3} autres
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
            
            <div className="max-w-md mx-auto mt-4 space-y-4">
              <CreateTemplateDialog onCreate={onCreateTemplate}>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer un nouveau modèle
                </Button>
              </CreateTemplateDialog>
              
              <div className="border-t border-border pt-4">
                <CustomExerciseManagement />
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
