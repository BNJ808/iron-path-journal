
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format, isSameDay, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { WorkoutPlan } from './WorkoutCalendar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dateKey}`,
  });

  const dayNumber = format(day, 'd');
  const isCurrentDay = isToday(day);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border rounded-lg transition-all duration-200 touch-manipulation relative",
        isMobile ? "min-h-20 p-1" : "min-h-20 p-1",
        isOver ? "border-primary bg-primary/20 scale-105 shadow-lg" : "border-border",
        !isCurrentMonth && "bg-muted/30 text-muted-foreground",
        isCurrentDay && "border-primary bg-primary/5 ring-1 ring-primary/20"
      )}
    >
      <div className={cn(
        "font-medium mb-1",
        isMobile ? "text-xs" : "text-sm",
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
              className={cn(
                `${plan.color} text-white rounded flex items-center justify-between group transition-all`,
                isMobile ? "px-1.5 py-1.5 text-xs min-h-[28px]" : "px-1 py-0.5 text-xs",
                "font-medium shadow-sm"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold" title={plan.name}>
                  {isMobile ? plan.name : plan.name}
                </div>
                {isMobile && plan.exercises.length > 0 && (
                  <div className="text-[10px] opacity-90 truncate leading-tight">
                    {plan.exercises.slice(0, 1).join(', ')}
                    {plan.exercises.length > 1 && ` +${plan.exercises.length - 1}`}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-opacity flex-shrink-0 ml-1",
                  isMobile ? "h-5 w-5 p-0 opacity-60" : "h-3 w-3 p-0"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePlan(planId, dateKey);
                }}
              >
                <X className={isMobile ? "h-3 w-3" : "h-2 w-2"} />
              </Button>
            </div>
          );
        })}
      </div>
      
      {/* Zone de drop visible sur mobile */}
      {isMobile && isOver && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
          <span className="text-xs text-primary font-medium bg-background/80 px-2 py-1 rounded">
            Déposer ici
          </span>
        </div>
      )}
    </div>
  );
};
