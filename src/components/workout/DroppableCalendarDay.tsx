
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format, isSameDay, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { WorkoutPlan } from './WorkoutCalendar';
import { cn } from '@/lib/utils';

interface DroppableCalendarDayProps {
  day: Date;
  dateKey: string;
  scheduledPlans: string[];
  plans: WorkoutPlan[];
  isCurrentMonth: boolean;
  onRemovePlan: (planId: string, dateKey: string) => void;
}

export const DroppableCalendarDay = ({
  day,
  dateKey,
  scheduledPlans,
  plans,
  isCurrentMonth,
  onRemovePlan
}: DroppableCalendarDayProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dateKey}`,
  });

  const dayNumber = format(day, 'd');
  const isCurrentDay = isToday(day);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-20 p-1 border rounded-lg transition-colors",
        isOver ? "border-primary bg-primary/10" : "border-border",
        !isCurrentMonth && "bg-muted/30 text-muted-foreground",
        isCurrentDay && "border-primary bg-primary/5"
      )}
    >
      <div className={cn(
        "text-sm font-medium mb-1",
        isCurrentDay && "text-primary font-bold"
      )}>
        {dayNumber}
      </div>
      
      <div className="space-y-1">
        {scheduledPlans.map(planId => {
          const plan = plans.find(p => p.id === planId);
          if (!plan) return null;
          
          return (
            <div
              key={planId}
              className={`${plan.color} text-white px-1 py-0.5 rounded text-xs font-medium flex items-center justify-between group`}
            >
              <span className="truncate flex-1" title={plan.name}>
                {plan.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-opacity"
                onClick={() => onRemovePlan(planId, dateKey)}
              >
                <X className="h-2 w-2" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
