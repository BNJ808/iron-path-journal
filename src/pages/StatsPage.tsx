
import { DraggableStatsCards } from '@/components/stats/DraggableStatsCards';
import { useState, useEffect } from 'react';
import { BarChart3, CalendarDays } from 'lucide-react';
import { useStatsCalculations } from '@/hooks/useStatsCalculations';
import { useMuscleGroupStats } from '@/hooks/useMuscleGroupStats';
import { useExerciseProgress } from '@/hooks/useExerciseProgress';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useIsMobile } from '@/hooks/use-mobile';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/stats/DateRangePicker';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const StatsPage = () => {
  const [isDndEnabled, setIsDndEnabled] = useState(false);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
  const [isModuleManagerOpen, setIsModuleManagerOpen] = useState(false);
  const isMobile = useIsMobile();
  
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    // Par défaut, définir la période sur le mois courant
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: startOfMonth, to: today };
  });
  const [hiddenModules, setHiddenModules] = useState<string[]>([]);

  // Synchroniser avec les paramètres utilisateur
  useEffect(() => {
    if (!isLoadingSettings && settings) {
      if (settings.statsCardOrder) {
        setCardOrder(settings.statsCardOrder);
      }
      if (settings.statsDateRange) {
        setDateRange(settings.statsDateRange);
      } else {
        // Si aucune période n'est sauvegardée, sauvegarder la période par défaut
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const defaultRange = { from: startOfMonth, to: today };
        handleDateRangeChange(defaultRange);
      }
      if (settings.hiddenStatsModules) {
        setHiddenModules(settings.hiddenStatsModules);
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

  const handleModuleVisibilityChange = async (moduleId: string, isVisible: boolean) => {
    const newHiddenModules = isVisible 
      ? hiddenModules.filter(id => id !== moduleId)
      : [...hiddenModules, moduleId];
    
    setHiddenModules(newHiddenModules);
    try {
      await updateSettings({ hiddenStatsModules: newHiddenModules });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des modules masqués:', error);
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

  const moduleLabels = {
    'overview': 'Vue d\'ensemble',
    'one-rm-calculator': 'Calculateur 1RM',
    'volume': 'Volume par groupe musculaire',
    'personalRecords': 'Records personnels',
    'muscle-groups': 'Séries par groupe musculaire',
    'exercise-progress': 'Progression des exercices',
    'progression-predictions': 'Prédictions de progression',
    'exercise-progression-ranking': 'Classement de progression',
    'ai-analysis': 'Analyse IA'
  };

  const visibleCardOrder = cardOrder.filter(cardId => !hiddenModules.includes(cardId));

  return (
    <div className="p-2 sm:p-4 space-y-4 max-w-7xl mx-auto">
      <div className={`flex items-center ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-accent-blue" />
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground`}>Statistiques</h1>
        </div>
        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
          <Dialog open={isModuleManagerOpen} onOpenChange={setIsModuleManagerOpen}>
            <DialogTrigger asChild>
              <button className={`${isMobile ? 'px-2 py-1' : 'px-3 py-1'} rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1`}>
                <Settings className="h-4 w-4" />
                {!isMobile && 'Modules'}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Gérer les modules</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {defaultCardOrder.map((moduleId) => (
                  <div key={moduleId} className="flex items-center space-x-2">
                    <Checkbox
                      id={moduleId}
                      checked={!hiddenModules.includes(moduleId)}
                      onCheckedChange={(checked) => 
                        handleModuleVisibilityChange(moduleId, checked as boolean)
                      }
                    />
                    <label htmlFor={moduleId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                      {!hiddenModules.includes(moduleId) ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-red-500" />
                      )}
                      {moduleLabels[moduleId as keyof typeof moduleLabels]}
                    </label>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <button
            onClick={() => setIsDndEnabled(!isDndEnabled)}
            className={`${isMobile ? 'px-2 py-1' : 'px-3 py-1'} rounded-md text-sm font-medium transition-colors ${
              isDndEnabled 
                ? 'bg-accent-blue text-white' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {isDndEnabled ? 'Terminer' : 'Réorganiser'}
          </button>
        </div>
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
          cardOrder={visibleCardOrder}
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
