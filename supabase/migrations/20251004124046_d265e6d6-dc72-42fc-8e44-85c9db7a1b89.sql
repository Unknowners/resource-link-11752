-- Update RLS policies to restrict management operations to owners only

-- Groups table - only owners can manage
DROP POLICY IF EXISTS "Org owners can manage their groups" ON public.groups;
CREATE POLICY "Org owners can manage their groups"
ON public.groups
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role = 'owner'
  )
);

-- Group members - only owners can manage
DROP POLICY IF EXISTS "Org owners can manage their group members" ON public.group_members;
CREATE POLICY "Org owners can manage their group members"
ON public.group_members
FOR ALL
USING (
  group_id IN (
    SELECT id
    FROM groups
    WHERE organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  )
);

-- Resources - only owners can manage
DROP POLICY IF EXISTS "Org owners can manage their resources" ON public.resources;
CREATE POLICY "Org owners can manage their resources"
ON public.resources
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role = 'owner'
  )
);

-- Resource permissions - only owners can manage
DROP POLICY IF EXISTS "Org owners can manage their resource permissions" ON public.resource_permissions;
CREATE POLICY "Org owners can manage their resource permissions"
ON public.resource_permissions
FOR ALL
USING (
  resource_id IN (
    SELECT id
    FROM resources
    WHERE organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  )
);

-- Integrations - only owners can manage
DROP POLICY IF EXISTS "Org owners can manage their integrations" ON public.integrations;
CREATE POLICY "Org owners can manage their integrations"
ON public.integrations
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role = 'owner'
  )
);

-- Allow members to view (SELECT only)
CREATE POLICY "Members can view groups"
ON public.groups
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Members can view group members"
ON public.group_members
FOR SELECT
USING (
  group_id IN (
    SELECT id
    FROM groups
    WHERE organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Members can view resources"
ON public.resources
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Members can view resource permissions"
ON public.resource_permissions
FOR SELECT
USING (
  resource_id IN (
    SELECT id
    FROM resources
    WHERE organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Members can view integrations"
ON public.integrations
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);