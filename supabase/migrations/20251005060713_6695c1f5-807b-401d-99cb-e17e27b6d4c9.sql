-- Create learning schedule table
CREATE TABLE IF NOT EXISTS public.learning_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  duration INTEGER NOT NULL,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_schedule ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own schedule"
  ON public.learning_schedule
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedule"
  ON public.learning_schedule
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedule"
  ON public.learning_schedule
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedule"
  ON public.learning_schedule
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_learning_schedule_user ON public.learning_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_schedule_date ON public.learning_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_learning_schedule_user_date ON public.learning_schedule(user_id, scheduled_date);

-- Add trigger for updated_at
CREATE TRIGGER update_learning_schedule_updated_at
  BEFORE UPDATE ON public.learning_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.learning_schedule IS 'Stores scheduled learning sessions';
COMMENT ON COLUMN public.learning_schedule.status IS 'Status: scheduled, completed, cancelled';
