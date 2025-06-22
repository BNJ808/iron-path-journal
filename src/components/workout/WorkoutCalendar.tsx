
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Trash2 } from 'lucide-react';
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, format } from 'date-fns';
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { CalendarHeader } from './calendar/CalendarHeader';
import { WorkoutPlansSection } from './calendar/WorkoutPlansSection';
import { CalendarGrid } from './calendar/CalendarGrid';
import { useDragAndDrop } from './calendar/useDragAndDrop';
import { useWorkoutCalendarData } from './calendar/useWorkoutCalendarData';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';

// Re-export types for backward compatibility
export type { WorkoutPlan } from '@/types/workout-calendar';

export const WorkoutCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  
  const {
    calendar,
    saveCalendar,
    removePlanFromDay,
    addPlan,
    updatePlan,
    deletePlan
  } = useWorkoutCalendarData();

  const { workouts } = useWorkoutHistory();

  console.log('Raw workouts from useWorkoutHistory:', workouts);

  const {
    sensors,
    activePlan,
    handleDragStart,
    handleDragEnd
  } = useDragAndDrop(calendar, saveCalendar);

  // Extract completed workout dates - ensure consistent date formatting
  const completedWorkouts = workouts.map(workout => {
    console.log('Processing workout:', workout);
    const workoutDate = new Date(workout.date);
    // Reset hours to avoid timezone issues
    workoutDate.setHours(0, 0, 0, 0);
    const formatted = format(workoutDate, 'yyyy-MM-dd');
    console.log(`Workout date ${workout.date} formatted to ${formatted}`);
    return formatted;
  });

  console.log('Completed workouts dates:', completedWorkouts);
  console.log('All workouts:', workouts.map(w => ({ date: w.date, formatted: format(new Date(w.date), 'yyyy-MM-dd') })));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Grouper les jours par semaine
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent-blue" />
              Planification
            </div>
            <Button
              variant={isDeleteMode ? "destructive" : "outline"}
              size="sm"
              onClick={() => setIsDeleteMode(!isDeleteMode)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={pointerWithin}
          >
            <WorkoutPlansSection
              plans={calendar.plans}
              onAdd={addPlan}
              onUpdate={updatePlan}
              onDelete={deletePlan}
            />

            <CalendarHeader currentDate={currentDate} onDateChange={setCurrentDate} />

            <CalendarGrid
              weeks={weeks}
              currentDate={currentDate}
              scheduledWorkouts={calendar.scheduledWorkouts}
              plans={calendar.plans}
              onRemovePlan={removePlanFromDay}
              isDeleteMode={isDeleteMode}
              completedWorkouts={completedWorkouts}
            />

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
