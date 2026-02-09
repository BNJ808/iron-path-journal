
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useMemo } from 'react';

interface ExerciseRecordsDialogProps {
  exerciseName: string;
}

export const ExerciseRecordsDialog = ({ exerciseName }: ExerciseRecordsDialogProps) => {
  const { workouts } = useWorkoutHistory();

  const records = useMemo(() => {
    if (!workouts?.length) return null;

    let maxWeight = 0;
    let maxWeightReps = 0;
    let maxVolume = 0;
    let maxVolumeDetails = '';
    let maxReps = 0;
    let maxRepsWeight = 0;
    let found = false;

    for (const workout of workouts) {
      for (const exercise of workout.exercises) {
        if (exercise.name !== exerciseName) continue;
        for (const set of exercise.sets) {
          if (!set.completed) continue;
          const w = Number(set.weight);
          const r = Number(set.reps);
          if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) continue;
          found = true;

          if (w > maxWeight || (w === maxWeight && r > maxWeightReps)) {
            maxWeight = w;
            maxWeightReps = r;
          }
          if (r > maxReps || (r === maxReps && w > maxRepsWeight)) {
            maxReps = r;
            maxRepsWeight = w;
          }
          const vol = w * r;
          if (vol > maxVolume) {
            maxVolume = vol;
            maxVolumeDetails = `${w}kg x ${r}`;
          }
        }
      }
    }

    if (!found) return null;

    return { maxWeight, maxWeightReps, maxReps, maxRepsWeight, maxVolume, maxVolumeDetails };
  }, [workouts, exerciseName]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Voir les records">
          <Trophy className="h-5 w-5 text-foreground/80 hover:text-accent-yellow" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent-yellow" />
            Records — {exerciseName}
          </DialogTitle>
        </DialogHeader>
        {records ? (
          <div className="space-y-3 mt-2">
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/60">
              <span className="text-sm text-foreground/80">Poids max</span>
              <span className="font-bold">{records.maxWeight} kg x {records.maxWeightReps}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/60">
              <span className="text-sm text-foreground/80">Reps max</span>
              <span className="font-bold">{records.maxRepsWeight} kg x {records.maxReps}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/60">
              <span className="text-sm text-foreground/80">Volume max (série)</span>
              <span className="font-bold">{records.maxVolumeDetails} = {records.maxVolume} kg</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/60 mt-2">Aucun record trouvé. Complète des séances pour voir tes records !</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
