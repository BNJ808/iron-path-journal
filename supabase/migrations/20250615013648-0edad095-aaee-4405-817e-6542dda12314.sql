
CREATE TABLE public.favorite_exercises (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, exercise_id)
);

COMMENT ON TABLE public.favorite_exercises IS 'Stores the favorite exercises for each user.';

-- Enable Row Level Security
ALTER TABLE public.favorite_exercises ENABLE ROW LEVEL SECURITY;

-- Policies for favorite_exercises
CREATE POLICY "Users can view their own favorite exercises"
  ON public.favorite_exercises
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite exercises"
  ON public.favorite_exercises
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite exercises"
  ON public.favorite_exercises
  FOR DELETE
  USING (auth.uid() = user_id);
