-- Create team_ideas table for Team Memory feature
CREATE TABLE public.team_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'outdated')),
  suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_ideas ENABLE ROW LEVEL SECURITY;

-- Users can view ideas in their organization
CREATE POLICY "Users can view their organization ideas"
ON public.team_ideas
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Users can create ideas in their organization
CREATE POLICY "Users can create ideas in their organization"
ON public.team_ideas
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
  AND user_id = auth.uid()
);

-- Users can update their own ideas
CREATE POLICY "Users can update their own ideas"
ON public.team_ideas
FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own ideas
CREATE POLICY "Users can delete their own ideas"
ON public.team_ideas
FOR DELETE
USING (user_id = auth.uid());

-- Create index for faster queries
CREATE INDEX idx_team_ideas_organization ON team_ideas(organization_id);
CREATE INDEX idx_team_ideas_status ON team_ideas(status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_team_ideas_updated_at
BEFORE UPDATE ON public.team_ideas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();