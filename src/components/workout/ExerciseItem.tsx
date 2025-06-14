
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExerciseLog, ExerciseSet } from '@/types';
import { Trash2, Plus } from 'lucide-react';

interface ExerciseItemProps {
  exercise: ExerciseLog;
  onUpdate: (updatedExercise: ExerciseLog) => void;
  onRemove: (exerciseId: string) => void;
}

export const ExerciseItem = ({ exercise, onUpdate, onRemove }: ExerciseItemProps) => {
  const handleSetChange = (setId: string, field: 'reps' | 'weight', value: string) => {
    const updatedSets = exercise.sets.map((set) =>
      set.id === setId ? { ...set, [field]: value } : set
    );
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const addSet = () => {
    const newSet: ExerciseSet = { id: nanoid(), reps: '', weight: '' };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const removeSet = (setId: string) => {
    const updatedSets = exercise.sets.filter((set) => set.id !== setId);
    onUpdate({ ...exercise, sets: updatedSets });
  };

  return (
    <div className="p-4 rounded-lg bg-gray-800/50 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">{exercise.name}</h3>
        <Button variant="ghost" size="icon" onClick={() => onRemove(exercise.id)}>
          <Trash2 className="text-destructive" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-2 items-center text-sm text-gray-400 px-1">
          <span>Set</span>
          <span>Poids (kg)</span>
          <span>Reps</span>
          <span></span>
        </div>
        {exercise.sets.map((set, index) => (
          <div key={set.id} className="grid grid-cols-4 gap-2 items-center">
            <span className="font-bold text-center">{index + 1}</span>
            <Input
              type="number"
              value={set.weight}
              onChange={(e) => handleSetChange(set.id, 'weight', e.target.value)}
              placeholder="0"
              className="text-base"
            />
            <Input
              type="number"
              value={set.reps}
              onChange={(e) => handleSetChange(set.id, 'reps', e.target.value)}
              placeholder="0"
              className="text-base"
            />
            <Button variant="ghost" size="icon" onClick={() => removeSet(set.id)} className="justify-self-center">
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={addSet} variant="outline" className="w-full">
        <Plus size={16} />
        Ajouter une série
      </Button>
    </div>
  );
};
