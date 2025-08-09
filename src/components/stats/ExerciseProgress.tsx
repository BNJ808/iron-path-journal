
    import * as React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
    import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
    import { LineChart as LineChartIcon } from 'lucide-react';

    const exerciseChartConfig = {
      reps: {
        label: "Répétitions",
        color: "hsl(var(--accent-purple))",
      },
      maxWeight: {
        label: "Poids Max (kg)",
        color: "hsl(var(--accent-blue))",
      },
    } satisfies ChartConfig;

    interface HistoryItem {
        date: string;
        displayDate: string;
        reps?: number;
        sets?: number;
        volume: number;
        maxWeight: number;
    }

    interface ExerciseData {
        name: string;
        history: HistoryItem[];
    }

    interface ExerciseProgressProps {
        uniqueExercises: { name: string }[];
        selectedExerciseName: string | null;
        onSelectedExerciseChange: (value: string) => void;
        selectedExerciseData: ExerciseData | null;
    }

    export const ExerciseProgress = React.forwardRef<HTMLDivElement, ExerciseProgressProps>(
        ({ uniqueExercises, selectedExerciseName, onSelectedExerciseChange, selectedExerciseData }, ref) => {
            return (
                <Card ref={ref}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <LineChartIcon className="h-5 w-5 text-indigo-500" />
                            Progression par Exercice
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select onValueChange={onSelectedExerciseChange} value={selectedExerciseName ?? undefined}>
                            <SelectTrigger className="w-full sm:w-[280px]">
                                <SelectValue placeholder="Sélectionnez un exercice" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueExercises.map(ex => (
                                    <SelectItem key={ex.name} value={ex.name}>{ex.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedExerciseData && selectedExerciseData.history.length > 0 ? (
                            <ChartContainer config={exerciseChartConfig} className="h-[300px] w-full">
                                <LineChart data={selectedExerciseData.history} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid vertical={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
                                    <XAxis dataKey="displayDate" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
                                    <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
                                    <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="reps" stroke={exerciseChartConfig.reps.color} name="Répétitions" dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="maxWeight" stroke={exerciseChartConfig.maxWeight.color} name="Poids Max (kg)" dot={false} />
                                </LineChart>
                            </ChartContainer>
                        ) : selectedExerciseName ? (
                            <div className="text-center text-muted-foreground pt-8">
                                <p>Pas de données pour cet exercice.</p>
                            </div>
                        ) : null }
                    </CardContent>
                </Card>
            );
        }
    );
    ExerciseProgress.displayName = "ExerciseProgress";
    
