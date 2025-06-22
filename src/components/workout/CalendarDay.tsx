
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from 'lucide-react';
import { WorkoutPlan } from '@/types/workout-calendar';
import { cn } from '@/lib/utils';

interface CalendarDayProps {
  day: Date;
  dateKey: string;
  scheduledPlans: string[];
  plans: WorkoutPlan[];
  isCurrentMonth: boolean;
  isCurrentDay: boolean;
  onRemovePlan: (planId: string, dateKey: string) => void;
  isDeleteMode: boolean;
  completedWorkouts?: string[]; // Array of date keys where workouts were completed
}

export const CalendarDay = ({
  day,
  dateKey,
  scheduledPlans,
  plans,
  isCurrentMonth,
  isCurrentDay,
  onRemovePlan,
  isDeleteMode,
  completedWorkouts = []
}: CalendarDayProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dateKey}`,
  });

  const dayNumber = format(day, 'd');
  const hasScheduledPlans = scheduledPlans.length > 0;
  const isWorkoutCompleted = completedWorkouts.includes(dateKey);
  
  // Debug logs
  console.log(`Day ${dateKey}:`, {
    hasScheduledPlans,
    isWorkoutCompleted,
    completedWorkouts: completedWorkouts.filter(date => date === dateKey),
    scheduledPlans
  });
  
  // Determine border color based on workout status
  const getBorderColor = () => {
    if (!isCurrentMonth) {
      return "border-border"; // Default state for non-current month
    }
    
    // Si un entrainement a été validé, bordure verte
    if (isWorkoutCompleted) {
      return "border-green-500 border-2";
    }
    
    // Si il y a des plans programmés mais pas d'entrainement validé, bordure rouge
    if (hasScheduledPlans && !isWorkoutCompleted) {
      return "border-red-500 border-2";
    }
    
    // Sinon, bordure par défaut
    return "border-border";
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border rounded-lg transition-all duration-200 relative touch-manipulation",
        "min-h-[60px] p-1.5 flex flex-col", 
        isOver ? "border-primary bg-primary/10 shadow-lg scale-[1.02]" : getBorderColor(),
        !isCurrentMonth && "bg-muted/20 text-muted-foreground opacity-70",
        isCurrentDay && "ring-1 ring-primary/20"
      )}
    >
      {/* Numéro du jour - centré */}
      <div className={cn(
        "text-xs font-medium mb-1 flex-shrink-0 text-center",
        isCurrentDay && "text-primary font-bold"
      )}>
        {dayNumber}
      </div>
      
      {/* Plans programmés */}
      <div className="space-y-0.5 flex-1 overflow-hidden">
        {scheduledPlans.map(planId => {
          const plan = plans.find(p => p.id === planId);
          if (!plan) return null;
          
          return (
            <div
              key={planId}
              className={cn(
                `${plan.color} text-white rounded shadow-sm transition-all hover:shadow-md group relative`,
                "px-1 py-0.5 text-[8px] sm:text-xs font-medium",
                "flex items-center justify-between min-h-[20px]"
              )}
            >
              <div className={cn(
                "flex items-center gap-1 flex-1 min-w-0",
                isDeleteMode && "pr-4"
              )}>
                {/* Nom du plan adaptatif */}
                <div className="flex-1 min-w-0">
                  {/* Nom complet pour desktop (sm et plus) - sans truncate */}
                  <div className="hidden sm:block">
                    <div className="font-medium leading-tight break-words text-xs" title={plan.name}>
                      {plan.name}
                    </div>
                    {plan.exercises.length > 0 && (
                      <div className="text-[10px] opacity-90 leading-tight mt-0.5">
                        {plan.exercises.length} ex.
                      </div>
                    )}
                  </div>
                  
                  {/* Nom complet pour tablettes (xs à sm) - avec truncate */}
                  <div className="hidden xs:block sm:hidden">
                    <div className="truncate font-medium leading-tight text-[8px]" title={plan.name}>
                      {plan.name}
                    </div>
                    {plan.exercises.length > 0 && (
                      <div className="text-[6px] opacity-90 truncate leading-tight mt-0.5">
                        {plan.exercises.length} ex.
                      </div>
                    )}
                  </div>
                  
                  {/* Première lettre pour très petits écrans - centrée */}
                  <div className="xs:hidden flex items-center justify-center w-full">
                    <div className="text-[9px] font-medium text-center">
                      {plan.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bouton de suppression - affiché seulement en mode suppression */}
              {isDeleteMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-3 w-3 p-0 opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-all rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePlan(planId, dateKey);
                  }}
                  title="Supprimer ce plan"
                >
                  <Badge className="h-2 w-2 rotate-45" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Indicateur de zone de dépôt */}
      {isOver && (
        <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10 backdrop-blur-sm">
          <span className="text-[10px] text-primary font-medium bg-background/90 px-1.5 py-0.5 rounded shadow-sm">
            Déposer ici
          </span>
        </div>
      )}
    </div>
  );
};
