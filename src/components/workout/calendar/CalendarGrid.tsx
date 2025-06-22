
import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { CalendarDay } from '../CalendarDay';
import { WorkoutPlan } from '@/types/workout-calendar';

interface CalendarGridProps {
  weeks: Date[][];
  currentDate: Date;
  scheduledWorkouts: { [date: string]: string[] };
  plans: WorkoutPlan[];
  onRemovePlan: (planId: string, dateKey: string) => void;
  isDeleteMode: boolean;
}

export const CalendarGrid = ({ 
  weeks, 
  currentDate, 
  scheduledWorkouts, 
  plans, 
  onRemovePlan, 
  isDeleteMode 
}: CalendarGridProps) => {
  return (
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
                const scheduledPlans = scheduledWorkouts[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                
                return (
                  <CalendarDay
                    key={dateKey}
                    day={day}
                    dateKey={dateKey}
                    scheduledPlans={scheduledPlans}
                    plans={plans}
                    isCurrentMonth={isCurrentMonth}
                    isCurrentDay={isCurrentDay}
                    onRemovePlan={onRemovePlan}
                    isDeleteMode={isDeleteMode}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
