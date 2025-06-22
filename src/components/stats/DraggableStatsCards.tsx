
import React, { useState, useRef } from 'react';
import { Draggable, DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Card } from "@/components/ui/card";
import { PersonalRecords } from './PersonalRecords';
import { MuscleGroupStats } from './MuscleGroupStats';
import { ExerciseProgress } from './ExerciseProgress';
import { InteractivePersonalRecords } from './InteractivePersonalRecords';
import { ProgressionPredictions } from './ProgressionPredictions';
import { ExerciseProgressionRanking } from './ExerciseProgressionRanking';
import { AiAnalysis } from './AiAnalysis';
import { OneRepMaxCalculator } from './OneRepMaxCalculator';
import { StatCards } from './StatCards';

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
  onSelectedExerciseChange: (exerciseName: string | null) => void;
  selectedExerciseData: any;
  workouts: any;
  dateRange: any;
  estimated1RMs: { [exerciseName: string]: number };
  onViewProgression: (exerciseName: string) => void;
  exerciseProgressCardRef: React.RefObject<HTMLDivElement>;
  personalRecordsTimeline: any;
  progressionPredictions: any;
  exerciseProgressionRanking: any;
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
  exerciseProgressionRanking
}: DraggableStatsCardsProps) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const newOrder = Array.from(cardOrder);
    const [movedCard] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, movedCard);

    onCardOrderChange(newOrder);
  };

  const renderCard = (cardId: string) => {
    switch (cardId) {
      case 'general-stats':
        return (
          <StatCards
            totalWorkouts={stats?.totalWorkouts || 0}
            totalVolume={stats?.totalVolume || 0}
            totalSets={stats?.totalSets || 0}
            averageDuration={stats?.averageDuration || 0}
          />
        );
      case 'personalRecords':
        return (
          <PersonalRecords
            personalRecords={stats?.personalRecords || {}}
            onViewProgression={onViewProgression}
          />
        );
      case 'estimated-1rm':
        return <OneRepMaxCalculator />;
      case 'muscle-groups':
        return (
          <MuscleGroupStats
            volumeByMuscleGroup={volumeByMuscleGroup || []}
            muscleGroupStats={muscleGroupStats || { chartData: [], maxSets: 0 }}
          />
        );
      case 'exercise-progress':
        return (
          <ExerciseProgress
            uniqueExercises={uniqueExercises || []}
            selectedExerciseName={selectedExerciseName}
            onSelectedExerciseChange={onSelectedExerciseChange}
            selectedExerciseData={selectedExerciseData}
            ref={exerciseProgressCardRef}
          />
        );
      case 'interactive-personal-records':
        return (
          <InteractivePersonalRecords
            uniqueExercises={uniqueExercises || []}
            workouts={workouts || []}
            dateRange={dateRange}
          />
        );
      case 'progression-predictions':
        return (
          <ProgressionPredictions
            predictions={progressionPredictions || []}
          />
        );
      case 'exercise-progression-ranking':
        return (
          <ExerciseProgressionRanking
            exerciseProgressionRanking={exerciseProgressionRanking || []}
          />
        );
      case 'ai-analysis':
        return (
          <AiAnalysis
            personalRecordsTimeline={personalRecordsTimeline}
          />
        );
      default:
        return null; // Ne plus afficher "Unknown card"
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        droppableId="stats-cards-droppable"
        direction="horizontal"
        isDropDisabled={!isDndEnabled}
      >
        {(provided) => (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {cardOrder.map((cardId, index) => {
              const cardContent = renderCard(cardId);
              if (!cardContent) return null; // Ne pas rendre les cartes nulles
              
              return (
                <Draggable key={cardId} draggableId={cardId} index={index} isDragDisabled={!isDndEnabled}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={provided.draggableProps.style}
                    >
                      {cardContent}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
