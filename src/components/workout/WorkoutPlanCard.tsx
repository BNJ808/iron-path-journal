
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, GripVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditWorkoutPlanDialog } from './EditWorkoutPlanDialog';
import { WorkoutPlan } from '@/types/workout-calendar';
import { cn } from '@/lib/utils';

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  onUpdate: (planId: string, updates: Partial<WorkoutPlan>) => void;
  onDelete: (planId: string) => void;
}

export const WorkoutPlanCard = ({ plan, onUpdate, onDelete }: WorkoutPlanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: plan.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    touchAction: 'none', // Empêche le scroll lors du drag sur mobile
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        `${plan.color} text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing`,
        isDragging && "shadow-2xl scale-105 z-50",
        "p-2 min-h-[48px] flex items-center gap-2",
        "select-none" // Désactive la sélection de texte
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
      
      <div className="flex-1 min-w-0 select-none">
        <div className="font-semibold text-sm truncate select-none">{plan.name}</div>
        {plan.exercises.length > 0 && (
          <div className="text-xs opacity-80 truncate leading-tight select-none">
            {plan.exercises.length} exercice{plan.exercises.length > 1 ? 's' : ''}
            {plan.exercises.length <= 2 && ': ' + plan.exercises.slice(0, 2).join(', ')}
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-white/20 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onPointerDown={(e) => {
              // Empêche le drag quand on clique sur le menu
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              // Empêche le drag quand on touche le menu sur mobile
              e.stopPropagation();
            }}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <EditWorkoutPlanDialog
            plan={plan}
            onUpdate={(updates) => onUpdate(plan.id, updates)}
          >
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
          </EditWorkoutPlanDialog>
          <DropdownMenuItem
            onClick={() => onDelete(plan.id)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
