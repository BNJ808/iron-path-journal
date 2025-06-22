
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

export const DraggableStatsCards: React.FC<DraggableStatsCardsProps> = ({
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
    strengthRatios,
}) => {
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
            onCardOrderChange(newOrder);
        }
    };

    const cardComponents: Record<string, React.ReactNode> = useMemo(() => ({
        overview: (
            <StatCards
                totalWorkouts={stats.totalWorkouts}
                totalVolume={stats.totalVolume}
                totalSets={stats.totalSets}
                averageDuration={stats.averageDuration}
            />
        ),
        volume: <VolumeChart chartData={volumeByMuscleGroup} />,
        personalRecords: (
            <InteractivePersonalRecords
                personalRecords={stats.personalRecords}
                timeline={personalRecordsTimeline}
                onViewProgression={onViewProgression}
            />
        ),
        'muscle-groups': (
            <MuscleGroupRadarChart
                data={muscleGroupStats.chartData}
                maxSets={muscleGroupStats.maxSets}
            />
        ),
        'exercise-progress': (
            <ExerciseProgress
                ref={exerciseProgressCardRef}
                uniqueExercises={uniqueExercises}
                selectedExerciseName={selectedExerciseName}
                onSelectedExerciseChange={onSelectedExerciseChange}
                selectedExerciseData={selectedExerciseData}
            />
        ),
        'interactive-personal-records': (
            <EstimatedOneRepMax
                records={Object.entries(estimated1RMs).map(([exerciseName, estimated1RM]) => ({
                    exerciseName,
                    estimated1RM
                }))}
                onViewProgression={onViewProgression}
            />
        ),
        'progression-predictions': (
            <ProgressionPredictions predictions={progressionPredictions} />
        ),
        'exercise-progression-ranking': (
            <ExerciseProgressionRanking progressions={exerciseProgressionRanking} />
        ),
        'strength-ratios': <StrengthRatios ratios={strengthRatios} />,
        'ai-analysis': (
            <AiAnalysisCard
                title="Analyse IA"
                type="general"
                workouts={workouts || []}
                currentDateRange={dateRange}
            />
        ),
    }), [
        stats,
        volumeByMuscleGroup,
        muscleGroupStats,
        uniqueExercises,
        selectedExerciseName,
        onSelectedExerciseChange,
        selectedExerciseData,
        estimated1RMs,
        onViewProgression,
        personalRecordsTimeline,
        progressionPredictions,
        exerciseProgressionRanking,
        strengthRatios,
        workouts,
        dateRange,
    ]);

    const cards = cardOrder.map((cardId) => ({
        id: cardId,
        component: cardComponents[cardId],
    })).filter(card => card.component); // Filtrer les cartes non définies

    if (!isDndEnabled) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                    <div key={card.id}>
                        {card.component}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cards.map((card) => (
                        <SortableCardItem key={card.id} id={card.id}>
                            {card.component}
                        </SortableCardItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};
