
-- Ajouter une colonne settings à la table profiles pour stocker les paramètres utilisateur
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Créer un index pour optimiser les requêtes sur les paramètres
CREATE INDEX IF NOT EXISTS profiles_settings_idx ON public.profiles USING GIN (settings);

-- Ajouter les politiques RLS pour les paramètres (si elles n'existent pas déjà)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Activer RLS sur la table profiles si ce n'est pas déjà fait
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
