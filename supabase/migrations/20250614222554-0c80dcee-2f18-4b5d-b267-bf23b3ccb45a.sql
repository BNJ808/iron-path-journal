
-- Create a table for workout templates
CREATE TABLE public.workout_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  exercises JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comments for clarity
COMMENT ON TABLE public.workout_templates IS 'Stores user-created workout templates.';
COMMENT ON COLUMN public.workout_templates.name IS 'Name of the workout template, e.g., "Push Day".';
COMMENT ON COLUMN public.workout_templates.exercises IS 'A JSON array of exercises included in the template.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_templates table
CREATE POLICY "Users can view their own workout templates"
  ON public.workout_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout templates"
  ON public.workout_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout templates"
  ON public.workout_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout templates"
  ON public.workout_templates FOR DELETE
  USING (auth.uid() = user_id);
