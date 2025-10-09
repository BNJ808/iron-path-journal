
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge, Check, X } from 'lucide-react';
import { WorkoutPlan } from '@/types/workout-calendar';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ManualValidationDialog } from './ManualValidationDialog';

interface CalendarDayProps {
  day: Date;
  dateKey: string;
  scheduledPlans: string[];
  plans: WorkoutPlan[];
  isCurrentMonth: boolean;
  isCurrentDay: boolean;
  onRemovePlan: (planId: string, dateKey: string) => void;
  isDeleteMode: boolean;
  completedWorkouts?: string[];
  manuallyValidatedDates?: string[];
  onManualValidate?: (date: Date, note?: string) => void;
  onRemoveManualValidation?: (date: Date) => void;
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
  completedWorkouts = [],
  manuallyValidatedDates = [],
  onManualValidate,
  onRemoveManualValidation,
}: CalendarDayProps) => {
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dateKey}`,
  });

  const dayNumber = format(day, 'd');
  const hasScheduledPlans = scheduledPlans.length > 0;
  const isWorkoutCompleted = completedWorkouts.includes(dateKey);
  const isManuallyValidated = manuallyValidatedDates.includes(dateKey);
  
  // Determine border color based on workout status
  const getBorderColor = () => {
    if (!isCurrentMonth) {
      return "border-border";
    }
    
    // Si un entrainement a été validé OU validé manuellement, bordure verte
    if (isWorkoutCompleted || isManuallyValidated) {
      return "border-green-500 border-2";
    }
    
    // Si il y a des plans programmés mais pas d'entrainement validé, bordure rouge
    if (hasScheduledPlans && !isWorkoutCompleted && !isManuallyValidated) {
      return "border-red-500 border-2";
    }
    
    // Sinon, bordure par défaut
    return "border-border";
  };

  const handleManualValidate = (date: Date, note?: string) => {
    onManualValidate?.(date, note);
  };

  const handleRemoveManualValidation = () => {
    onRemoveManualValidation?.(day);
  };

  const calendarDayContent = (
    <div
      ref={setNodeRef}
      className={cn(
        "border rounded-lg transition-all duration-200 relative",
        "min-h-[60px] p-1.5 flex flex-col", 
        isOver ? "border-primary bg-primary/10 shadow-lg scale-[1.02]" : getBorderColor(),
        !isCurrentMonth && "bg-muted/20 text-muted-foreground opacity-70",
        isCurrentDay && "ring-1 ring-primary/20"
      )}
      style={{
        touchAction: 'pan-y',
      }}
    >
      {/* Numéro du jour avec indicateur de validation manuelle */}
      <div className={cn(
        "text-xs font-medium mb-1 flex-shrink-0 text-center flex items-center justify-center gap-1",
        isCurrentDay && "text-primary font-bold"
      )}>
        {dayNumber}
        {isManuallyValidated && (
          <Check className="h-3 w-3 text-green-500" />
        )}
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
                "flex items-center justify-center min-h-[20px]",
                isDeleteMode && "cursor-pointer hover:opacity-80"
              )}
              onClick={isDeleteMode ? (e) => {
                e.stopPropagation();
                onRemovePlan(planId, dateKey);
              } : undefined}
              style={{
                touchAction: isDeleteMode ? 'manipulation' : 'none', // Optimise les touches selon le mode
              }}
            >
              <div className={cn(
                "flex items-center justify-center gap-1 flex-1 min-w-0 text-center"
              )}>
                {/* Nom du plan adaptatif - centré */}
                <div className="flex-1 min-w-0">
                  {/* Nom complet pour desktop (sm et plus) - centré */}
                  <div className="hidden sm:block text-center">
                    <div className="font-medium leading-tight break-words text-xs" title={plan.name}>
                      {plan.name}
                    </div>
                    {plan.exercises.length > 0 && (
                      <div className="text-[10px] opacity-90 leading-tight mt-0.5">
                        {plan.exercises.length} ex.
                      </div>
                    )}
                  </div>
                  
                  {/* Nom complet pour tablettes (xs à sm) - centré */}
                  <div className="hidden xs:block sm:hidden text-center">
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

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {calendarDayContent}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {!isManuallyValidated && onManualValidate && (
            <ContextMenuItem onClick={() => setShowValidationDialog(true)}>
              <Check className="mr-2 h-4 w-4" />
              Valider manuellement
            </ContextMenuItem>
          )}
          {isManuallyValidated && onRemoveManualValidation && (
            <ContextMenuItem onClick={handleRemoveManualValidation} className="text-destructive">
              <X className="mr-2 h-4 w-4" />
              Retirer la validation manuelle
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <ManualValidationDialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        date={day}
        onValidate={handleManualValidate}
      />
    </>
  );
};
