
-- Créer une table pour les exercices personnalisés
CREATE TABLE public.custom_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer Row Level Security (RLS)
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour que les utilisateurs ne voient que leurs propres exercices
CREATE POLICY "Users can view their own custom exercises" 
  ON public.custom_exercises 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom exercises" 
  ON public.custom_exercises 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom exercises" 
  ON public.custom_exercises 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom exercises" 
  ON public.custom_exercises 
  FOR DELETE 
  USING (auth.uid() = user_id);
