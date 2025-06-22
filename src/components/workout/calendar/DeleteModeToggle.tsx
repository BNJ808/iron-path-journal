
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteModeToggleProps {
  isDeleteMode: boolean;
  onToggle: () => void;
}

export const DeleteModeToggle = ({ isDeleteMode, onToggle }: DeleteModeToggleProps) => {
  return (
    <div className="flex justify-end">
      <Button
        variant={isDeleteMode ? "destructive" : "outline"}
        size="sm"
        onClick={onToggle}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        {isDeleteMode ? "Désactiver suppression" : "Activer suppression"}
      </Button>
    </div>
  );
};
