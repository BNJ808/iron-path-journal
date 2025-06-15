
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableCardItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortableCardItem({ id, children }: SortableCardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children}
      <div
        {...listeners}
        className="absolute top-3 right-3 cursor-grab active:cursor-grabbing p-1 z-20"
        aria-label="Glisser pour réorganiser"
        title="Glisser pour réorganiser"
      >
        <GripVertical className="h-6 w-6 text-muted-foreground/70 hover:text-muted-foreground transition-colors" />
      </div>
    </div>
  );
}
