import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

interface EditWorkoutDurationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentDuration: number; // en minutes
    onSave: (newDuration: number) => void;
    isLoading?: boolean;
}

const EditWorkoutDurationDialog = ({ 
    open, 
    onOpenChange, 
    currentDuration, 
    onSave,
    isLoading = false
}: EditWorkoutDurationDialogProps) => {
    const [hours, setHours] = useState(Math.floor(currentDuration / 60));
    const [minutes, setMinutes] = useState(currentDuration % 60);

    const handleSave = () => {
        const totalMinutes = hours * 60 + minutes;
        if (totalMinutes > 0) {
            onSave(totalMinutes);
        }
    };

    const handleHoursChange = (value: string) => {
        const h = parseInt(value) || 0;
        if (h >= 0 && h <= 24) {
            setHours(h);
        }
    };

    const handleMinutesChange = (value: string) => {
        const m = parseInt(value) || 0;
        if (m >= 0 && m <= 59) {
            setMinutes(m);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-accent-blue" />
                        Modifier la durée
                    </DialogTitle>
                    <DialogDescription>
                        Ajustez la durée de votre entraînement si vous avez oublié de l'arrêter.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="hours">Heures</Label>
                        <Input
                            id="hours"
                            type="number"
                            min="0"
                            max="24"
                            value={hours}
                            onChange={(e) => handleHoursChange(e.target.value)}
                            className="text-center"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="minutes">Minutes</Label>
                        <Input
                            id="minutes"
                            type="number"
                            min="0"
                            max="59"
                            value={minutes}
                            onChange={(e) => handleMinutesChange(e.target.value)}
                            className="text-center"
                        />
                    </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Durée totale: {hours > 0 && `${hours}h `}{minutes}min
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isLoading || (hours === 0 && minutes === 0)}
                    >
                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditWorkoutDurationDialog;