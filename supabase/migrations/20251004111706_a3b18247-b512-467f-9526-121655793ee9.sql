-- Create table for storing OAuth credentials
CREATE TABLE public.integration_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(integration_id, user_id)
);

-- Enable RLS
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;

-- Only the user can see their own credentials
CREATE POLICY "Users can view their own credentials"
ON public.integration_credentials
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own credentials
CREATE POLICY "Users can insert their own credentials"
ON public.integration_credentials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own credentials
CREATE POLICY "Users can update their own credentials"
ON public.integration_credentials
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own credentials
CREATE POLICY "Users can delete their own credentials"
ON public.integration_credentials
FOR DELETE
USING (auth.uid() = user_id);

-- Super admins can view all credentials (for debugging)
CREATE POLICY "Super admins can view all credentials"
ON public.integration_credentials
FOR SELECT
USING (is_any_super_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_integration_credentials_updated_at
BEFORE UPDATE ON public.integration_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update integrations table to store OAuth config
ALTER TABLE public.integrations 
ADD COLUMN IF NOT EXISTS oauth_client_id TEXT,
ADD COLUMN IF NOT EXISTS oauth_client_secret TEXT,
ADD COLUMN IF NOT EXISTS oauth_authorize_url TEXT,
ADD COLUMN IF NOT EXISTS oauth_token_url TEXT,
ADD COLUMN IF NOT EXISTS oauth_scopes TEXT;