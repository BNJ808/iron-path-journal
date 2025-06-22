
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { WorkoutPlanCard } from '../WorkoutPlanCard';
import { CreateWorkoutPlanDialog } from '../CreateWorkoutPlanDialog';
import { WorkoutPlan } from '@/types/workout-calendar';

interface WorkoutPlansSectionProps {
  plans: WorkoutPlan[];
  onAdd: (plan: Omit<WorkoutPlan, 'id'>) => void;
  onUpdate: (planId: string, updates: Partial<WorkoutPlan>) => void;
  onDelete: (planId: string) => void;
}

export const WorkoutPlansSection = ({ plans, onAdd, onUpdate, onDelete }: WorkoutPlansSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Plans d'entraînement</h4>
        <CreateWorkoutPlanDialog onAdd={onAdd}>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nouveau plan
          </Button>
        </CreateWorkoutPlanDialog>
      </div>
      
      <SortableContext items={plans.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map(plan => (
            <WorkoutPlanCard
              key={plan.id}
              plan={plan}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
