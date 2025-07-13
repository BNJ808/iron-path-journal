
import { useWorkouts, type ExerciseLog } from '@/hooks/useWorkouts';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { WorkoutInProgress } from '@/components/workout/WorkoutInProgress';
import { StartWorkout } from '@/components/workout/StartWorkout';
import { WorkoutLoadingSkeleton } from '@/components/workout/WorkoutLoadingSkeleton';
import { useWorkoutLifecycle } from '@/hooks/useWorkoutLifecycle';
import { useCurrentWorkoutActions } from '@/hooks/useCurrentWorkoutActions';
import { useWorkoutTemplateActions } from '@/hooks/useWorkoutTemplateActions';
import { Dumbbell } from 'lucide-react';
import { useOfflineWorkouts } from '@/hooks/useOfflineWorkouts';

const WorkoutPage = () => {
  const { todayWorkout, isLoadingWorkout } = useOfflineWorkouts();
  const { templates, isLoadingTemplates, updateTemplate, deleteTemplate, createTemplate } = useWorkoutTemplates();
  const { handleStartWorkout, handleFinishWorkout, handleCancelWorkout, handleValidateRunning } = useWorkoutLifecycle();
  const {
    handleAddExercise,
    handleUpdateExercise,
    handleRemoveExercise,
    handleUpdateWorkoutNotes,
  } = useCurrentWorkoutActions();
  const { handleSaveAsTemplate, handleStartFromTemplate } = useWorkoutTemplateActions();

  const handleUpdateTemplate = async (id: string, name: string, exercises: ExerciseLog[], color?: string) => {
    await updateTemplate({ id, name, exercises, color });
  };

  if (isLoadingWorkout) {
    return <WorkoutLoadingSkeleton />;
  }
  
  return (
    <div className="p-2 sm:p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-6 w-6 text-accent-blue" />
        <h1 className="text-2xl font-bold text-foreground">Entraînement du jour</h1>
      </div>
      
      {todayWorkout ? (
        <WorkoutInProgress
          workout={todayWorkout}
          onAddExercise={handleAddExercise}
          onUpdateExercise={handleUpdateExercise}
          onRemoveExercise={handleRemoveExercise}
          onUpdateWorkoutNotes={handleUpdateWorkoutNotes}
          onSaveAsTemplate={handleSaveAsTemplate}
          onFinishWorkout={handleFinishWorkout}
          onCancelWorkout={handleCancelWorkout}
        />
      ) : (
        <StartWorkout
          onStartWorkout={handleStartWorkout}
          onStartFromTemplate={handleStartFromTemplate}
          onValidateRunning={handleValidateRunning}
          templates={templates}
          isLoadingTemplates={isLoadingTemplates}
          onUpdateTemplate={handleUpdateTemplate}
          onDeleteTemplate={deleteTemplate}
          onCreateTemplate={createTemplate}
        />
      )}
    </div>
  );
};

export default WorkoutPage;
