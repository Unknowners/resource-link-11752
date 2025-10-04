-- Add logging to the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_company_name TEXT;
  v_domain TEXT;
BEGIN
  -- Extract company name and domain
  v_company_name := COALESCE(NEW.raw_user_meta_data->>'company', split_part(NEW.email, '@', 2));
  v_domain := split_part(NEW.email, '@', 2);
  
  RAISE LOG 'Creating user: %, company: %, domain: %', NEW.email, v_company_name, v_domain;
  
  -- Create organization for the user
  INSERT INTO public.organizations (
    name,
    domain,
    plan,
    status
  ) VALUES (
    v_company_name,
    v_domain,
    'starter',
    'active'
  )
  RETURNING id INTO v_org_id;
  
  RAISE LOG 'Created organization with id: %', v_org_id;

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
  
  RAISE LOG 'Created profile for user: %', NEW.id;
  
  -- Add user to organization as owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, NEW.id, 'owner');
  
  RAISE LOG 'Added user to organization as owner';
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RAISE LOG 'Assigned user role to user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RAISE;
END;
$$;