
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
        "border rounded-lg transition-all duration-200 relative touch-manipulation",
        "min-h-[100px] p-2 w-full min-w-[120px]", // Hauteur à 100px et largeur minimum augmentée
        isOver ? "border-primary bg-primary/10 shadow-lg scale-[1.02]" : "border-border",
        !isCurrentMonth && "bg-muted/20 text-muted-foreground opacity-70",
        isCurrentDay && "border-primary bg-primary/5 ring-1 ring-primary/20"
      )}
    >
      {/* Numéro du jour */}
      <div className={cn(
        "text-sm font-medium mb-2",
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
                `${plan.color} text-white rounded-md shadow-sm transition-all hover:shadow-md group`,
                "px-2 py-1.5 text-xs font-medium",
                "flex items-center justify-between min-h-[28px]"
              )}
            >
              <div className="flex items-center gap-1 flex-1 min-w-0">
                {/* Affichage desktop - nom complet */}
                <div className="hidden sm:flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-semibold leading-tight" title={plan.name}>
                      {plan.name}
                    </div>
                    {plan.exercises.length > 0 && (
                      <div className="text-[10px] opacity-90 truncate leading-tight mt-0.5">
                        {plan.exercises.length} ex.
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Affichage mobile - première lettre seulement */}
                <div className="sm:hidden flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="text-lg font-bold">
                    {plan.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-[10px] opacity-90 leading-tight">
                    {plan.exercises.length} ex.
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all flex-shrink-0 ml-1"
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
        <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10 backdrop-blur-sm">
          <span className="text-xs text-primary font-medium bg-background/90 px-2 py-1 rounded shadow-sm">
            Déposer ici
          </span>
        </div>
      )}
    </div>
  );
};
