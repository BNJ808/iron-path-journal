
import { useState } from 'react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExerciseLog, ExerciseSet } from '@/types';
import { Trash2, Plus, MessageSquare, Star, X, Check } from 'lucide-react';
import { AiExerciseAnalysisDialog } from './AiExerciseAnalysisDialog';
import { Textarea } from '@/components/ui/textarea';
import { useFavoriteExercises } from '@/hooks/useFavoriteExercises';
import { cn } from '@/lib/utils';

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
    <div className="p-4 rounded-lg bg-secondary/60 backdrop-blur-sm space-y-4 border border-border/30 shadow-lg">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-1 flex-shrink min-w-0">
            <Button variant="ghost" size="icon" className="-ml-2" onClick={() => toggleFavorite(exercise.exerciseId)} aria-label="Toggle favorite">
                <Star className={`h-5 w-5 transition-colors ${isFavorite(exercise.exerciseId) ? 'text-accent-yellow fill-accent-yellow' : 'text-foreground/60 hover:text-accent-yellow'}`} />
            </Button>
            <h3 className="font-bold text-lg text-accent-blue truncate">{exercise.name}</h3>
        </div>
        <div className="flex items-center flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setShowNotes(!showNotes)} aria-label="Toggle exercise notes">
                <MessageSquare className="h-5 w-5 text-foreground/80 hover:text-foreground" />
            </Button>
            <AiExerciseAnalysisDialog exerciseId={exercise.exerciseId} exerciseName={exercise.name} />
            <Button variant="ghost" size="icon" onClick={() => onRemove(exercise.id)} aria-label="Remove exercise">
              <Trash2 className="text-destructive/80 hover:text-destructive" />
            </Button>
        </div>
      </div>

      {showNotes && (
        <Textarea
            placeholder="Notes sur l'exercice (sensation, technique...)"
            value={exercise.notes || ''}
            onChange={handleNoteChange}
            className="mt-2 text-base bg-background/50"
        />
      )}


      <div className="space-y-3">
        <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem_2.5rem] gap-x-3 items-center text-sm text-foreground font-medium">
          <span className="text-center">#</span>
          <span className="text-center">Poids</span>
          <span className="text-center">Reps</span>
          <span className="text-center">Fait</span>
          <span />
        </div>
        {exercise.sets.map((set, index) => (
          <div key={set.id} className="grid grid-cols-[2rem_1fr_1fr_2.5rem_2.5rem] gap-x-3 items-center">
            <span className="font-bold text-center text-foreground">{index + 1}</span>
            <Input
              type="number"
              value={set.weight}
              onChange={(e) => handleSetChange(set.id, 'weight', e.target.value)}
              placeholder="-"
              className="text-base text-center bg-transparent border-border/50 focus:border-primary"
            />
            <Input
              type="number"
              value={set.reps}
              onChange={(e) => handleSetChange(set.id, 'reps', e.target.value)}
              placeholder="-"
              className="text-base text-center bg-transparent border-border/50 focus:border-primary"
            />
            <div className="flex justify-center">
              <button
                  onClick={() => handleSetChange(set.id, 'completed', !set.completed)}
                  aria-label={`Mark set ${index + 1} as ${set.completed ? 'not completed' : 'completed'}`}
                  className={cn(
                      'flex items-center justify-center h-8 w-8 rounded-lg border-2 transition-all',
                      set.completed
                          ? 'bg-accent-green border-accent-green text-black'
                          : 'bg-transparent border-foreground/30 text-foreground/50 hover:border-accent-red hover:text-accent-red'
                  )}
              >
                  {set.completed ? <Check size={18} /> : <X size={16} />}
              </button>
            </div>
            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => removeSet(set.id)} className="h-8 w-8 p-0" aria-label="Remove set">
                <Trash2 size={16} className="text-destructive/70 hover:text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={addSet} variant="outline" className="w-full border-dashed hover:border-solid hover:border-primary/70 text-foreground/80 hover:text-primary-foreground">
        <Plus size={16} className="mr-2" />
        Ajouter une série
      </Button>
    </div>
  );
};
