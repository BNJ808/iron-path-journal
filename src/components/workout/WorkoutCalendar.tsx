
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { WorkoutPlanCard } from './WorkoutPlanCard';
import { DroppableCalendarDay } from './DroppableCalendarDay';
import { CreateWorkoutPlanDialog } from './CreateWorkoutPlanDialog';

export interface WorkoutPlan {
  id: string;
  name: string;
  color: string;
  exercises: string[];
  duration?: number;
}

interface WorkoutCalendar {
  plans: WorkoutPlan[];
  scheduledWorkouts: { [date: string]: string[] }; // date -> plan IDs
}

export const WorkoutCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendar, setCalendar] = useState<WorkoutCalendar>({
    plans: [
      { id: '1', name: 'Push', color: 'bg-blue-500', exercises: ['Développé couché', 'Développé incliné', 'Dips'] },
      { id: '2', name: 'Pull', color: 'bg-green-500', exercises: ['Tractions', 'Rowing', 'Biceps'] },
      { id: '3', name: 'Legs', color: 'bg-red-500', exercises: ['Squat', 'Soulevé de terre', 'Mollets'] },
    ],
    scheduledWorkouts: {}
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  // Charger depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('workoutCalendar');
    if (saved) {
      try {
        setCalendar(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading calendar:', error);
      }
    }
  }, []);

  // Sauvegarder dans localStorage
  const saveCalendar = (newCalendar: WorkoutCalendar) => {
    setCalendar(newCalendar);
    localStorage.setItem('workoutCalendar', JSON.stringify(newCalendar));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const planId = active.id as string;
    const dayKey = over.id as string;

    if (dayKey.startsWith('day-')) {
      const dateKey = dayKey.replace('day-', '');
      const newScheduledWorkouts = { ...calendar.scheduledWorkouts };
      
      if (!newScheduledWorkouts[dateKey]) {
        newScheduledWorkouts[dateKey] = [];
      }
      
      if (!newScheduledWorkouts[dateKey].includes(planId)) {
        newScheduledWorkouts[dateKey].push(planId);
      }

      saveCalendar({ ...calendar, scheduledWorkouts: newScheduledWorkouts });
    }

    setActiveId(null);
  };

  const removePlanFromDay = (planId: string, dateKey: string) => {
    const newScheduledWorkouts = { ...calendar.scheduledWorkouts };
    if (newScheduledWorkouts[dateKey]) {
      newScheduledWorkouts[dateKey] = newScheduledWorkouts[dateKey].filter(id => id !== planId);
      if (newScheduledWorkouts[dateKey].length === 0) {
        delete newScheduledWorkouts[dateKey];
      }
    }
    saveCalendar({ ...calendar, scheduledWorkouts: newScheduledWorkouts });
  };

  const addPlan = (plan: Omit<WorkoutPlan, 'id'>) => {
    const newPlan = { ...plan, id: Date.now().toString() };
    saveCalendar({ 
      ...calendar, 
      plans: [...calendar.plans, newPlan] 
    });
  };

  const updatePlan = (planId: string, updates: Partial<WorkoutPlan>) => {
    const newPlans = calendar.plans.map(plan => 
      plan.id === planId ? { ...plan, ...updates } : plan
    );
    saveCalendar({ ...calendar, plans: newPlans });
  };

  const deletePlan = (planId: string) => {
    const newPlans = calendar.plans.filter(plan => plan.id !== planId);
    const newScheduledWorkouts = { ...calendar.scheduledWorkouts };
    
    // Supprimer le plan de tous les jours programmés
    Object.keys(newScheduledWorkouts).forEach(dateKey => {
      newScheduledWorkouts[dateKey] = newScheduledWorkouts[dateKey].filter(id => id !== planId);
      if (newScheduledWorkouts[dateKey].length === 0) {
        delete newScheduledWorkouts[dateKey];
      }
    });

    saveCalendar({ plans: newPlans, scheduledWorkouts: newScheduledWorkouts });
  };

  const activePlan = calendar.plans.find(plan => plan.id === activeId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent-blue" />
            Planification des Entraînements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contrôles de navigation du mois */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Plans d'entraînement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Plans d'entraînement</h4>
              <CreateWorkoutPlanDialog onAdd={addPlan}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Nouveau plan
                </Button>
              </CreateWorkoutPlanDialog>
            </div>
            
            <DndContext
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              collisionDetection={closestCenter}
            >
              <div className="flex flex-wrap gap-2">
                {calendar.plans.map(plan => (
                  <WorkoutPlanCard
                    key={plan.id}
                    plan={plan}
                    onUpdate={updatePlan}
                    onDelete={deletePlan}
                  />
                ))}
              </div>

              {/* Calendrier */}
              <div className="mt-6">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="text-center text-sm font-medium p-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const scheduledPlans = calendar.scheduledWorkouts[dateKey] || [];
                    const isCurrentMonth = isSameDay(day, currentDate) || 
                      (day >= monthStart && day <= monthEnd);
                    
                    return (
                      <DroppableCalendarDay
                        key={dateKey}
                        day={day}
                        dateKey={dateKey}
                        scheduledPlans={scheduledPlans}
                        plans={calendar.plans}
                        isCurrentMonth={isCurrentMonth}
                        onRemovePlan={removePlanFromDay}
                      />
                    );
                  })}
                </div>
              </div>

              <DragOverlay>
                {activePlan && (
                  <div className={`${activePlan.color} text-white px-2 py-1 rounded text-xs font-medium opacity-90`}>
                    {activePlan.name}
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
