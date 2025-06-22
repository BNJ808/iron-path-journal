
import { useMemo } from 'react';
import type { Workout } from '@/types';
import { DateRange } from 'react-day-picker';
import { differenceInDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { calculateEstimated1RM } from '@/utils/calculations';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';

export const useAdvancedStats = (workouts: Workout[] | undefined, dateRange: DateRange | undefined) => {
    const { measurements } = useBodyMeasurements();

    // Timeline des records personnels
    const personalRecordsTimeline = useMemo(() => {
        if (!workouts) return [];

        const records = new Map<string, { weight: number; reps: number; date: string; workout_id: string }>();
        const timeline: Array<{
            date: string;
            displayDate: string;
            exercise: string;
            weight: number;
            reps: number;
            isNewRecord: boolean;
        }> = [];

        // Trier les entraînements par date
        const sortedWorkouts = [...workouts].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        sortedWorkouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                exercise.sets.forEach(set => {
                    if (!set.completed) return;
                    
                    const weight = Number(set.weight) || 0;
                    const reps = Number(set.reps) || 0;
                    const currentRecord = records.get(exercise.name);
                    
                    if (!currentRecord || weight > currentRecord.weight) {
                        records.set(exercise.name, { weight, reps, date: workout.date, workout_id: workout.id });
                        timeline.push({
                            date: workout.date,
                            displayDate: format(new Date(workout.date), 'd MMM yyyy', { locale: fr }),
                            exercise: exercise.name,
                            weight,
                            reps,
                            isNewRecord: true
                        });
                    }
                });
            });
        });

        return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [workouts]);

    // Prédictions de progression
    const progressionPredictions = useMemo(() => {
        if (!workouts || workouts.length < 3) return [];

        const exerciseData = new Map<string, Array<{ date: string; maxWeight: number }>>();

        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                const maxWeight = Math.max(0, ...exercise.sets
                    .filter(s => s.completed)
                    .map(set => Number(set.weight) || 0));
                
                if (maxWeight > 0) {
                    if (!exerciseData.has(exercise.name)) {
                        exerciseData.set(exercise.name, []);
                    }
                    exerciseData.get(exercise.name)?.push({
                        date: workout.date,
                        maxWeight
                    });
                }
            });
        });

        const predictions: Array<{
            exercise: string;
            currentMax: number;
            predicted1Month: number;
            predicted3Months: number;
            trend: 'ascending' | 'descending' | 'stable';
            confidence: number;
        }> = [];

        exerciseData.forEach((data, exercise) => {
            if (data.length < 3) return;

            // Trier par date
            const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const recent = sortedData.slice(-6); // 6 dernières sessions

            if (recent.length < 2) return;

            // Calcul de la tendance linéaire
            const n = recent.length;
            const sumX = recent.reduce((sum, _, i) => sum + i, 0);
            const sumY = recent.reduce((sum, point) => sum + point.maxWeight, 0);
            const sumXY = recent.reduce((sum, point, i) => sum + i * point.maxWeight, 0);
            const sumX2 = recent.reduce((sum, _, i) => sum + i * i, 0);

            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            const currentMax = recent[recent.length - 1].maxWeight;
            const predicted1Month = Math.max(currentMax, intercept + slope * (n + 4)); // +4 sessions en 1 mois
            const predicted3Months = Math.max(currentMax, intercept + slope * (n + 12)); // +12 sessions en 3 mois

            // Déterminer la tendance
            let trend: 'ascending' | 'descending' | 'stable' = 'stable';
            if (slope > 0.5) trend = 'ascending';
            else if (slope < -0.5) trend = 'descending';

            // Calcul de la confiance basée sur la variance
            const yMean = sumY / n;
            const variance = recent.reduce((sum, point, i) => {
                const predicted = intercept + slope * i;
                return sum + Math.pow(point.maxWeight - predicted, 2);
            }, 0) / n;
            const confidence = Math.max(0, Math.min(100, 100 - (variance / yMean) * 10));

            predictions.push({
                exercise,
                currentMax,
                predicted1Month,
                predicted3Months,
                trend,
                confidence: Math.round(confidence)
            });
        });

        return predictions.sort((a, b) => b.confidence - a.confidence);
    }, [workouts]);

    // Corrélation poids corporel vs performance
    const weightPerformanceCorrelation = useMemo(() => {
        if (!workouts || !measurements || measurements.length < 3) return null;

        const exerciseMaxWeights = new Map<string, Array<{ date: string; maxWeight: number }>>();
        
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                const maxWeight = Math.max(0, ...exercise.sets
                    .filter(s => s.completed)
                    .map(set => Number(set.weight) || 0));
                
                if (maxWeight > 0) {
                    if (!exerciseMaxWeights.has(exercise.name)) {
                        exerciseMaxWeights.set(exercise.name, []);
                    }
                    exerciseMaxWeights.get(exercise.name)?.push({
                        date: workout.date,
                        maxWeight
                    });
                }
            });
        });

        const correlations: Array<{
            exercise: string;
            correlation: number;
            significance: 'forte' | 'modérée' | 'faible';
            dataPoints: Array<{ bodyWeight: number; performance: number; date: string }>;
        }> = [];

        exerciseMaxWeights.forEach((performanceData, exercise) => {
            const correlationData: Array<{ bodyWeight: number; performance: number; date: string }> = [];

            performanceData.forEach(perf => {
                const closestWeightMeasurement = measurements.find(m => {
                    const perfDate = new Date(perf.date);
                    const measureDate = new Date(m.date);
                    return Math.abs(differenceInDays(perfDate, measureDate)) <= 7;
                });

                if (closestWeightMeasurement) {
                    correlationData.push({
                        bodyWeight: closestWeightMeasurement.weight,
                        performance: perf.maxWeight,
                        date: perf.date
                    });
                }
            });

            if (correlationData.length >= 3) {
                // Calcul du coefficient de corrélation de Pearson
                const n = correlationData.length;
                const sumX = correlationData.reduce((sum, d) => sum + d.bodyWeight, 0);
                const sumY = correlationData.reduce((sum, d) => sum + d.performance, 0);
                const sumXY = correlationData.reduce((sum, d) => sum + d.bodyWeight * d.performance, 0);
                const sumX2 = correlationData.reduce((sum, d) => sum + d.bodyWeight * d.bodyWeight, 0);
                const sumY2 = correlationData.reduce((sum, d) => sum + d.performance * d.performance, 0);

                const correlation = (n * sumXY - sumX * sumY) / 
                    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

                let significance: 'forte' | 'modérée' | 'faible' = 'faible';
                if (Math.abs(correlation) > 0.7) significance = 'forte';
                else if (Math.abs(correlation) > 0.4) significance = 'modérée';

                correlations.push({
                    exercise,
                    correlation: isNaN(correlation) ? 0 : correlation,
                    significance,
                    dataPoints: correlationData
                });
            }
        });

        return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    }, [workouts, measurements]);

    // Classement des exercices par progression
    const exerciseProgressionRanking = useMemo(() => {
        if (!workouts || workouts.length < 2) return [];

        const exerciseProgression = new Map<string, {
            firstMax: number;
            lastMax: number;
            progression: number;
            sessions: number;
            firstDate: string;
            lastDate: string;
        }>();

        const sortedWorkouts = [...workouts].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        sortedWorkouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                const maxWeight = Math.max(0, ...exercise.sets
                    .filter(s => s.completed)
                    .map(set => Number(set.weight) || 0));
                
                if (maxWeight > 0) {
                    const existing = exerciseProgression.get(exercise.name);
                    if (!existing) {
                        exerciseProgression.set(exercise.name, {
                            firstMax: maxWeight,
                            lastMax: maxWeight,
                            progression: 0,
                            sessions: 1,
                            firstDate: workout.date,
                            lastDate: workout.date
                        });
                    } else {
                        existing.lastMax = Math.max(existing.lastMax, maxWeight);
                        existing.sessions += 1;
                        existing.lastDate = workout.date;
                        existing.progression = ((existing.lastMax - existing.firstMax) / existing.firstMax) * 100;
                    }
                }
            });
        });

        return Array.from(exerciseProgression.entries())
            .map(([exercise, data]) => ({
                exercise,
                progressionPercent: Math.round(data.progression * 10) / 10,
                weightGain: data.lastMax - data.firstMax,
                sessions: data.sessions,
                firstMax: data.firstMax,
                lastMax: data.lastMax,
                timeSpan: differenceInDays(new Date(data.lastDate), new Date(data.firstDate))
            }))
            .filter(item => item.sessions >= 2)
            .sort((a, b) => b.progressionPercent - a.progressionPercent);
    }, [workouts]);

    // Ratios de force
    const strengthRatios = useMemo(() => {
        if (!workouts) return [];

        const exerciseMaxes = new Map<string, number>();
        
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                const maxWeight = Math.max(0, ...exercise.sets
                    .filter(s => s.completed)
                    .map(set => Number(set.weight) || 0));
                
                if (maxWeight > 0) {
                    const currentMax = exerciseMaxes.get(exercise.name) || 0;
                    exerciseMaxes.set(exercise.name, Math.max(currentMax, maxWeight));
                }
            });
        });

        const ratios: Array<{
            name: string;
            ratio: number;
            exercise1: string;
            exercise2: string;
            weight1: number;
            weight2: number;
            status: 'équilibré' | 'déséquilibré' | 'normal';
        }> = [];

        // Ratios classiques
        const benchPress = exerciseMaxes.get('Développé couché') || exerciseMaxes.get('Bench Press') || 0;
        const squat = exerciseMaxes.get('Squat') || exerciseMaxes.get('Back Squat') || 0;
        const deadlift = exerciseMaxes.get('Soulevé de terre') || exerciseMaxes.get('Deadlift') || 0;
        const overheadPress = exerciseMaxes.get('Développé militaire') || exerciseMaxes.get('Overhead Press') || 0;

        if (benchPress > 0 && squat > 0) {
            const ratio = squat / benchPress;
            ratios.push({
                name: 'Squat / Développé couché',
                ratio: Math.round(ratio * 100) / 100,
                exercise1: 'Squat',
                exercise2: 'Développé couché',
                weight1: squat,
                weight2: benchPress,
                status: ratio >= 1.2 && ratio <= 1.5 ? 'équilibré' : ratio < 1.2 ? 'déséquilibré' : 'normal'
            });
        }

        if (deadlift > 0 && benchPress > 0) {
            const ratio = deadlift / benchPress;
            ratios.push({
                name: 'Soulevé de terre / Développé couché',
                ratio: Math.round(ratio * 100) / 100,
                exercise1: 'Soulevé de terre',
                exercise2: 'Développé couché',
                weight1: deadlift,
                weight2: benchPress,
                status: ratio >= 1.3 && ratio <= 1.6 ? 'équilibré' : 'déséquilibré'
            });
        }

        if (benchPress > 0 && overheadPress > 0) {
            const ratio = benchPress / overheadPress;
            ratios.push({
                name: 'Développé couché / Développé militaire',
                ratio: Math.round(ratio * 100) / 100,
                exercise1: 'Développé couché',
                exercise2: 'Développé militaire',
                weight1: benchPress,
                weight2: overheadPress,
                status: ratio >= 1.4 && ratio <= 1.8 ? 'équilibré' : 'déséquilibré'
            });
        }

        return ratios;
    }, [workouts]);

    return {
        personalRecordsTimeline,
        progressionPredictions,
        weightPerformanceCorrelation,
        exerciseProgressionRanking,
        strengthRatios
    };
};
