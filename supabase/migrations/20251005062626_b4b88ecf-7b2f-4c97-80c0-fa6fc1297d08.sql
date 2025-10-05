-- Create onboarding_templates table for admin-defined onboarding video scripts
CREATE TABLE IF NOT EXISTS public.onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  script_template TEXT NOT NULL, -- Template with variables like {first_name}, {last_name}, {company}
  avatar_id TEXT DEFAULT 'Anna_public_3_20240108',
  voice_id TEXT DEFAULT 'bf39d0e71bd54a42b08ae1c208fe0a0f',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;

-- Policies for onboarding_templates
CREATE POLICY "Org owners can manage templates"
  ON public.onboarding_templates
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Members can view templates"
  ON public.onboarding_templates
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_onboarding_templates_updated_at
  BEFORE UPDATE ON public.onboarding_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default template
INSERT INTO public.onboarding_templates (organization_id, title, script_template)
SELECT 
  o.id,
  'Вітальне відео',
  'Вітаємо, {first_name}! Ласкаво просимо до команди {company}. Я ваш віртуальний асистент, і я допоможу вам швидко адаптуватися. У нашій компанії ви знайдете все необхідне для успішної роботи. Бажаємо вам продуктивної роботи та цікавих проектів!'
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_templates WHERE organization_id = o.id
)
LIMIT 1;