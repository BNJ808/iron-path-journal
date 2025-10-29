import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExerciseLog } from '@/types';

interface EditExerciseSetsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exercise: ExerciseLog;
    onSave: (updatedExercise: ExerciseLog) => void;
    isLoading?: boolean;
}

const EditExerciseSetsDialog = ({ 
    open, 
    onOpenChange, 
    exercise, 
    onSave, 
    isLoading = false 
}: EditExerciseSetsDialogProps) => {
    const [editedExercise, setEditedExercise] = useState<ExerciseLog>(exercise);

    const handleSetChange = (setIndex: number, field: 'reps' | 'weight', value: string) => {
        const newSets = [...editedExercise.sets];
        newSets[setIndex] = {
            ...newSets[setIndex],
            [field]: value
        };
        setEditedExercise({
            ...editedExercise,
            sets: newSets
        });
    };

    const handleSave = () => {
        onSave(editedExercise);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Modifier {exercise.name}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    {editedExercise.sets.map((set, index) => (
                        <div key={set.id} className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-secondary/30">
                            <div className="space-y-2">
                                <Label htmlFor={`weight-${index}`} className="text-xs">
                                    Poids (kg) - Série {index + 1}
                                </Label>
                                <Input
                                    id={`weight-${index}`}
                                    type="number"
                                    step="0.5"
                                    value={set.weight}
                                    onChange={(e) => handleSetChange(index, 'weight', e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`reps-${index}`} className="text-xs">
                                    Répétitions
                                </Label>
                                <Input
                                    id={`reps-${index}`}
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
                                    className="h-9"
                                />
                            </div>
                        </div>
                    ))}
                    
                    {editedExercise.notes && (
                        <div className="space-y-2">
                            <Label className="text-xs">Note de l'exercice</Label>
                            <p className="text-sm text-muted-foreground italic p-2 bg-secondary/20 rounded">
                                {editedExercise.notes}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditExerciseSetsDialog;
