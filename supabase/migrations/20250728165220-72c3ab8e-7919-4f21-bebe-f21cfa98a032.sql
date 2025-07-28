-- Add notes column to exercise_last_performance table to store the last notes for each exercise
ALTER TABLE public.exercise_last_performance 
ADD COLUMN notes TEXT;