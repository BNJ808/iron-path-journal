
import React from 'react';
import { StatCards } from '@/components/stats/StatCards';
import { VolumeChart } from '@/components/stats/VolumeChart';
import { ExerciseProgress } from '@/components/stats/ExerciseProgress';
import { InteractivePersonalRecords } from '@/components/stats/InteractivePersonalRecords';
import { MuscleGroupRadarChart } from '@/components/stats/MuscleGroupRadarChart';
import { OneRMCalculator } from '@/components/stats/OneRMCalculator';
import { ProgressionPredictions } from '@/components/stats/ProgressionPredictions';
import { ExerciseProgressionRanking } from '@/components/stats/ExerciseProgressionRanking';  
import { AiAnalysisCard } from '@/components/AiAnalysisCard';
import type { Workout } from '@/types';
import { DateRange } from 'react-day-picker';

interface CardComponentsProps {
    stats: {
        totalWorkouts: number;
        totalVolume: number;
        totalSets: number;
        averageDuration: number;
        personalRecords: { [key: string]: { weight: number; reps: number } };
    };
    volumeByMuscleGroup: { group: string; volume: number }[];
    muscleGroupStats: { chartData: { subject: string; sets: number }[]; maxSets: number };
    uniqueExercises: { name: string }[];
    selectedExerciseName: string | null;
    onSelectedExerciseChange: (value: string) => void;
    selectedExerciseData: { name: string; history: { date: string; displayDate: string; volume: number; maxWeight: number }[] } | null;
    workouts: Workout[] | undefined;
    dateRange: DateRange | undefined;
    onViewProgression: (exerciseName: string) => void;
    exerciseProgressCardRef: React.RefObject<HTMLDivElement>;
    personalRecordsTimeline: Array<{
        date: string;
        displayDate: string;
        exercise: string;
        weight: number;
        reps: number;
        isNewRecord: boolean;
    }>;
    progressionPredictions: Array<{
        exercise: string;
        currentMax: number;
        predicted1Month: number;
        predicted3Months: number;
        trend: 'ascending' | 'descending' | 'stable';
        confidence: number;
    }>;
    exerciseProgressionRanking: Array<{
        exercise: string;
        progressionPercent: number;
        weightGain: number;
        sessions: number;
        firstMax: number;
        lastMax: number;
        timeSpan: number;
    }>;
}

export const createCardComponents = (props: CardComponentsProps): Record<string, React.ReactNode> => {
    return {
        overview: (
            <StatCards
                totalWorkouts={props.stats.totalWorkouts}
                totalVolume={props.stats.totalVolume}
                totalSets={props.stats.totalSets}
                averageDuration={props.stats.averageDuration}
            />
        ),
        'one-rm-calculator': <OneRMCalculator />,
        volume: <VolumeChart allWorkouts={props.workouts} />,
        personalRecords: (
            <InteractivePersonalRecords
                personalRecords={props.stats.personalRecords}
                timeline={props.personalRecordsTimeline}
                onViewProgression={props.onViewProgression}
            />
        ),
        'muscle-groups': (
            <MuscleGroupRadarChart
                data={props.muscleGroupStats.chartData}
                maxSets={props.muscleGroupStats.maxSets}
            />
        ),
        'exercise-progress': (
            <ExerciseProgress
                ref={props.exerciseProgressCardRef}
                uniqueExercises={props.uniqueExercises}
                selectedExerciseName={props.selectedExerciseName}
                onSelectedExerciseChange={props.onSelectedExerciseChange}
                selectedExerciseData={props.selectedExerciseData}
            />
        ),
        'progression-predictions': (
            <ProgressionPredictions predictions={props.progressionPredictions || []} />
        ),
        'exercise-progression-ranking': (
            <ExerciseProgressionRanking progressions={props.exerciseProgressionRanking || []} />
        ),
        'ai-analysis': (
            <AiAnalysisCard
                title="Analyse IA"
                type="general"
                workouts={props.workouts || []}
                currentDateRange={props.dateRange}
            />
        ),
    };
};
