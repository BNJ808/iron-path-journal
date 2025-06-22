
import React, { useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCardItem } from '@/components/stats/SortableCardItem';
import { StatCards } from '@/components/stats/StatCards';
import { VolumeChart } from '@/components/stats/VolumeChart';
import { ExerciseProgress } from '@/components/stats/ExerciseProgress';
import { InteractivePersonalRecords } from '@/components/stats/InteractivePersonalRecords';
import { MuscleGroupRadarChart } from '@/components/stats/MuscleGroupRadarChart';
import { EstimatedOneRepMax } from '@/components/stats/EstimatedOneRepMax';
import { ProgressionPredictions } from '@/components/stats/ProgressionPredictions';
import { ExerciseProgressionRanking } from '@/components/stats/ExerciseProgressionRanking';
import { StrengthRatios } from '@/components/stats/StrengthRatios';
import { AiAnalysisCard } from '@/components/AiAnalysisCard';
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
    selectedExerciseData: { name: string; history: any[] } | null;
    workouts: Workout[] | undefined;
    dateRange: DateRange | undefined;
    estimated1RMs: { exerciseName: string; estimated1RM: number }[];
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
    strengthRatios: Array<{
        name: string;
        ratio: number;
        exercise1: string;
        exercise2: string;
        weight1: number;
        weight2: number;
        status: 'équilibré' | 'déséquilibré' | 'normal';
    }>;
}

export const DraggableStatsCards = ({
    cardOrder,
    onCardOrderChange,
    isDndEnabled,
    stats,
    volumeByMuscleGroup,
    muscleGroupStats,
    uniqueExercises,
    selectedExerciseName,
    onSelectedExerciseChange,
    selectedExerciseData,
    workouts,
    dateRange,
    estimated1RMs,
    onViewProgression,
    exerciseProgressCardRef,
    personalRecordsTimeline,
    progressionPredictions,
    exerciseProgressionRanking,
    strengthRatios
}: DraggableStatsCardsProps) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = cardOrder.indexOf(active.id as string);
            const newIndex = cardOrder.indexOf(over.id as string);
            if (oldIndex === -1 || newIndex === -1) return;
            const newOrder = arrayMove(cardOrder, oldIndex, newIndex);
            try {
                localStorage.setItem('statsCardOrder', JSON.stringify(newOrder));
            } catch (error) {
                console.error("Failed to save card order to localStorage", error);
            }
            onCardOrderChange(newOrder);
        }
    };

    const cardComponents: Record<string, React.ReactNode> = useMemo(() => ({
        stats: (
            <StatCards
                totalWorkouts={stats.totalWorkouts}
                totalVolume={stats.totalVolume}
                totalSets={stats.totalSets}
                averageDuration={stats.averageDuration}
            />
        ),
        volume: <VolumeChart chartData={volumeByMuscleGroup} />,
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
                onSelectedExerciseChange={onSelectedExerciseChange}
                selectedExerciseData={selectedExerciseData}
            />
        ),
        ai: (
            <AiAnalysisCard
                title="Analyse et Conseils IA"
                type="general"
                workouts={workouts}
                currentDateRange={dateRange}
            />
        ),
        records: (
            <InteractivePersonalRecords
                personalRecords={stats.personalRecords}
                timeline={personalRecordsTimeline}
                onViewProgression={onViewProgression}
            />
        ),
        oneRepMax: (
            <EstimatedOneRepMax
                records={estimated1RMs}
                onViewProgression={onViewProgression}
            />
        ),
        predictions: (
            <ProgressionPredictions
                predictions={progressionPredictions}
            />
        ),
        ranking: (
            <ExerciseProgressionRanking
                progressions={exerciseProgressionRanking}
            />
        ),
        ratios: (
            <StrengthRatios
                ratios={strengthRatios}
            />
        )
    }), [
        stats, 
        volumeByMuscleGroup, 
        muscleGroupStats, 
        uniqueExercises, 
        selectedExerciseName, 
        selectedExerciseData, 
        workouts, 
        dateRange, 
        estimated1RMs, 
        onViewProgression, 
        exerciseProgressCardRef, 
        onSelectedExerciseChange,
        personalRecordsTimeline,
        progressionPredictions,
        exerciseProgressionRanking,
        strengthRatios
    ]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
                <div className="space-y-6">
                    {cardOrder.map((id) => (
                        <SortableCardItem key={id} id={id} isDndEnabled={isDndEnabled}>
                            {cardComponents[id]}
                        </SortableCardItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};
