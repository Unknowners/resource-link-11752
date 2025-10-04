-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their organization invitations"
  ON public.invitations
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Org owners can create invitations"
  ON public.invitations
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Org owners can delete invitations"
  ON public.invitations
  FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role = 'owner'
  ));

-- Index for faster lookups
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);
