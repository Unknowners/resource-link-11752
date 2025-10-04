-- Add invitation status to organization_members
ALTER TABLE public.organization_members 
ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'accepted';

-- Update existing members to 'accepted'
UPDATE public.organization_members 
SET invitation_status = 'accepted' 
WHERE invitation_status IS NULL;

-- Add comment
COMMENT ON COLUMN public.organization_members.invitation_status IS 'Status of invitation: pending, accepted, expired';
