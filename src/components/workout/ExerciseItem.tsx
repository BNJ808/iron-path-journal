
import { useState } from 'react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExerciseLog, ExerciseSet } from '@/types';
import { Trash2, Plus, MessageSquare, Star, X, Check } from 'lucide-react';
import { AiExerciseAnalysisDialog } from './AiExerciseAnalysisDialog';
import { Textarea } from '@/components/ui/textarea';
import { useFavoriteExercises } from '@/hooks/useFavoriteExercises';

interface ExerciseItemProps {
  exercise: ExerciseLog;
  onUpdate: (updatedExercise: ExerciseLog) => void;
  onRemove: (exerciseId: string) => void;
}

export const ExerciseItem = ({ exercise, onUpdate, onRemove }: ExerciseItemProps) => {
  const [showNotes, setShowNotes] = useState(!!exercise.notes);
  const { isFavorite, toggleFavorite } = useFavoriteExercises();

  const handleSetChange = (setId: string, field: 'reps' | 'weight' | 'completed', value: string | boolean) => {
    const updatedSets = exercise.sets.map((set) =>
      set.id === setId ? { ...set, [field]: value } : set
    );
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...exercise, notes: e.target.value });
  };

  const addSet = () => {
    const firstSet = exercise.sets.length > 0 ? exercise.sets[0] : null;
    const newSet: ExerciseSet = {
      id: nanoid(),
      reps: firstSet ? firstSet.reps : '',
      weight: firstSet ? firstSet.weight : '',
      completed: false,
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const removeSet = (setId: string) => {
    const updatedSets = exercise.sets.filter((set) => set.id !== setId);
    onUpdate({ ...exercise, sets: updatedSets });
  };

  return (
    <div className="p-4 rounded-lg bg-secondary space-y-4 border">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => toggleFavorite(exercise.exerciseId)} aria-label="Toggle favorite">
                <Star className={`h-5 w-5 transition-colors ${isFavorite(exercise.exerciseId) ? 'text-accent-yellow fill-accent-yellow' : 'text-gray-400 hover:text-accent-yellow'}`} />
            </Button>
            <h3 className="font-bold text-lg text-accent-blue">{exercise.name}</h3>
        </div>
        <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setShowNotes(!showNotes)} aria-label="Toggle exercise notes">
                <MessageSquare className="h-5 w-5" />
            </Button>
            <AiExerciseAnalysisDialog exerciseId={exercise.exerciseId} exerciseName={exercise.name} />
            <Button variant="ghost" size="icon" onClick={() => onRemove(exercise.id)} aria-label="Remove exercise">
              <Trash2 className="text-destructive" />
            </Button>
        </div>
      </div>

      {showNotes && (
        <Textarea
            placeholder="Notes sur l'exercice (sensation, technique...)"
            value={exercise.notes || ''}
            onChange={handleNoteChange}
            className="mt-2 text-base"
        />
      )}


      <div className="space-y-2">
        <div className="grid grid-cols-5 gap-2 items-center text-sm text-muted-foreground px-1">
          <span>Set</span>
          <span>Poids (kg)</span>
          <span>Reps</span>
          <span />
          <span className="text-center">Fait</span>
        </div>
        {exercise.sets.map((set, index) => (
          <div key={set.id} className="grid grid-cols-5 gap-2 items-center">
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
            <Button variant="ghost" size="icon" onClick={() => removeSet(set.id)} className="justify-self-center" aria-label="Remove set">
              <Trash2 size={16} className="text-destructive" />
            </Button>
            <button
                onClick={() => handleSetChange(set.id, 'completed', !set.completed)}
                aria-label={`Mark set ${index + 1} as ${set.completed ? 'not completed' : 'completed'}`}
                className={`justify-self-center flex items-center justify-center h-6 w-6 rounded-sm border-2 transition-colors
                    ${set.completed
                        ? 'bg-accent-green border-accent-green text-primary-foreground'
                        : 'bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/90'
                    }`}
            >
                {set.completed ? <Check size={16} /> : <X size={16} />}
            </button>
          </div>
        ))}
      </div>

      <Button onClick={addSet} variant="outline" className="w-full hover:bg-background hover:brightness-110">
        <Plus size={16} />
        Ajouter une série
      </Button>
    </div>
  );
};
