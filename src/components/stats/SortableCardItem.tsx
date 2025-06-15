
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';

interface SortableCardItemProps {
  id: string;
  children: React.ReactNode;
  isDndEnabled: boolean;
}

export function SortableCardItem({ id, children, isDndEnabled }: SortableCardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isDndEnabled });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children}
      {isDndEnabled && (
        <div
          {...listeners}
          className="absolute top-3 right-3 cursor-grab active:cursor-grabbing p-2 z-20"
          aria-label="Glisser pour réorganiser"
          title="Glisser pour réorganiser"
        >
          <GripVertical className="h-6 w-6 text-muted-foreground/70 hover:text-muted-foreground transition-colors" />
        </div>
      )}
    </div>
  );
}
