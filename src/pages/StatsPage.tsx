
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import StatCard from '@/components/StatCard';
import { Dumbbell, Repeat, TrendingUp, BarChart as BarChartIcon, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const chartConfig = {
  volume: {
    label: "Volume",
  },
} satisfies ChartConfig;

const barColors = ["hsl(var(--accent-purple))", "hsl(var(--accent-blue))", "hsl(var(--accent-yellow))"];

const StatsPage = () => {
    const { workouts, isLoading } = useWorkoutHistory();

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
            <h1 className="text-2xl font-bold text-accent-purple">Statistiques</h1>
            <p className="text-gray-400 mt-2 mb-6">Visualisez vos progrès et vos performances.</p>

            {workouts.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-500">Aucune statistique disponible pour le moment.</p>
                    <p className="text-sm text-gray-600 mt-2">Terminez une séance pour voir vos statistiques ici.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <StatCard title="Séances totales" value={stats.totalWorkouts} icon={Dumbbell} />
                        <StatCard title="Volume total" value={`${stats.totalVolume.toLocaleString('fr-FR')} kg`} icon={TrendingUp} />
                        <StatCard title="Séries totales" value={stats.totalSets} icon={Repeat} />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChartIcon className="h-5 w-5 text-accent-purple" />
                                Volume par séance (kg)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <BarChart accessibilityLayer data={stats.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid vertical={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} minTickGap={10} fontSize={12} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={10} width={80} fontSize={12} />
                                    <Tooltip
                                        cursor={false}
                                        content={<ChartTooltipContent 
                                            indicator="dot"
                                            hideLabel
                                        />} 
                                    />
                                    <Bar dataKey="volume" radius={4}>
                                        {stats.chartData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {Object.keys(stats.personalRecords).length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Trophy className="h-5 w-5 text-accent-yellow" />
                                    Records Personnels (Poids max)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {Object.entries(stats.personalRecords)
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([exercise, pr]) => (
                                            <li key={exercise} className="flex justify-between items-center text-sm">
                                                <span>{exercise}</span>
                                                <span className="font-bold">{pr} kg</span>
                                            </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default StatsPage;
