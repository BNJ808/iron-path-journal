
import { DraggableStatsCards } from '@/components/stats/DraggableStatsCards';
import { useState, useEffect } from 'react';
import { BarChart3, CalendarDays } from 'lucide-react';
import { useStatsCalculations } from '@/hooks/useStatsCalculations';
import { useMuscleGroupStats } from '@/hooks/useMuscleGroupStats';
import { useExerciseProgress } from '@/hooks/useExerciseProgress';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useUserSettings } from '@/hooks/useUserSettings';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/stats/DateRangePicker';

const StatsPage = () => {
  const [isDndEnabled, setIsDndEnabled] = useState(false);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
  
  const { settings, updateSettings, isLoading: isLoadingSettings } = useUserSettings();
  
  // Utiliser les paramètres synchronisés ou les valeurs par défaut
  const defaultCardOrder = [
    'overview',
    'one-rm-calculator',
    'volume',
    'personalRecords',
    'muscle-groups',
    'exercise-progress',
    'progression-predictions',
    'exercise-progression-ranking',
    'ai-analysis'
  ];

  const [cardOrder, setCardOrder] = useState(defaultCardOrder);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Synchroniser avec les paramètres utilisateur
  useEffect(() => {
    if (!isLoadingSettings && settings) {
      if (settings.statsCardOrder) {
        setCardOrder(settings.statsCardOrder);
      }
      if (settings.statsDateRange) {
        setDateRange(settings.statsDateRange);
      }
    }
  }, [settings, isLoadingSettings]);

  // Sauvegarder les changements dans les paramètres utilisateur
  const handleDateRangeChange = async (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    try {
      await updateSettings({ statsDateRange: newDateRange });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la plage de dates:', error);
    }
  };

  const handleCardOrderChange = async (newOrder: string[]) => {
    setCardOrder(newOrder);
    try {
      await updateSettings({ statsCardOrder: newOrder });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'ordre des cartes:', error);
    }
  };

  const { workouts, isLoading: isWorkoutsLoading } = useWorkoutHistory();
  const { filteredWorkouts, stats, estimated1RMs, uniqueExercises } = useStatsCalculations(workouts, dateRange);
  
  // Utiliser les workouts filtrés (sans les sorties running) selon le filtre de date
  const workoutsForMuscleStats = dateRange?.from ? filteredWorkouts : (filteredWorkouts || []);
  const { volumeByMuscleGroup, muscleGroupStats } = useMuscleGroupStats(workoutsForMuscleStats);
  
  const selectedExerciseData = useExerciseProgress(selectedExerciseName, filteredWorkouts);
  const { 
    personalRecordsTimeline, 
    progressionPredictions, 
    weightPerformanceCorrelation, 
    exerciseProgressionRanking, 
    strengthRatios 
  } = useAdvancedStats(workouts, dateRange); // useAdvancedStats gère déjà le filtrage en interne

  const isLoading = isWorkoutsLoading || isLoadingSettings;

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
