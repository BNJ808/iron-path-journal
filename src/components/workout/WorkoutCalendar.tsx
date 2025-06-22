import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfWeek, endOfWeek, isToday, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay,
  DragStartEvent, 
  pointerWithin,
  TouchSensor, 
  MouseSensor, 
  useSensor, 
  useSensors,
  PointerSensor 
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { WorkoutPlanCard } from './WorkoutPlanCard';
import { CalendarDay } from './CalendarDay';
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
  scheduledWorkouts: { [date: string]: string[] };
}

export const WorkoutCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [calendar, setCalendar] = useState<WorkoutCalendar>({
    plans: [
      { id: '1', name: 'Push', color: 'bg-blue-500', exercises: ['Développé couché', 'Développé incliné', 'Dips'] },
      { id: '2', name: 'Pull', color: 'bg-green-500', exercises: ['Tractions', 'Rowing', 'Biceps'] },
      { id: '3', name: 'Legs', color: 'bg-red-500', exercises: ['Squat', 'Soulevé de terre', 'Mollets'] },
    ],
    scheduledWorkouts: {}
  });
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
    
    Object.keys(newScheduledWorkouts).forEach(dateKey => {
      newScheduledWorkouts[dateKey] = newScheduledWorkouts[dateKey].filter(id => id !== planId);
      if (newScheduledWorkouts[dateKey].length === 0) {
        delete newScheduledWorkouts[dateKey];
      }
    });

    saveCalendar({ plans: newPlans, scheduledWorkouts: newScheduledWorkouts });
  };

  const activePlan = calendar.plans.find(plan => plan.id === activeId);

  // Grouper les jours par semaine
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent-blue" />
            Planification des Entraînements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation du mois */}
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

          {/* Bouton pour activer/désactiver le mode suppression */}
          <div className="flex justify-end">
            <Button
              variant={isDeleteMode ? "destructive" : "outline"}
              size="sm"
              onClick={() => setIsDeleteMode(!isDeleteMode)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleteMode ? "Désactiver suppression" : "Activer suppression"}
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={pointerWithin}
          >
            {/* Plans d'entraînement */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Plans d'entraînement</h4>
                <CreateWorkoutPlanDialog onAdd={addPlan}>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Nouveau plan
                  </Button>
                </CreateWorkoutPlanDialog>
              </div>
              
              <SortableContext items={calendar.plans.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {calendar.plans.map(plan => (
                    <WorkoutPlanCard
                      key={plan.id}
                      plan={plan}
                      onUpdate={updatePlan}
                      onDelete={deletePlan}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>

            {/* Calendrier */}
            <div className="space-y-4">
              {/* En-têtes des jours */}
              <div className="grid grid-cols-7 gap-1">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                  <div key={index} className="text-center text-sm font-medium p-2 text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Grille de calendrier */}
              <div className="space-y-2">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="space-y-1">
                    {/* Jours de la semaine */}
                    <div className="grid grid-cols-7 gap-1">
                      {week.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const scheduledPlans = calendar.scheduledWorkouts[dateKey] || [];
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isCurrentDay = isToday(day);
                        
                        return (
                          <CalendarDay
                            key={dateKey}
                            day={day}
                            dateKey={dateKey}
                            scheduledPlans={scheduledPlans}
                            plans={calendar.plans}
                            isCurrentMonth={isCurrentMonth}
                            isCurrentDay={isCurrentDay}
                            onRemovePlan={removePlanFromDay}
                            isDeleteMode={isDeleteMode}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DragOverlay>
              {activePlan && (
                <div className={`${activePlan.color} text-white px-4 py-3 rounded-lg text-sm font-medium shadow-xl border-2 border-white/30 backdrop-blur-sm`}>
                  {activePlan.name}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
};
