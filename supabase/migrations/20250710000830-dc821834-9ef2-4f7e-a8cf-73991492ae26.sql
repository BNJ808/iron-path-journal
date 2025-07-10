
-- Add color column to workout_templates table
ALTER TABLE public.workout_templates 
ADD COLUMN color TEXT DEFAULT 'bg-blue-500';
