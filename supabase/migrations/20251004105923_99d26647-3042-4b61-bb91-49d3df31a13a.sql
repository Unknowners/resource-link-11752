-- Create comprehensive audit logging triggers
-- Groups audit
CREATE OR REPLACE FUNCTION public.audit_groups_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  v_org_id := COALESCE(NEW.organization_id, OLD.organization_id);
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      v_org_id,
      'create',
      'group',
      NEW.id::text,
      jsonb_build_object('name', NEW.name, 'description', NEW.description)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      v_org_id,
      'update',
      'group',
      NEW.id::text,
      jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      v_org_id,
      'delete',
      'group',
      OLD.id::text,
      jsonb_build_object('name', OLD.name)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_groups_trigger ON public.groups;
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
DECLARE
  v_org_id UUID;
BEGIN
  v_org_id := COALESCE(NEW.organization_id, OLD.organization_id);
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      v_org_id,
      'create',
      'resource',
      NEW.id::text,
      jsonb_build_object('name', NEW.name, 'type', NEW.type, 'integration', NEW.integration)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      v_org_id,
      'update',
      'resource',
      NEW.id::text,
      jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      v_org_id,
      'delete',
      'resource',
      OLD.id::text,
      jsonb_build_object('name', OLD.name, 'type', OLD.type)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_resources_trigger ON public.resources;
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
DECLARE
  v_org_id UUID;
BEGIN
  v_org_id := COALESCE(NEW.organization_id, OLD.organization_id);
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      v_org_id,
      'create',
      'integration',
      NEW.id::text,
      jsonb_build_object('name', NEW.name, 'type', NEW.type)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      v_org_id,
      'update',
      'integration',
      NEW.id::text,
      jsonb_build_object('name', NEW.name, 'old_status', OLD.status, 'new_status', NEW.status)
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      v_org_id,
      'delete',
      'integration',
      OLD.id::text,
      jsonb_build_object('name', OLD.name, 'type', OLD.type)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_integrations_trigger ON public.integrations;
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
  v_org_id UUID;
BEGIN
  v_org_id := COALESCE(NEW.organization_id, OLD.organization_id);
  
  -- Get user email from profiles
  SELECT email INTO v_user_email
  FROM public.profiles
  WHERE id = COALESCE(NEW.user_id, OLD.user_id)
  LIMIT 1;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      v_org_id,
      'create',
      'member',
      NEW.user_id::text,
      jsonb_build_object('email', v_user_email, 'role', NEW.role)
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, organization_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      v_org_id,
      'delete',
      'member',
      OLD.user_id::text,
      jsonb_build_object('email', v_user_email, 'role', OLD.role)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_org_members_trigger ON public.organization_members;
CREATE TRIGGER audit_org_members_trigger
  AFTER INSERT OR DELETE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_org_members_changes();