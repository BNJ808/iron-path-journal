
import { DraggableStatsCards } from '@/components/stats/DraggableStatsCards';
import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useStatsCalculations } from '@/hooks/useStatsCalculations';
import { useMuscleGroupStats } from '@/hooks/useMuscleGroupStats';
import { useExerciseProgress } from '@/hooks/useExerciseProgress';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { DateRange } from 'react-day-picker';

const StatsPage = () => {
  const [isDndEnabled, setIsDndEnabled] = useState(false);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [cardOrder, setCardOrder] = useState([
    'overview',
    'volume',
    'personalRecords',
    'muscle-groups',
    'exercise-progress',
    'interactive-personal-records',
    'progression-predictions',
    'exercise-progression-ranking',
    'strength-ratios'
  ]);

  const { workouts, isLoading: isWorkoutsLoading } = useWorkoutHistory();
  const { filteredWorkouts, stats, estimated1RMs, uniqueExercises } = useStatsCalculations(workouts, dateRange);
  const { volumeByMuscleGroup, muscleGroupStats } = useMuscleGroupStats(filteredWorkouts);
  const selectedExerciseData = useExerciseProgress(selectedExerciseName, workouts);
  const { 
    personalRecordsTimeline, 
    progressionPredictions, 
    exerciseProgressionRanking, 
    strengthRatios 
  } = useAdvancedStats(workouts);

  const isLoading = isWorkoutsLoading;

  const handleViewProgression = (exerciseName: string) => {
    setSelectedExerciseName(exerciseName);
  };

  return (
    <div className="p-2 sm:p-4 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-accent-blue" />
          <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
        </div>
        <button
          onClick={() => setIsDndEnabled(!isDndEnabled)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            isDndEnabled 
              ? 'bg-accent-blue text-white' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {isDndEnabled ? 'Terminer' : 'Réorganiser'}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-card rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <DraggableStatsCards
          cardOrder={cardOrder}
          onCardOrderChange={setCardOrder}
          isDndEnabled={isDndEnabled}
          stats={stats}
          volumeByMuscleGroup={volumeByMuscleGroup}
          muscleGroupStats={muscleGroupStats}
          uniqueExercises={uniqueExercises}
          selectedExerciseName={selectedExerciseName}
          onSelectedExerciseChange={setSelectedExerciseName}
          selectedExerciseData={selectedExerciseData}
          workouts={workouts}
          dateRange={dateRange}
          estimated1RMs={estimated1RMs}
          onViewProgression={handleViewProgression}
          exerciseProgressCardRef={{ current: null }}
          personalRecordsTimeline={personalRecordsTimeline}
          progressionPredictions={progressionPredictions}
          exerciseProgressionRanking={exerciseProgressionRanking}
          strengthRatios={strengthRatios}
        />
      )}
    </div>
  );
};

export default StatsPage;
