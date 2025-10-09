import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ManualValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  onValidate: (date: Date, note?: string) => void;
}

export const ManualValidationDialog = ({
  open,
  onOpenChange,
  date,
  onValidate,
}: ManualValidationDialogProps) => {
  const [note, setNote] = useState('');

  const handleValidate = () => {
    onValidate(date, note.trim() || undefined);
    setNote('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Valider le jour manuellement</DialogTitle>
          <DialogDescription>
            Marquer le {format(date, 'dd MMMM yyyy', { locale: fr })} comme une journée d'activité validée
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Textarea
              id="note"
              placeholder="Ex: Course à pied 10km, escalade, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Ajoutez une note pour vous rappeler de l'activité réalisée
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleValidate}>
            Valider
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
