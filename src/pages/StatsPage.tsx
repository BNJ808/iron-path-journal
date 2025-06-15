
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { AiAnalysisCard } from '@/components/AiAnalysisCard';
import { BarChart3 } from 'lucide-react';
import { useMemo, useState, useRef } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StatCards } from '@/components/stats/StatCards';
import { VolumeChart } from '@/components/stats/VolumeChart';
import { ExerciseProgress } from '@/components/stats/ExerciseProgress';
import { PersonalRecords } from '@/components/stats/PersonalRecords';
import { useExerciseDatabase } from '@/hooks/useExerciseDatabase';
import { MuscleGroupRadarChart } from '@/components/stats/MuscleGroupRadarChart';
import { DateRangePicker } from '@/components/stats/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { SortableCardItem } from '@/components/stats/SortableCardItem';

interface PersonalRecord {
    weight: number;
    reps: number;
}

const StatsPage = () => {
    const { workouts, isLoading } = useWorkoutHistory();
    const { allGroupedExercises } = useExerciseDatabase();
    const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
    const exerciseProgressCardRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const defaultCardOrder = useMemo(() => ['stats', 'volume', 'muscle', 'progress', 'ai', 'records'], []);

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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setCardOrder((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                if (oldIndex === -1 || newIndex === -1) return items;
                const newOrder = arrayMove(items, oldIndex, newIndex);
                try {
                    localStorage.setItem('statsCardOrder', JSON.stringify(newOrder));
                } catch (error) {
                    console.error("Failed to save card order to localStorage", error);
                }
                return newOrder;
            });
        }
    };

    const filteredWorkouts = useMemo(() => {
        if (!workouts) return [];
        if (!dateRange?.from) return [];

        const fromDate = startOfDay(dateRange.from);
        const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        
        return workouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= fromDate && workoutDate <= toDate;
        });
    }, [workouts, dateRange]);

    const stats = useMemo(() => {
        if (!workouts) {
            return {
                totalWorkouts: 0,
                totalVolume: 0,
                totalSets: 0,
                chartData: [],
                personalRecords: {},
            };
        }

        const personalRecords: { [key: string]: PersonalRecord } = {};
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                exercise.sets.forEach(set => {
                    const weight = Number(set.weight) || 0;
                    const reps = Number(set.reps) || 0;
                    const currentPR = personalRecords[exercise.name] || { weight: 0, reps: 0 };
                    if (weight > currentPR.weight) {
                        personalRecords[exercise.name] = { weight, reps };
                    }
                });
            });
        });

        if (!filteredWorkouts || filteredWorkouts.length === 0) {
            return {
                totalWorkouts: 0,
                totalVolume: 0,
                totalSets: 0,
                chartData: [],
                personalRecords: personalRecords,
            };
        }

        let totalVolume = 0;
        let totalSets = 0;

        const chartData = filteredWorkouts
            .map(workout => {
                const workoutVolume = workout.exercises.reduce((acc, exercise) => {
                    return acc + exercise.sets.reduce((setAcc, set) => {
                        totalSets++;
                        const weight = Number(set.weight) || 0;
                        const reps = Number(set.reps) || 0;
                        return setAcc + reps * weight;
                    }, 0);
                }, 0);

                totalVolume += workoutVolume;

                return {
                    date: format(new Date(workout.date), 'd MMM', { locale: fr }),
                    volume: Math.round(workoutVolume),
                };
            })
            .reverse();

        return {
            totalWorkouts: filteredWorkouts.length,
            totalVolume: Math.round(totalVolume),
            totalSets,
            chartData,
            personalRecords,
        };
    }, [workouts, filteredWorkouts]);
    
    const exerciseToGroupMap = useMemo(() => {
        const map = new Map<string, string>();
        if (!allGroupedExercises) return map;
        allGroupedExercises.forEach(group => {
            group.exercises.forEach(ex => {
                map.set(ex.name, group.group);
            });
        });
        return map;
    }, [allGroupedExercises]);

    const muscleGroupStats = useMemo(() => {
        if (!filteredWorkouts || !exerciseToGroupMap.size) {
            return { chartData: [], maxSets: 0 };
        }

        const initialSetsByGroup = Object.fromEntries(
            Object.keys(EXERCISES_DATABASE).map(group => [group, 0])
        );

        const setsByGroup = filteredWorkouts.reduce((acc, workout) => {
            workout.exercises.forEach(exercise => {
                const group = exerciseToGroupMap.get(exercise.name);
                if (group && acc.hasOwnProperty(group)) {
                    acc[group] += exercise.sets.length;
                }
            });
            return acc;
        }, { ...initialSetsByGroup });

        const chartData = Object.entries(setsByGroup).map(([group, sets]) => ({
            subject: group,
            sets,
        }));
        
        const maxSets = Math.max(...chartData.map(d => d.sets));
        
        return { chartData, maxSets: Math.max(10, maxSets) };
    }, [filteredWorkouts, exerciseToGroupMap]);

    const uniqueExercises = useMemo(() => {
        if (!workouts) return [];
        const exercisesMap = new Map<string, { name: string }>();
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (!exercisesMap.has(exercise.name)) {
                    exercisesMap.set(exercise.name, { name: exercise.name });
                }
            });
        });
        return Array.from(exercisesMap.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [workouts]);

    const selectedExerciseData = useMemo(() => {
        if (!selectedExerciseName || !workouts) return null;

        const history = workouts
            .map(workout => {
                const exerciseLogs = workout.exercises.filter(ex => ex.name === selectedExerciseName);
                if (exerciseLogs.length === 0) return null;

                const volume = exerciseLogs.reduce((totalVol, log) => 
                    totalVol + log.sets.reduce((acc, set) => acc + (Number(set.reps) || 0) * (Number(set.weight) || 0), 0), 0);
                
                const maxWeight = Math.max(0, ...exerciseLogs.flatMap(log => log.sets.map(set => Number(set.weight) || 0)));

                return {
                    date: workout.date,
                    displayDate: format(new Date(workout.date), 'd MMM', { locale: fr }),
                    volume,
                    maxWeight,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return {
            name: selectedExerciseName,
            history: history,
        };
    }, [selectedExerciseName, workouts]);

    const handleViewProgression = (exerciseName: string) => {
        setSelectedExerciseName(exerciseName);
        exerciseProgressCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const cardComponents: Record<string, React.ReactNode> = useMemo(() => ({
        stats: (
            <StatCards
                totalWorkouts={stats.totalWorkouts}
                totalVolume={stats.totalVolume}
                totalSets={stats.totalSets}
            />
        ),
        volume: <VolumeChart chartData={stats.chartData} />,
        muscle: (
            <MuscleGroupRadarChart
                data={muscleGroupStats.chartData}
                maxSets={muscleGroupStats.maxSets}
            />
        ),
        progress: (
            <ExerciseProgress
                ref={exerciseProgressCardRef}
                uniqueExercises={uniqueExercises}
                selectedExerciseName={selectedExerciseName}
                onSelectedExerciseChange={setSelectedExerciseName}
                selectedExerciseData={selectedExerciseData}
            />
        ),
        ai: (
            <AiAnalysisCard
                title="Analyse et Conseils IA"
                type="general"
                data={{ ...stats, workouts: filteredWorkouts }}
            />
        ),
        records: (
            <PersonalRecords
                personalRecords={stats.personalRecords}
                onViewProgression={handleViewProgression}
            />
        ),
    }), [stats, muscleGroupStats, uniqueExercises, selectedExerciseName, selectedExerciseData, filteredWorkouts, handleViewProgression, allGroupedExercises]);

    if (isLoading) {
        return (
            <div className="p-4 space-y-6">
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
        <div className="p-4">
            <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-accent-purple" />
                <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
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
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
                        <div className="space-y-6">
                            {cardOrder.map((id) => (
                                <SortableCardItem key={id} id={id}>
                                    {cardComponents[id]}
                                </SortableCardItem>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
};

export default StatsPage;
