
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { WorkoutPlan } from './WorkoutCalendar';

const PLAN_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
];

interface EditWorkoutPlanDialogProps {
  children: React.ReactNode;
  plan: WorkoutPlan;
  onUpdate: (updates: Partial<WorkoutPlan>) => void;
}

export const EditWorkoutPlanDialog = ({ children, plan, onUpdate }: EditWorkoutPlanDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(plan.name);
  const [exercises, setExercises] = useState(plan.exercises.join('\n'));
  const [selectedColor, setSelectedColor] = useState(plan.color);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const exerciseList = exercises
      .split('\n')
      .map(ex => ex.trim())
      .filter(ex => ex.length > 0);

    onUpdate({
      name: name.trim(),
      color: selectedColor,
      exercises: exerciseList,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du plan</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Push, Pull, Legs..."
              required
            />
          </div>

          <div>
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {PLAN_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full ${color} border-2 ${
                    selectedColor === color ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="exercises">Exercices (un par ligne)</Label>
            <Textarea
              id="exercises"
              value={exercises}
              onChange={(e) => setExercises(e.target.value)}
              placeholder="Développé couché&#10;Développé incliné&#10;Dips"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Sauvegarder</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
