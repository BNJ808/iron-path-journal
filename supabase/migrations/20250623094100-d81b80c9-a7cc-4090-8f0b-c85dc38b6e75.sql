
-- Créer une table pour stocker les plans d'entraînement
CREATE TABLE public.workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table pour stocker la planification des entraînements
CREATE TABLE public.workout_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur les deux tables
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_schedule ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour workout_plans
CREATE POLICY "Users can view their own workout plans"
  ON public.workout_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout plans"
  ON public.workout_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout plans"
  ON public.workout_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout plans"
  ON public.workout_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Créer les politiques RLS pour workout_schedule
CREATE POLICY "Users can view their own workout schedule"
  ON public.workout_schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout schedule"
  ON public.workout_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout schedule"
  ON public.workout_schedule FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout schedule"
  ON public.workout_schedule FOR DELETE
  USING (auth.uid() = user_id);

-- Créer un index pour améliorer les performances
CREATE INDEX idx_workout_schedule_user_date ON public.workout_schedule(user_id, date);
CREATE INDEX idx_workout_schedule_plan_id ON public.workout_schedule(workout_plan_id);
