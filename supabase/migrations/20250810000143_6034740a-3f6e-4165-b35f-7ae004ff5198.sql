-- Create a table for per-user exercise overrides (rename/hide built-ins)
-- and timestamps management

-- Helper function to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the exercise_overrides table
CREATE TABLE IF NOT EXISTS public.exercise_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exercise_id TEXT NOT NULL,
  override_name TEXT,
  hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT exercise_overrides_user_exercise_unique UNIQUE (user_id, exercise_id)
);

-- Enable RLS
ALTER TABLE public.exercise_overrides ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY IF NOT EXISTS "Users can view their own exercise overrides"
ON public.exercise_overrides
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own exercise overrides"
ON public.exercise_overrides
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own exercise overrides"
ON public.exercise_overrides
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own exercise overrides"
ON public.exercise_overrides
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_exercise_overrides_updated_at'
  ) THEN
    CREATE TRIGGER trigger_update_exercise_overrides_updated_at
    BEFORE UPDATE ON public.exercise_overrides
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_exercise_overrides_user_id ON public.exercise_overrides(user_id);
