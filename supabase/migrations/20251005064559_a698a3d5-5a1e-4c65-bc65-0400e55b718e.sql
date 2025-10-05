-- Add Google Calendar credentials to organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS google_calendar_client_id TEXT,
ADD COLUMN IF NOT EXISTS google_calendar_client_secret TEXT;

-- Create google_calendar_credentials table
CREATE TABLE IF NOT EXISTS public.google_calendar_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_calendar_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own credentials"
  ON public.google_calendar_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials"
  ON public.google_calendar_credentials
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials"
  ON public.google_calendar_credentials
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add google_calendar_event_id to learning_schedule
ALTER TABLE public.learning_schedule 
ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- Updated at trigger
CREATE TRIGGER update_google_calendar_credentials_updated_at
  BEFORE UPDATE ON public.google_calendar_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();