
-- Ajoute une colonne `status` à la table des entraînements pour suivre leur état.
ALTER TABLE public.workouts ADD COLUMN status TEXT NOT NULL DEFAULT 'in-progress';
