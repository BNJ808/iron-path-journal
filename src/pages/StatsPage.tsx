
    import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
    import { Skeleton } from '@/components/ui/skeleton';
    import { AiAnalysisCard } from '@/components/AiAnalysisCard';
    import { BarChart3 } from 'lucide-react';
    import { useMemo, useState, useRef } from 'react';
    import { format } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import { StatCards } from '@/components/stats/StatCards';
    import { VolumeChart } from '@/components/stats/VolumeChart';
    import { ExerciseProgress } from '@/components/stats/ExerciseProgress';
    import { PersonalRecords } from '@/components/stats/PersonalRecords';
    
    const StatsPage = () => {
        const { workouts, isLoading } = useWorkoutHistory();
        const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
        const exerciseProgressCardRef = useRef<HTMLDivElement>(null);
    
        const stats = useMemo(() => {
            if (!workouts || workouts.length === 0) {
                return {
                    totalWorkouts: 0,
                    totalVolume: 0,
                    totalSets: 0,
                    chartData: [],
                    personalRecords: {},
                };
            }
    
            let totalVolume = 0;
            let totalSets = 0;
            const personalRecords: { [key: string]: number } = {};
    
            const chartData = workouts
                .map(workout => {
                    const workoutVolume = workout.exercises.reduce((acc, exercise) => {
                        return acc + exercise.sets.reduce((setAcc, set) => {
                            totalSets++;
                            
                            const weight = Number(set.weight) || 0;
                            const reps = Number(set.reps) || 0;
    
                            const currentPR = personalRecords[exercise.name] || 0;
                            if (weight > currentPR) {
                                personalRecords[exercise.name] = weight;
                            }
    
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
                totalWorkouts: workouts.length,
                totalVolume: Math.round(totalVolume),
                totalSets,
                chartData,
                personalRecords,
            };
        }, [workouts]);
        
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
    
                {workouts.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500">Aucune statistique disponible pour le moment.</p>
                        <p className="text-sm text-gray-600 mt-2">Terminez une séance pour voir vos statistiques ici.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <StatCards 
                            totalWorkouts={stats.totalWorkouts} 
                            totalVolume={stats.totalVolume} 
                            totalSets={stats.totalSets} 
                        />
    
                        <VolumeChart chartData={stats.chartData} />
    
                        <ExerciseProgress
                            ref={exerciseProgressCardRef}
                            uniqueExercises={uniqueExercises}
                            selectedExerciseName={selectedExerciseName}
                            onSelectedExerciseChange={setSelectedExerciseName}
                            selectedExerciseData={selectedExerciseData}
                        />
    
                        <AiAnalysisCard 
                            title="Analyse et Conseils IA"
                            type="general"
                            data={stats}
                        />
    
                        <PersonalRecords
                            personalRecords={stats.personalRecords}
                            onViewProgression={handleViewProgression}
                        />
                    </div>
                )}
            </div>
        );
    };
    
    export default StatsPage;
    