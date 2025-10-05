-- Add new columns to team_ideas for the "Барабан ідей" game
ALTER TABLE public.team_ideas
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
ADD COLUMN scheduled_reminder_date TIMESTAMPTZ,
ADD COLUMN karma INTEGER DEFAULT 0,
ADD COLUMN comments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN archived BOOLEAN DEFAULT false;

-- Create index for faster project filtering
CREATE INDEX idx_team_ideas_project_id ON public.team_ideas(project_id);
CREATE INDEX idx_team_ideas_organization_archived ON public.team_ideas(organization_id, archived);

-- Add comment to karma column
COMMENT ON COLUMN public.team_ideas.karma IS 'Points for likes and developments';
COMMENT ON COLUMN public.team_ideas.comments IS 'Array of comments with user_id, text, created_at';
COMMENT ON COLUMN public.team_ideas.archived IS 'If true, idea is archived and not shown in active spin';