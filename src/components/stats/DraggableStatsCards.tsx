
import React from 'react';
import { createCardComponents } from '@/components/stats/CardComponents';
import { StatsCardRenderer } from '@/components/stats/StatsCardRenderer';
import type { Workout } from '@/types';
import { DateRange } from 'react-day-picker';

interface DraggableStatsCardsProps {
    cardOrder: string[];
    onCardOrderChange: (newOrder: string[]) => void;
    isDndEnabled: boolean;
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
    estimated1RMs: { [key: string]: number };
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

export const DraggableStatsCards: React.FC<DraggableStatsCardsProps> = (props) => {
    const cardComponents = createCardComponents(props);

    return (
        <StatsCardRenderer
            cardOrder={props.cardOrder}
            onCardOrderChange={props.onCardOrderChange}
            isDndEnabled={props.isDndEnabled}
            cardComponents={cardComponents}
        />
    );
};
