
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
import { EditTemplateDialog } from './EditTemplateDialog';
import { WorkoutTemplate } from '@/hooks/useWorkoutTemplates';
import { cn } from '@/lib/utils';

interface WorkoutTemplateCardProps {
  template: WorkoutTemplate;
  onUpdate: (id: string, name: string, exercises: any[], color?: string) => void;
  onDelete: (id: string) => void;
}

export const WorkoutTemplateCard = ({ template, onUpdate, onDelete }: WorkoutTemplateCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        `${template.color} text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing`,
        isDragging && "shadow-2xl scale-105 z-50",
        "p-3 min-h-[80px] flex flex-col gap-2",
        "select-none"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between">
        <GripVertical className="h-4 w-4 flex-shrink-0 opacity-60" />
        
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
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <EditTemplateDialog
              template={template}
              onUpdate={onUpdate}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
            </EditTemplateDialog>
            <DropdownMenuItem
              onClick={() => onDelete(template.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 min-w-0 select-none">
        <div className="font-semibold text-sm mb-1 select-none">{template.name}</div>
        {template.exercises.length > 0 && (
          <div className="text-xs opacity-80 leading-tight select-none">
            {template.exercises.length} exercice{template.exercises.length > 1 ? 's' : ''}
            {template.exercises.length <= 2 && template.exercises.length > 0 && 
              ': ' + template.exercises.slice(0, 2).map(ex => ex.name).join(', ')
            }
          </div>
        )}
      </div>
    </div>
  );
};
