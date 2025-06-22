
import { DraggableStatsCards } from '@/components/stats/DraggableStatsCards';
import { useState, useEffect } from 'react';
import { BarChart3, CalendarDays } from 'lucide-react';
import { useStatsCalculations } from '@/hooks/useStatsCalculations';
import { useMuscleGroupStats } from '@/hooks/useMuscleGroupStats';
import { useExerciseProgress } from '@/hooks/useExerciseProgress';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/stats/DateRangePicker';

const StatsPage = () => {
  const [isDndEnabled, setIsDndEnabled] = useState(false);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // Charger l'ordre des cartes depuis localStorage
  const [cardOrder, setCardOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('statsCardOrder');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'ordre des cartes:', error);
    }
    // Ordre par défaut avec la nouvelle calculatrice 1RM
    return [
      'overview',
      'volume',
      'personalRecords',
      'muscle-groups',
      'exercise-progress',
      'one-rm-calculator',
      'progression-predictions',
      'exercise-progression-ranking',
      'ai-analysis'
    ];
  });

  // Charger la plage de dates depuis localStorage
  useEffect(() => {
    try {
      const savedDateRange = localStorage.getItem('statsDateRange');
      if (savedDateRange) {
        const parsed = JSON.parse(savedDateRange);
        // Convertir les chaînes de date en objets Date
        if (parsed.from) parsed.from = new Date(parsed.from);
        if (parsed.to) parsed.to = new Date(parsed.to);
        setDateRange(parsed);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la plage de dates:', error);
    }
  }, []);

  // Sauvegarder la plage de dates dans localStorage à chaque changement
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    try {
      if (newDateRange) {
        localStorage.setItem('statsDateRange', JSON.stringify(newDateRange));
      } else {
        localStorage.removeItem('statsDateRange');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la plage de dates:', error);
    }
  };

  // Sauvegarder l'ordre des cartes dans localStorage
  const handleCardOrderChange = (newOrder: string[]) => {
    setCardOrder(newOrder);
    try {
      localStorage.setItem('statsCardOrder', JSON.stringify(newOrder));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'ordre des cartes:', error);
    }
  };

  const { workouts, isLoading: isWorkoutsLoading } = useWorkoutHistory();
  const { filteredWorkouts, stats, estimated1RMs, uniqueExercises } = useStatsCalculations(workouts, dateRange);
  
  // Utiliser les workouts appropriés selon le filtre de date
  const workoutsForMuscleStats = dateRange?.from ? filteredWorkouts : (workouts || []);
  const { volumeByMuscleGroup, muscleGroupStats } = useMuscleGroupStats(workoutsForMuscleStats);
  
  const selectedExerciseData = useExerciseProgress(selectedExerciseName, workouts);
  const { 
    personalRecordsTimeline, 
    progressionPredictions, 
    exerciseProgressionRanking
  } = useAdvancedStats(workouts, dateRange);

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

      {/* Section de sélection de plage de dates */}
      <div className="bg-card rounded-lg p-4 border">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-5 w-5 text-accent-blue" />
          <h3 className="font-medium">Période d'analyse</h3>
        </div>
        <DateRangePicker 
          date={dateRange} 
          onDateChange={handleDateRangeChange}
        />
        {dateRange?.from && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleDateRangeChange(undefined)}
              className="text-xs px-2 py-1 bg-secondary rounded hover:bg-secondary/80 transition-colors"
            >
              Effacer les filtres
            </button>
          </div>
        )}
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
          onCardOrderChange={handleCardOrderChange}
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
        />
      )}
    </div>
  );
};

export default StatsPage;
