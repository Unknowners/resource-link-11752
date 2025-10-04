-- Add status column to organization_members table
ALTER TABLE public.organization_members 
ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- Add check constraint for valid status values
ALTER TABLE public.organization_members
ADD CONSTRAINT organization_members_status_check 
CHECK (status IN ('active', 'blocked'));

-- Add comment
COMMENT ON COLUMN public.organization_members.status IS 'User status in organization: active or blocked';