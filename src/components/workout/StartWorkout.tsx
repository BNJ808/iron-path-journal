
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
import { cn } from '@/lib/utils';

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
    <div className="py-6 space-y-8 max-w-2xl mx-auto px-2 sm:px-4">
      {/* Primary CTA */}
      <div className="space-y-2">
        <Button
          onClick={handleStartWorkout}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 text-sm font-bold shadow-md"
        >
          <Play className="mr-2 h-4 w-4 fill-current" />
          {isValidateRunning ? 'Valider la sortie running' : 'Séance libre'}
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Checkbox
            id="validate-running"
            checked={isValidateRunning}
            onCheckedChange={(checked) => setIsValidateRunning(checked === true)}
            className="h-3.5 w-3.5 border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <label
            htmlFor="validate-running"
            className="cursor-pointer"
          >
            Valider une sortie running
          </label>
        </div>
      </div>

      {/* Templates section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <List className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground font-['Space_Grotesk']">Séances</h2>
        </div>

        {isLoadingTemplates ? (
          <p className="text-muted-foreground text-center py-8">Chargement des modèles...</p>
        ) : (
          <>
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <SortableContext items={orderedTemplates.map(t => t.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  <div className={cn(
                    "bg-card text-card-foreground rounded-3xl shadow-2xl p-3 min-h-[72px] flex flex-col gap-1 opacity-95 transform scale-105 ring-2 ring-primary/30",
                    "relative overflow-hidden"
                  )}>
                    <div className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-full", activeTemplate.color)} style={{ opacity: 0.8 }} />
                    <div className="font-bold text-sm text-foreground mb-1 leading-tight truncate pl-2.5">{activeTemplate.name}</div>
                    {activeTemplate.exercises.length > 0 && (
                      <div className="space-y-0.5 pl-2.5">
                        {activeTemplate.exercises.slice(0, 3).map((ex, i) => (
                          <div key={i} className="text-[10px] text-muted-foreground leading-tight truncate">
                            • {ex.name}
                          </div>
                        ))}
                        {activeTemplate.exercises.length > 3 && (
                          <div className="text-[10px] text-muted-foreground/70 leading-tight">
                            +{activeTemplate.exercises.length - 3} autres
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            <div className="space-y-4 pt-2">
              <CreateTemplateDialog onCreate={onCreateTemplate}>
                <Button variant="outline" className="w-full rounded-xl h-11 border-dashed border-2 hover:border-primary hover:text-primary">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer une nouvelle séance
                </Button>
              </CreateTemplateDialog>

              <div className="border-t border-border/60 pt-4">
                <CustomExerciseManagement />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
