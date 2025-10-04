-- Create integrations table
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'jira', 'confluence', 'notion', 'gdrive', etc
  status TEXT NOT NULL DEFAULT 'disconnected', -- 'connected', 'error', 'disconnected'
  config JSONB, -- OAuth tokens, API keys (encrypted), settings
  last_sync_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integrations
CREATE POLICY "Users can view their organization integrations"
  ON public.integrations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all integrations"
  ON public.integrations FOR ALL
  USING (is_any_super_admin(auth.uid()))
  WITH CHECK (is_any_super_admin(auth.uid()));

CREATE POLICY "Org owners can manage their integrations"
  ON public.integrations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update audit_logs table to have organization_id NOT NULL
ALTER TABLE public.audit_logs
ALTER COLUMN organization_id SET NOT NULL;

-- Create comprehensive audit logging triggers
-- Groups audit
CREATE OR REPLACE FUNCTION public.audit_groups_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      NEW.organization_id,
      'create',
      'group',
      NEW.id::text,
      jsonb_build_object('name', NEW.name, 'description', NEW.description)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      NEW.organization_id,
      'update',
      'group',
      NEW.id::text,
      jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      OLD.organization_id,
      'delete',
      'group',
      OLD.id::text,
      jsonb_build_object('name', OLD.name)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_groups_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_groups_changes();

-- Resources audit
CREATE OR REPLACE FUNCTION public.audit_resources_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      NEW.organization_id,
      'create',
      'resource',
      NEW.id::text,
      jsonb_build_object('name', NEW.name, 'type', NEW.type, 'integration', NEW.integration)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      NEW.organization_id,
      'update',
      'resource',
      NEW.id::text,
      jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      OLD.organization_id,
      'delete',
      'resource',
      OLD.id::text,
      jsonb_build_object('name', OLD.name, 'type', OLD.type)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_resources_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_resources_changes();

-- Integrations audit
CREATE OR REPLACE FUNCTION public.audit_integrations_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      NEW.organization_id,
      'create',
      'integration',
      NEW.id::text,
      jsonb_build_object('name', NEW.name, 'type', NEW.type)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      NEW.organization_id,
      'update',
      'integration',
      NEW.id::text,
      jsonb_build_object('name', NEW.name, 'old_status', OLD.status, 'new_status', NEW.status)
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      OLD.organization_id,
      'delete',
      'integration',
      OLD.id::text,
      jsonb_build_object('name', OLD.name, 'type', OLD.type)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_integrations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_integrations_changes();

-- Organization members audit
CREATE OR REPLACE FUNCTION public.audit_org_members_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Get user email from profiles
  SELECT email INTO v_user_email
  FROM public.profiles
  WHERE id = COALESCE(NEW.user_id, OLD.user_id)
  LIMIT 1;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      NEW.organization_id,
      'create',
      'member',
      NEW.user_id::text,
      jsonb_build_object('email', v_user_email, 'role', NEW.role)
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      OLD.organization_id,
      'delete',
      'member',
      OLD.user_id::text,
      jsonb_build_object('email', v_user_email, 'role', OLD.role)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_org_members_trigger
  AFTER INSERT OR DELETE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_org_members_changes();