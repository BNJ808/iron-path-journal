
-- Create a table for body measurements
CREATE TABLE public.body_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  weight NUMERIC(5, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comments to the columns
COMMENT ON COLUMN public.body_measurements.weight IS 'Weight in kilograms';
COMMENT ON COLUMN public.body_measurements.date IS 'Date of the measurement';

-- Add a unique constraint to ensure one measurement per user per day
ALTER TABLE public.body_measurements ADD CONSTRAINT one_measurement_per_day UNIQUE (user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own measurements
CREATE POLICY "Users can view their own body measurements"
  ON public.body_measurements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own measurements
CREATE POLICY "Users can insert their own body measurements"
  ON public.body_measurements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own measurements
CREATE POLICY "Users can update their own body measurements"
  ON public.body_measurements
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own measurements
CREATE POLICY "Users can delete their own body measurements"
  ON public.body_measurements
  FOR DELETE
  USING (auth.uid() = user_id);
