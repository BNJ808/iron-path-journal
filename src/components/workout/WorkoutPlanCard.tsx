
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
import { WorkoutPlan } from './WorkoutCalendar';
import { useIsMobile } from '@/hooks/use-mobile';

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  onUpdate: (planId: string, updates: Partial<WorkoutPlan>) => void;
  onDelete: (planId: string) => void;
}

export const WorkoutPlanCard = ({ plan, onUpdate, onDelete }: WorkoutPlanCardProps) => {
  const isMobile = useIsMobile();
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
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${plan.color} text-white p-3 rounded-lg flex items-center gap-2 cursor-grab active:cursor-grabbing relative ${
        isDragging ? 'z-50 shadow-2xl scale-105' : 'shadow-md'
      } ${isMobile ? 'min-h-[48px] touch-manipulation' : ''}`}
      {...attributes}
      {...listeners}
    >
      {isMobile && (
        <GripVertical className="h-4 w-4 flex-shrink-0 opacity-70" />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{plan.name}</div>
        {plan.exercises.length > 0 && (
          <div className="text-xs opacity-80 truncate">
            {plan.exercises.slice(0, 2).join(', ')}
            {plan.exercises.length > 2 && '...'}
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 hover:bg-white/20 ${isMobile ? 'h-8 w-8' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
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
