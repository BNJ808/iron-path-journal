
import { useState } from 'react';
import { DragEndEvent, DragStartEvent, TouchSensor, MouseSensor, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { WorkoutCalendarData } from '@/types/workout-calendar';

export const useDragAndDrop = (
  calendar: WorkoutCalendarData,
  saveCalendar: (newCalendar: WorkoutCalendarData) => void
) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configuration des capteurs pour le drag and drop - optimisé pour le curseur/doigt
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5,
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

  const handleDragEnd = (event: DragEndEvent) => {
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
      const newScheduledWorkouts = { ...calendar.scheduledWorkouts };
      
      if (!newScheduledWorkouts[dateKey]) {
        newScheduledWorkouts[dateKey] = [];
      }
      
      if (!newScheduledWorkouts[dateKey].includes(planId)) {
        newScheduledWorkouts[dateKey].push(planId);
        console.log('Plan added to day:', { planId, dateKey });
      }

      saveCalendar({ ...calendar, scheduledWorkouts: newScheduledWorkouts });
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
