
import { DraggableStatsCards } from '@/components/stats/DraggableStatsCards';
import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useStatsCalculations } from '@/hooks/useStatsCalculations';
import { useMuscleGroupStats } from '@/hooks/useMuscleGroupStats';
import { useExerciseProgress } from '@/hooks/useExerciseProgress';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';

const StatsPage = () => {
  const [isDndEnabled, setIsDndEnabled] = useState(false);
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

  const {
    stats,
    isLoading: isStatsLoading,
    volumeData,
    workoutData,
    personalRecords
  } = useStatsCalculations();

  const { muscleGroupData, isLoading: isMuscleLoading } = useMuscleGroupStats();
  const { exerciseProgressData, isLoading: isProgressLoading } = useExerciseProgress();
  const { 
    progressionPredictions, 
    exerciseProgressionRanking, 
    strengthRatios,
    isLoading: isAdvancedLoading 
  } = useAdvancedStats();

  const isLoading = isStatsLoading || isMuscleLoading || isProgressLoading || isAdvancedLoading;

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
          volumeData={volumeData}
          workoutData={workoutData}
          personalRecords={personalRecords}
          muscleGroupData={muscleGroupData}
          exerciseProgressData={exerciseProgressData}
          progressionPredictions={progressionPredictions}
          exerciseProgressionRanking={exerciseProgressionRanking}
          strengthRatios={strengthRatios}
        />
      )}
    </div>
  );
};

export default StatsPage;
