-- Add is_super_admin field to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Set your user as super admin
UPDATE public.profiles
SET is_super_admin = true
WHERE id = '161a7214-5d1a-4eb5-915e-a185e7a89c7e';

-- Create function to check super admin status
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_super_admin, false)
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Update audit_logs RLS policies to include super admins
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Super admins and admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    is_super_admin(auth.uid())
  );

-- Update organizations RLS policies
DROP POLICY IF EXISTS "Admins can manage all organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins can view all organizations" ON public.organizations;

CREATE POLICY "Super admins can manage all organizations"
  ON public.organizations FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admins can view all organizations"
  ON public.organizations FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    is_super_admin(auth.uid())
  );

-- Update organization_members RLS policies
DROP POLICY IF EXISTS "Admins can manage organization memberships" ON public.organization_members;
CREATE POLICY "Super admins can manage organization memberships"
  ON public.organization_members FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view their organization memberships" ON public.organization_members;
CREATE POLICY "Users can view their organization memberships"
  ON public.organization_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    has_role(auth.uid(), 'admin'::app_role) OR
    is_super_admin(auth.uid())
  );

-- Update profiles RLS policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins and admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR
    has_role(auth.uid(), 'admin'::app_role) OR
    is_super_admin(auth.uid())
  );

-- Update user_roles RLS policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins and admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (
    auth.uid() = user_id OR
    has_role(auth.uid(), 'admin'::app_role) OR
    is_super_admin(auth.uid())
  );

-- Update groups RLS policies
DROP POLICY IF EXISTS "Admins can manage all groups" ON public.groups;
CREATE POLICY "Super admins can manage all groups"
  ON public.groups FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- Update group_members RLS policies
DROP POLICY IF EXISTS "Admins can manage group members" ON public.group_members;
CREATE POLICY "Super admins can manage group members"
  ON public.group_members FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- Update resources RLS policies
DROP POLICY IF EXISTS "Admins can manage all resources" ON public.resources;
CREATE POLICY "Super admins can manage all resources"
  ON public.resources FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- Update resource_permissions RLS policies
DROP POLICY IF EXISTS "Admins can manage resource permissions" ON public.resource_permissions;
CREATE POLICY "Super admins can manage resource permissions"
  ON public.resource_permissions FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));