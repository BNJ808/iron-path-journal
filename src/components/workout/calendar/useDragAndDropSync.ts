
import { useState } from 'react';
import { DragEndEvent, DragStartEvent, TouchSensor, MouseSensor, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { WorkoutCalendarData } from '@/types/workout-calendar';

export const useDragAndDropSync = (
  calendar: WorkoutCalendarData,
  addPlanToDate: (planId: string, dateKey: string) => Promise<void>
) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configuration des capteurs optimisée pour mobile
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 50,
      tolerance: 8,
    },
  });

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 3,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor, pointerSensor);

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started:', event.active.id);
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag ended:', { active: active?.id, over: over?.id });
    
    if (!over || !active) {
      setActiveId(null);
      return;
    }

    const planId = active.id as string;
    const overId = over.id as string;

    if (overId.startsWith('day-')) {
      const dateKey = overId.replace('day-', '');
      
      try {
        await addPlanToDate(planId, dateKey);
        console.log('Plan added to day:', { planId, dateKey });
      } catch (error) {
        console.error('Error adding plan to date:', error);
      }
    }

    setActiveId(null);
  };

  const activePlan = calendar.plans.find(plan => plan.id === activeId);

  return {
    sensors,
    activeId,
    activePlan,
    handleDragStart,
    handleDragEnd
  };
};
