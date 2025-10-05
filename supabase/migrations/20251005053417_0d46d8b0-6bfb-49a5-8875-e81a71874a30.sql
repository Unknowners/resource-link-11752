-- Create learning modules table
CREATE TABLE public.learning_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- minutes
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  content JSONB, -- structured learning content
  resources JSONB, -- links to materials
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;

-- Users can view their own modules
CREATE POLICY "Users can view their own learning modules"
ON public.learning_modules
FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own modules (mark as completed)
CREATE POLICY "Users can update their own learning modules"
ON public.learning_modules
FOR UPDATE
USING (user_id = auth.uid());

-- Users can insert their own modules
CREATE POLICY "Users can create their own learning modules"
ON public.learning_modules
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Org owners can manage modules for their organization
CREATE POLICY "Org owners can manage organization learning modules"
ON public.learning_modules
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Create index for faster queries
CREATE INDEX idx_learning_modules_user_id ON public.learning_modules(user_id);
CREATE INDEX idx_learning_modules_position_id ON public.learning_modules(position_id);
CREATE INDEX idx_learning_modules_organization_id ON public.learning_modules(organization_id);

-- Add trigger for updated_at
CREATE TRIGGER update_learning_modules_updated_at
BEFORE UPDATE ON public.learning_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();