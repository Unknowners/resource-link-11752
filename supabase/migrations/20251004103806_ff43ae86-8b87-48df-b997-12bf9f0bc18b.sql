-- 1. Create a default organization for existing user
INSERT INTO public.organizations (name, plan, status)
VALUES ('Webew', 'professional', 'active')
RETURNING id;

-- 2. Link user to organization
WITH org AS (
  SELECT id FROM public.organizations WHERE name = 'Webew' LIMIT 1
)
UPDATE public.profiles
SET organization_id = (SELECT id FROM org)
WHERE email = 'antonyaskevych@gmail.com';

-- 3. Add user to organization members
WITH org AS (
  SELECT id FROM public.organizations WHERE name = 'Webew' LIMIT 1
), usr AS (
  SELECT id FROM public.profiles WHERE email = 'antonyaskevych@gmail.com' LIMIT 1
)
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT (SELECT id FROM org), (SELECT id FROM usr), 'owner'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 4. Add admin role to user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM public.profiles
WHERE email = 'antonyaskevych@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Update handle_new_user trigger to auto-create organization for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Create organization for the user (use company name or email domain)
  INSERT INTO public.organizations (
    name,
    domain,
    plan,
    status
  ) VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company', split_part(NEW.email, '@', 2)),
    split_part(NEW.email, '@', 2),
    'starter',
    'active'
  )
  RETURNING id INTO v_org_id;

  -- Insert profile with organization
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email, 
    company,
    organization_id
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    NEW.raw_user_meta_data->>'company',
    v_org_id
  );
  
  -- Add user to organization as owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, NEW.id, 'owner');
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;