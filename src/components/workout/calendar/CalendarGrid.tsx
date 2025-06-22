
import React from 'react';
import { CalendarDay } from '../CalendarDay';
import { WorkoutPlan } from '@/types/workout-calendar';
import { format, isSameMonth } from 'date-fns';

interface CalendarGridProps {
  weeks: Date[][];
  currentDate: Date;
  scheduledWorkouts: { [date: string]: string[] };
  plans: WorkoutPlan[];
  onRemovePlan: (planId: string, dateKey: string) => void;
  isDeleteMode: boolean;
  completedWorkouts?: string[]; // Array of completed workout date keys
}

export const CalendarGrid = ({
  weeks,
  currentDate,
  scheduledWorkouts,
  plans,
  onRemovePlan,
  isDeleteMode,
  completedWorkouts = []
}: CalendarGridProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 gap-1">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayWithoutTime = new Date(day);
              dayWithoutTime.setHours(0, 0, 0, 0);
              
              return (
                <CalendarDay
                  key={dateKey}
                  day={day}
                  dateKey={dateKey}
                  scheduledPlans={scheduledWorkouts[dateKey] || []}
                  plans={plans}
                  isCurrentMonth={isSameMonth(day, currentDate)}
                  isCurrentDay={dayWithoutTime.getTime() === today.getTime()}
                  onRemovePlan={onRemovePlan}
                  isDeleteMode={isDeleteMode}
                  completedWorkouts={completedWorkouts}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
