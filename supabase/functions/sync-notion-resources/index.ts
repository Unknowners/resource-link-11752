import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotionPage {
  id: string;
  object: string;
  parent?: {
    type: string;
    workspace?: boolean;
  };
  properties?: {
    title?: {
      title?: Array<{ plain_text: string }>;
    };
  };
  url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { integration_id } = await req.json();

    // Отримуємо інтеграцію та credentials
    const { data: integration, error: intError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (intError || !integration) {
      throw new Error("Integration not found");
    }

    const { data: credentials, error: credError } = await supabase
      .from('integration_credentials')
      .select('access_token')
      .eq('integration_id', integration_id)
      .eq('user_id', user.id)
      .single();

    if (credError || !credentials) {
      throw new Error("No credentials found");
    }

    console.log("Syncing Notion resources for integration:", integration.name);

    // Отримуємо всі Notion pages/databases через search API
    const searchResponse = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          value: 'page',
          property: 'object',
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      throw new Error(`Notion API error: ${errorText}`);
    }

    const searchData = await searchResponse.json();
    const pages: NotionPage[] = searchData.results || [];

    console.log(`Found ${pages.length} Notion pages`);

    // Фільтруємо лише top-level pages (workspace pages без parent)
    const workspacePages = pages.filter(page => 
      !page.parent || 
      (page.parent.type === 'workspace' && page.parent.workspace === true)
    );

    console.log(`Found ${workspacePages.length} workspace-level pages`);

    const resources = [];

    for (const page of workspacePages) {
      // Отримуємо назву сторінки
      let pageName = 'Untitled';
      if (page.properties?.title?.title && page.properties.title.title.length > 0) {
        pageName = page.properties.title.title[0].plain_text || 'Untitled';
      }

      const resource = {
        organization_id: integration.organization_id,
        name: `Notion: ${pageName}`,
        type: 'notion_page',
        integration: integration.name,
        url: page.url || `https://notion.so/${page.id.replace(/-/g, '')}`,
        status: 'active' as const,
        last_synced_at: new Date().toISOString(),
      };

      resources.push(resource);
    }

    console.log(`Prepared ${resources.length} resources to sync`);

    // Видаляємо старі Notion ресурси для цієї інтеграції
    const { error: deleteError } = await supabase
      .from('resources')
      .delete()
      .eq('integration', integration.name)
      .eq('type', 'notion_page');

    if (deleteError) {
      console.error('Error deleting old resources:', deleteError);
    }

    // Додаємо нові ресурси
    if (resources.length > 0) {
      const { error: insertError } = await supabase
        .from('resources')
        .insert(resources);

      if (insertError) {
        throw new Error(`Failed to insert resources: ${insertError.message}`);
      }
    }

    // Оновлюємо last_sync_at інтеграції
    await supabase
      .from('integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', integration_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Синхронізовано ${resources.length} Notion сторінок`,
        resources_count: resources.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in sync-notion-resources:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
