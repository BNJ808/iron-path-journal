
-- Créer la table pour stocker les séances d'entraînement
CREATE TABLE public.workouts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date timestamp with time zone NOT NULL,
    notes text,
    exercises jsonb NOT NULL
);

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres séances
CREATE POLICY "Users can view their own workouts"
    ON public.workouts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent créer leurs propres séances
CREATE POLICY "Users can create their own workouts"
    ON public.workouts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent mettre à jour leurs propres séances
CREATE POLICY "Users can update their own workouts"
    ON public.workouts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres séances
CREATE POLICY "Users can delete their own workouts"
    ON public.workouts
    FOR DELETE
    USING (auth.uid() = user_id);
