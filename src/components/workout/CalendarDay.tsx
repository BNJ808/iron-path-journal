
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { WorkoutPlan } from './WorkoutCalendar';
import { cn } from '@/lib/utils';

interface CalendarDayProps {
  day: Date;
  dateKey: string;
  scheduledPlans: string[];
  plans: WorkoutPlan[];
  isCurrentMonth: boolean;
  isCurrentDay: boolean;
  onRemovePlan: (planId: string, dateKey: string) => void;
}

export const CalendarDay = ({
  day,
  dateKey,
  scheduledPlans,
  plans,
  isCurrentMonth,
  isCurrentDay,
  onRemovePlan
}: CalendarDayProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dateKey}`,
  });

  const dayNumber = format(day, 'd');

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border rounded-lg p-1 min-h-[60px] md:min-h-[80px] transition-all duration-200 relative",
        isOver ? "border-primary bg-primary/20 scale-105 shadow-lg" : "border-border",
        !isCurrentMonth && "bg-muted/30 text-muted-foreground opacity-60",
        isCurrentDay && "border-primary bg-primary/5 ring-1 ring-primary/30"
      )}
    >
      {/* Numéro du jour */}
      <div className={cn(
        "text-xs md:text-sm font-medium mb-1",
        isCurrentDay && "text-primary font-bold"
      )}>
        {dayNumber}
      </div>
      
      {/* Plans programmés */}
      <div className="space-y-1">
        {scheduledPlans.map(planId => {
          const plan = plans.find(p => p.id === planId);
          if (!plan) return null;
          
          return (
            <div
              key={planId}
              className={cn(
                `${plan.color} text-white rounded-md px-1.5 py-1 text-xs font-medium shadow-sm relative group transition-all hover:shadow-md`,
                "flex items-center justify-between min-h-[24px]"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="truncate text-xs font-semibold" title={plan.name}>
                  {plan.name}
                </div>
                {plan.exercises.length > 0 && (
                  <div className="text-[10px] opacity-80 truncate leading-tight">
                    {plan.exercises.length} ex.
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all flex-shrink-0 ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePlan(planId, dateKey);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>
      
      {/* Indicateur de zone de dépôt */}
      {isOver && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
          <span className="text-xs text-primary font-medium bg-background/90 px-2 py-1 rounded">
            Déposer ici
          </span>
        </div>
      )}
    </div>
  );
};
