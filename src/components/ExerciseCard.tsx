import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from "@/components/ui/checkbox";
import { nanoid } from 'nanoid';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import type { Exercise, ExerciseSet } from '@/types';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdateExercise: (exercise: Exercise) => void;
  onRemoveExercise: (exerciseId: string) => void;
}

const ExerciseCard = ({ exercise, onUpdateExercise, onRemoveExercise }: ExerciseCardProps) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleSetChange = (setId: string, field: 'reps' | 'weight', value: string) => {
        const numericValue = field === 'reps' ? parseInt(value, 10) : parseFloat(value);
        const updatedSets = exercise.sets.map(set =>
            set.id === setId ? { ...set, [field]: isNaN(numericValue) ? 0 : numericValue } : set
        );
        onUpdateExercise({ ...exercise, sets: updatedSets });
    };

    const handleSetCompletedChange = (setId: string, isCompleted: boolean) => {
        const updatedSets = exercise.sets.map(set =>
            set.id === setId ? { ...set, isCompleted } : set
        );
        onUpdateExercise({ ...exercise, sets: updatedSets });
    };

    const addSet = () => {
        const lastSet = exercise.sets[exercise.sets.length - 1] || { reps: 0, weight: 0 };
        const newSet: ExerciseSet = {
            id: nanoid(),
            reps: lastSet.reps,
            weight: lastSet.weight,
            isCompleted: false,
        };
        onUpdateExercise({ ...exercise, sets: [...exercise.sets, newSet] });
    };

    const removeSet = (setId: string) => {
        if (exercise.sets.length <= 1) return;
        const updatedSets = exercise.sets.filter(set => set.id !== setId);
        onUpdateExercise({ ...exercise, sets: updatedSets });
    };

    const handleNoteChange = (note: string) => {
        onUpdateExercise({ ...exercise, notes: note });
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="custom-card">
            <div className="flex items-center justify-between p-4">
                <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-3 text-left w-full">
                        <span className="font-semibold text-lg flex-grow">{exercise.name}</span>
                        <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
                    </button>
                </CollapsibleTrigger>
                <Button variant="ghost" size="icon" onClick={() => onRemoveExercise(exercise.id)}>
                    <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
            </div>
            <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-12 gap-2 text-sm text-gray-400 font-medium px-2">
                        <div className="col-span-1">Set</div>
                        <div className="col-span-4">Poids (kg)</div>
                        <div className="col-span-4">Reps</div>
                        <div className="col-span-3 text-center">Fait</div>
                    </div>
                    {exercise.sets.map((set, index) => (
                        <div key={set.id} className={cn("grid grid-cols-12 gap-2 items-center rounded-md p-2 -mx-2", set.isCompleted ? "bg-green-800/30" : "bg-gray-800/50")}>
                            <div className="col-span-1 font-bold text-center">{index + 1}</div>
                            <div className="col-span-4">
                                <Input
                                    type="number"
                                    value={set.weight}
                                    onChange={(e) => handleSetChange(set.id, 'weight', e.target.value)}
                                    className="bg-gray-700 border-gray-600 h-9"
                                    placeholder="0"
                                />
                            </div>
                            <div className="col-span-4">
                                <Input
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) => handleSetChange(set.id, 'reps', e.target.value)}
                                    className="bg-gray-700 border-gray-600 h-9"
                                    placeholder="0"
                                />
                            </div>
                            <div className="col-span-2 flex justify-center">
                                 <Checkbox
                                    checked={set.isCompleted}
                                    onCheckedChange={(checked) => handleSetCompletedChange(set.id, !!checked)}
                                    className="h-6 w-6"
                                />
                            </div>
                            <div className="col-span-1 flex justify-center">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSet(set.id)} disabled={exercise.sets.length <= 1}>
                                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <Button onClick={addSet} variant="outline" className="w-full mt-3">
                        <Plus className="mr-2 h-4 w-4" /> Ajouter une série
                    </Button>
                    <div className="pt-2">
                        <Label htmlFor={`notes-${exercise.id}`} className="text-sm font-medium text-gray-400 mb-2 block">
                            Notes d'exercice
                        </Label>
                        <Textarea
                            id={`notes-${exercise.id}`}
                            placeholder="Ajouter des notes (ex: ressenti, technique...)"
                            value={exercise.notes || ''}
                            onChange={(e) => handleNoteChange(e.target.value)}
                            className="bg-gray-700 border-gray-600 min-h-[60px]"
                            rows={2}
                        />
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};

export default ExerciseCard;
