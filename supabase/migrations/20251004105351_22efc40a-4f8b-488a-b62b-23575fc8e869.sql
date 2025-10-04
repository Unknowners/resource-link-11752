-- Remove is_super_admin boolean field
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS is_super_admin;

-- Create enum for super admin roles
CREATE TYPE public.super_admin_role AS ENUM ('super_admin', 'support', 'finance', 'analyst');

-- Create super_admin_roles table
CREATE TABLE IF NOT EXISTS public.super_admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role super_admin_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.super_admin_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for super_admin_roles
CREATE POLICY "Users can view their own super admin roles"
  ON public.super_admin_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all super admin roles"
  ON public.super_admin_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.super_admin_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.super_admin_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Create function to check super admin role
CREATE OR REPLACE FUNCTION public.has_super_admin_role(_user_id uuid, _role super_admin_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.super_admin_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is any super admin
CREATE OR REPLACE FUNCTION public.is_any_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.super_admin_roles
    WHERE user_id = _user_id
  )
$$;

-- Set your user as super_admin
INSERT INTO public.super_admin_roles (user_id, role)
VALUES ('161a7214-5d1a-4eb5-915e-a185e7a89c7e', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update all RLS policies to use new function
DROP POLICY IF EXISTS "Super admins and admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Super admins and admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    is_any_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Super admins can manage all organizations" ON public.organizations;
CREATE POLICY "Super admins can manage all organizations"
  ON public.organizations FOR ALL
  USING (is_any_super_admin(auth.uid()))
  WITH CHECK (is_any_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all organizations" ON public.organizations;
CREATE POLICY "Admins and super admins can view all organizations"
  ON public.organizations FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    is_any_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Super admins can manage organization memberships" ON public.organization_members;
CREATE POLICY "Super admins can manage organization memberships"
  ON public.organization_members FOR ALL
  USING (is_any_super_admin(auth.uid()))
  WITH CHECK (is_any_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view their organization memberships" ON public.organization_members;
CREATE POLICY "Users can view their organization memberships"
  ON public.organization_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    has_role(auth.uid(), 'admin'::app_role) OR
    is_any_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Super admins and admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins and admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR
    has_role(auth.uid(), 'admin'::app_role) OR
    is_any_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL
  USING (is_any_super_admin(auth.uid()))
  WITH CHECK (is_any_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins and admins can view all roles" ON public.user_roles;
CREATE POLICY "Super admins and admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (
    auth.uid() = user_id OR
    has_role(auth.uid(), 'admin'::app_role) OR
    is_any_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Super admins can manage all groups" ON public.groups;
CREATE POLICY "Super admins can manage all groups"
  ON public.groups FOR ALL
  USING (is_any_super_admin(auth.uid()))
  WITH CHECK (is_any_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can manage group members" ON public.group_members;
CREATE POLICY "Super admins can manage group members"
  ON public.group_members FOR ALL
  USING (is_any_super_admin(auth.uid()))
  WITH CHECK (is_any_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can manage all resources" ON public.resources;
CREATE POLICY "Super admins can manage all resources"
  ON public.resources FOR ALL
  USING (is_any_super_admin(auth.uid()))
  WITH CHECK (is_any_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can manage resource permissions" ON public.resource_permissions;
CREATE POLICY "Super admins can manage resource permissions"
  ON public.resource_permissions FOR ALL
  USING (is_any_super_admin(auth.uid()))
  WITH CHECK (is_any_super_admin(auth.uid()));