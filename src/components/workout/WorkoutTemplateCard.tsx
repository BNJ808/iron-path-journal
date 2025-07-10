
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
import { useIsMobile } from '@/hooks/use-mobile';

interface WorkoutTemplateCardProps {
  template: WorkoutTemplate;
  onUpdate: (id: string, name: string, exercises: any[], color?: string) => void;
  onDelete: (id: string) => void;
  onStart: (template: WorkoutTemplate) => void;
}

export const WorkoutTemplateCard = ({ template, onUpdate, onDelete, onStart }: WorkoutTemplateCardProps) => {
  const isMobile = useIsMobile();
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
    zIndex: isDragging ? 50 : 'auto',
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Ne pas déclencher le clic si on est en train de faire un drag
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Ne pas déclencher le clic si on clique sur le menu ou la poignée de drag
    const target = e.target as HTMLElement;
    if (target.closest('[data-dropdown-menu]') || target.closest('[data-drag-handle]')) {
      return;
    }
    
    onStart(template);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        `${template.color} text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer`,
        isDragging && "shadow-2xl scale-105",
        "p-3 min-h-[80px] flex flex-col gap-2",
        "select-none relative"
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div
          {...attributes}
          {...listeners}
          data-drag-handle
          className={cn(
            "cursor-grab active:cursor-grabbing flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity",
            isMobile ? "p-2 -m-2" : "p-1 -m-1"
          )}
          style={{ touchAction: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className={cn("text-white", isMobile ? "h-5 w-5" : "h-4 w-4")} />
        </div>
        
        <div data-dropdown-menu onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hover:bg-white/20 flex-shrink-0",
                  isMobile ? "h-8 w-8 p-0" : "h-6 w-6 p-0"
                )}
              >
                <MoreVertical className={cn("text-white", isMobile ? "h-4 w-4" : "h-3 w-3")} />
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
      </div>

      <div className="flex-1 min-w-0 select-none pointer-events-none">
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
