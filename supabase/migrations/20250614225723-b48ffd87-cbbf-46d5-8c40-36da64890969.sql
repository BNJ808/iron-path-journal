
-- Create a table to store the last performance for each exercise for each user
CREATE TABLE public.exercise_last_performance (
  user_id UUID NOT NULL,
  exercise_id TEXT NOT NULL,
  sets JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, exercise_id)
);

-- Add Row Level Security (RLS) to ensure users can only see and manage their own data
ALTER TABLE public.exercise_last_performance ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to perform all actions on their own exercise performance history
CREATE POLICY "Users can manage their own exercise performance history"
ON public.exercise_last_performance
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
