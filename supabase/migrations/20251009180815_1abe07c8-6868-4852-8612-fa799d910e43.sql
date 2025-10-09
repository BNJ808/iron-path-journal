-- Create a table for manual day validations (for activities not recorded in the app)
CREATE TABLE public.manual_day_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.manual_day_validations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own manual validations" 
ON public.manual_day_validations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own manual validations" 
ON public.manual_day_validations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own manual validations" 
ON public.manual_day_validations 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own manual validations" 
ON public.manual_day_validations 
FOR UPDATE 
USING (auth.uid() = user_id);