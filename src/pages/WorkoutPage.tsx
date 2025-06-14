
import { useWorkouts } from '@/hooks/useWorkouts';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { WorkoutInProgress } from '@/components/workout/WorkoutInProgress';
import { StartWorkout } from '@/components/workout/StartWorkout';
import { WorkoutLoadingSkeleton } from '@/components/workout/WorkoutLoadingSkeleton';
import { useWorkoutActions } from '@/hooks/useWorkoutActions';

const WorkoutPage = () => {
  const { todayWorkout, isLoadingWorkout } = useWorkouts();
  const { templates, isLoadingTemplates } = useWorkoutTemplates();
  const {
    handleStartWorkout,
    handleAddExercise,
    handleUpdateExercise,
    handleRemoveExercise,
    handleUpdateWorkoutNotes,
    handleSaveAsTemplate,
    handleFinishWorkout,
    handleCancelWorkout,
    handleStartFromTemplate,
  } = useWorkoutActions();


  if (isLoadingWorkout) {
    return <WorkoutLoadingSkeleton />;
  }
  
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100">Entraînement du jour</h1>
      
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
          templates={templates}
          isLoadingTemplates={isLoadingTemplates}
        />
      )}
    </div>
  );
};

export default WorkoutPage;
