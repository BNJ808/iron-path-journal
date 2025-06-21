
-- Vérifier les politiques existantes et créer uniquement celles qui manquent

-- Créer les politiques manquantes avec IF NOT EXISTS (PostgreSQL 9.5+)
-- Si cette syntaxe n'est pas supportée, nous devrons créer les politiques une par une

-- Politique SELECT manquante critique pour la table profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile"
          ON public.profiles
          FOR SELECT
          USING (auth.uid() = id);
    END IF;
END $$;

-- Vérifier et créer les politiques pour custom_exercises si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'custom_exercises' 
        AND policyname = 'Users can view their own custom exercises'
    ) THEN
        CREATE POLICY "Users can view their own custom exercises"
          ON public.custom_exercises
          FOR SELECT
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'custom_exercises' 
        AND policyname = 'Users can create their own custom exercises'
    ) THEN
        CREATE POLICY "Users can create their own custom exercises"
          ON public.custom_exercises
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'custom_exercises' 
        AND policyname = 'Users can update their own custom exercises'
    ) THEN
        CREATE POLICY "Users can update their own custom exercises"
          ON public.custom_exercises
          FOR UPDATE
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'custom_exercises' 
        AND policyname = 'Users can delete their own custom exercises'
    ) THEN
        CREATE POLICY "Users can delete their own custom exercises"
          ON public.custom_exercises
          FOR DELETE
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Vérifier et créer les politiques pour exercise_last_performance si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'exercise_last_performance' 
        AND policyname = 'Users can view their own exercise performance'
    ) THEN
        CREATE POLICY "Users can view their own exercise performance"
          ON public.exercise_last_performance
          FOR SELECT
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'exercise_last_performance' 
        AND policyname = 'Users can insert their own exercise performance'
    ) THEN
        CREATE POLICY "Users can insert their own exercise performance"
          ON public.exercise_last_performance
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'exercise_last_performance' 
        AND policyname = 'Users can update their own exercise performance'
    ) THEN
        CREATE POLICY "Users can update their own exercise performance"
          ON public.exercise_last_performance
          FOR UPDATE
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Vérifier et créer les politiques pour favorite_exercises si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'favorite_exercises' 
        AND policyname = 'Users can view their own favorite exercises'
    ) THEN
        CREATE POLICY "Users can view their own favorite exercises"
          ON public.favorite_exercises
          FOR SELECT
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'favorite_exercises' 
        AND policyname = 'Users can insert their own favorite exercises'
    ) THEN
        CREATE POLICY "Users can insert their own favorite exercises"
          ON public.favorite_exercises
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'favorite_exercises' 
        AND policyname = 'Users can delete their own favorite exercises'
    ) THEN
        CREATE POLICY "Users can delete their own favorite exercises"
          ON public.favorite_exercises
          FOR DELETE
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Vérifier et créer les politiques pour workout_templates si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'workout_templates' 
        AND policyname = 'Users can view their own workout templates'
    ) THEN
        CREATE POLICY "Users can view their own workout templates"
          ON public.workout_templates
          FOR SELECT
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'workout_templates' 
        AND policyname = 'Users can insert their own workout templates'
    ) THEN
        CREATE POLICY "Users can insert their own workout templates"
          ON public.workout_templates
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'workout_templates' 
        AND policyname = 'Users can update their own workout templates'
    ) THEN
        CREATE POLICY "Users can update their own workout templates"
          ON public.workout_templates
          FOR UPDATE
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'workout_templates' 
        AND policyname = 'Users can delete their own workout templates'
    ) THEN
        CREATE POLICY "Users can delete their own workout templates"
          ON public.workout_templates
          FOR DELETE
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Vérifier et créer les politiques pour workouts si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'workouts' 
        AND policyname = 'Users can view their own workouts'
    ) THEN
        CREATE POLICY "Users can view their own workouts"
          ON public.workouts
          FOR SELECT
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'workouts' 
        AND policyname = 'Users can create their own workouts'
    ) THEN
        CREATE POLICY "Users can create their own workouts"
          ON public.workouts
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'workouts' 
        AND policyname = 'Users can update their own workouts'
    ) THEN
        CREATE POLICY "Users can update their own workouts"
          ON public.workouts
          FOR UPDATE
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'workouts' 
        AND policyname = 'Users can delete their own workouts'
    ) THEN
        CREATE POLICY "Users can delete their own workouts"
          ON public.workouts
          FOR DELETE
          USING (auth.uid() = user_id);
    END IF;
END $$;
