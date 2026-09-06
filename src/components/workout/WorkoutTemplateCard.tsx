
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
  } = useSortable({
    id: template.id,
    transition: null,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : undefined,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

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
        "bg-card text-card-foreground rounded-3xl shadow-[0_4px_20px_-4px_hsl(var(--foreground)_/_0.08)] hover:shadow-[0_12px_30px_-8px_hsl(var(--foreground)_/_0.12)] transition-all duration-200 cursor-pointer ring-1 ring-border/60 hover:ring-primary/30",
        isDragging && "shadow-2xl ring-2 ring-primary/40",
        "p-3 min-h-[72px] flex flex-col gap-1",
        "select-none relative will-change-transform overflow-hidden"
      )}
      onClick={handleCardClick}
    >
      {/* Subtle color accent bar */}
      <div
        className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-full", template.color)}
        style={{ opacity: 0.8 }}
      />

      <div className="flex items-start justify-between pl-2.5">
        <div
          {...attributes}
          {...listeners}
          data-drag-handle
          className={cn(
            "cursor-grab active:cursor-grabbing flex-shrink-0 text-muted-foreground hover:text-foreground transition-opacity duration-150",
            isMobile ? "p-1 -m-1 touch-none" : "p-0.5 -m-0.5",
            "will-change-transform"
          )}
          style={{ touchAction: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className={cn(isMobile ? "h-3 w-3" : "h-2.5 w-2.5")} />
        </div>

        <div data-dropdown-menu onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hover:bg-secondary flex-shrink-0 transition-colors duration-150 text-muted-foreground",
                  isMobile ? "h-6 w-6 p-0" : "h-5 w-5 p-0"
                )}
              >
                <MoreVertical className={cn(isMobile ? "h-3 w-3" : "h-2.5 w-2.5")} />
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
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 min-w-0 select-none pointer-events-none pl-2.5">
        <div className="font-bold text-sm text-foreground mb-1 select-none leading-tight truncate">{template.name}</div>
        {template.exercises.length > 0 && (
          <div className="space-y-0.5">
            {template.exercises.slice(0, 3).map((ex, i) => (
              <div key={i} className="text-[10px] text-muted-foreground leading-tight select-none truncate">
                • {ex.name}
              </div>
            ))}
            {template.exercises.length > 3 && (
              <div className="text-[10px] text-muted-foreground/70 leading-tight select-none">
                +{template.exercises.length - 3} autres
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
