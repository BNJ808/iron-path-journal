
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Move } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { subDays } from 'date-fns';
import { DateRangePicker } from '@/components/stats/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { Toggle } from '@/components/ui/toggle';
import { DraggableStatsCards } from '@/components/stats/DraggableStatsCards';
import { useStatsCalculations } from '@/hooks/useStatsCalculations';
import { useMuscleGroupStats } from '@/hooks/useMuscleGroupStats';
import { useExerciseProgress } from '@/hooks/useExerciseProgress';

const StatsPage = () => {
    const { workouts, isLoading } = useWorkoutHistory();
    const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
    const exerciseProgressCardRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });
    const [isDndEnabled, setIsDndEnabled] = useState(false);

    const defaultCardOrder = ['stats', 'oneRepMax', 'volume', 'muscle', 'progress', 'records', 'ai'];

    const [cardOrder, setCardOrder] = useState<string[]>(() => {
        try {
            const savedOrder = localStorage.getItem('statsCardOrder');
            if (savedOrder) {
                const parsedOrder = JSON.parse(savedOrder) as string[];
                const filteredOrder = parsedOrder.filter(id => defaultCardOrder.includes(id));
                const newCards = defaultCardOrder.filter(id => !filteredOrder.includes(id));
                const finalOrder = [...filteredOrder, ...newCards];

                if (finalOrder.length === defaultCardOrder.length) {
                    return finalOrder;
                }
            }
        } catch (error) {
            console.error("Failed to parse card order from localStorage", error);
        }
        return defaultCardOrder;
    });

    const { filteredWorkouts, stats, estimated1RMs, uniqueExercises } = useStatsCalculations(workouts, dateRange);
    const { volumeByMuscleGroup, muscleGroupStats } = useMuscleGroupStats(filteredWorkouts);
    const selectedExerciseData = useExerciseProgress(selectedExerciseName, workouts);

    const handleViewProgression = useCallback((exerciseName: string) => {
        setSelectedExerciseName(exerciseName);
        exerciseProgressCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    if (isLoading) {
        return (
            <div className="p-2 sm:p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-4 w-2/3 mb-4" />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>

                <div>
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-2 sm:p-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-accent-purple" />
                    <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
                </div>
                <Toggle
                    pressed={isDndEnabled}
                    onPressedChange={setIsDndEnabled}
                    aria-label="Activer/désactiver la réorganisation"
                    title="Réorganiser les cartes"
                >
                    <Move className="h-4 w-4" />
                </Toggle>
            </div>
            <p className="text-gray-400 mt-2 mb-6">Visualisez vos progrès et vos performances.</p>

            <div className="mb-6">
                <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            </div>

            {filteredWorkouts.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-500">Aucune statistique disponible pour la période sélectionnée.</p>
                    <p className="text-sm text-gray-600 mt-2">Terminez une séance pour voir vos statistiques ici, ou changez la plage de dates.</p>
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
                    exerciseProgressCardRef={exerciseProgressCardRef}
                />
            )}
        </div>
    );
};

export default StatsPage;
