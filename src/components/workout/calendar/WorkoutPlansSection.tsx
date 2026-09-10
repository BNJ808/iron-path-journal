
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { WorkoutPlanCard } from '../WorkoutPlanCard';
import { WorkoutPlan } from '@/types/workout-calendar';

interface WorkoutPlansSectionProps {
  plans: WorkoutPlan[];
  onUpdate: (planId: string, updates: Partial<WorkoutPlan>) => void;
  onDelete: (planId: string) => void;
}

export const WorkoutPlansSection = ({ plans, onAdd, onUpdate, onDelete }: WorkoutPlansSectionProps) => {
  return (
    <div className="space-y-4">
      
      <SortableContext items={plans.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
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
