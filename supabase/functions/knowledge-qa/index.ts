import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userId, organizationId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's groups
    const { data: userGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    const userGroupIds = userGroups?.map(g => g.group_id) || [];

    console.log('User groups:', userGroupIds);

    // Get resources accessible to user's groups
    const { data: accessiblePermissions } = await supabase
      .from('resource_permissions')
      .select('resource_id')
      .in('group_id', userGroupIds);

    const accessibleResourceIds = [...new Set(accessiblePermissions?.map(p => p.resource_id) || [])];

    console.log('Accessible resource IDs:', accessibleResourceIds);

    // Fetch accessible resources
    const { data: resources } = await supabase
      .from('resources')
      .select('id, name, type, integration, url')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .in('id', accessibleResourceIds)
      .limit(50);

    console.log('Accessible resources:', resources?.length || 0);

    const params = new URLSearchParams({
      question: String(question ?? ''),
      userId: String(userId ?? ''),
      organizationId: String(organizationId ?? ''),
      resourcesCount: String(resources?.length || 0),
      resources: JSON.stringify(resources || []),
    });

    const url = `https://documindsonline.app.n8n.cloud/webhook/94277c56-d3f1-4d6f-b143-26afefe0bcca?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N webhook error:', response.status, errorText);
      throw new Error(`N8N webhook failed: ${errorText}`);
    }

    const data = await response.json();
    console.log('N8N webhook response:', data);

    // Transform n8n response to expected format
    const formattedResponse = {
      answer: data.output || data.answer || 'Немає відповіді',
      output: data.output || data.answer || 'Немає відповіді',
      sources: data.sources || [],
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(formattedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in knowledge-qa function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
