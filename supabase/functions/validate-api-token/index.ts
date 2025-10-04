import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { integration_id, email, api_token, site_url } = await req.json();

    console.log('Validating API token for integration:', integration_id);

    // Отримуємо інтеграцію
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integrations')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integration not found');
    }

    // Отримуємо site URL (з параметрів або з інтеграції)
    const atlassianSiteUrl = site_url || integration.oauth_authorize_url;
    
    if (!atlassianSiteUrl) {
      throw new Error('Atlassian site URL is required. Please provide your Atlassian domain (e.g., yourcompany.atlassian.net)');
    }

    let validationStatus = 'pending';
    let validationError = null;

    // Валідуємо для Atlassian
    if (integration.type === 'atlassian') {
      // Створюємо Basic Auth header
      const authString = btoa(`${email}:${api_token}`);
      
      try {
        // Нормалізуємо URL (додаємо https:// якщо немає)
        let normalizedUrl = atlassianSiteUrl.trim();
        if (!normalizedUrl.startsWith('http')) {
          normalizedUrl = `https://${normalizedUrl}`;
        }
        
        // Тестуємо доступ до Jira API
        const jiraTestUrl = `${normalizedUrl}/rest/api/3/myself`;
        console.log('Testing Jira API access:', jiraTestUrl);
        
        const testResponse = await fetch(jiraTestUrl, {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Accept': 'application/json',
          },
        });

        if (testResponse.ok) {
          const userData = await testResponse.json();
          console.log('Jira authentication successful for user:', userData.emailAddress);
          validationStatus = 'validated';
          
          // Створюємо ресурс для цього Jira сайту
          const siteName = normalizedUrl.replace('https://', '').replace('http://', '');
          
          const { error: resourceError } = await supabaseClient
            .from('resources')
            .upsert({
              organization_id: integration.organization_id,
              name: `Jira: ${siteName}`,
              type: 'atlassian_site',
              integration: integration.name,
              url: normalizedUrl,
            }, {
              onConflict: 'organization_id,name,integration',
            });
          
          if (resourceError) {
            console.error('Failed to sync Jira resource:', resourceError);
          } else {
            console.log('Synced Jira site to database:', siteName);
          }
        } else {
          const errorText = await testResponse.text();
          console.error('Validation failed:', testResponse.status, errorText);
          validationStatus = 'error';
          validationError = `Authentication failed: ${testResponse.status}. Check email and token.`;
        }
      } catch (validationErr) {
        console.error('Validation error:', validationErr);
        validationStatus = 'error';
        validationError = validationErr instanceof Error ? validationErr.message : 'Unknown error';
      }
    }

    // Зберігаємо credentials
    const { error: credentialsError } = await supabaseClient
      .from('integration_credentials')
      .upsert({
        integration_id: integration_id,
        user_id: user.id,
        access_token: api_token, // зберігаємо API token як access_token
        connection_status: validationStatus,
        validation_error: validationError,
        last_validated_at: new Date().toISOString(),
        scope: 'api_token_auth', // маркер що це API token
      });

    if (credentialsError) {
      console.error('Failed to save credentials:', credentialsError);
      throw credentialsError;
    }

    console.log('Credentials saved with status:', validationStatus);

    return new Response(
      JSON.stringify({ 
        success: validationStatus !== 'error',
        message: validationStatus === 'validated' 
          ? 'API Token перевірено успішно!' 
          : `Помилка перевірки: ${validationError}`,
        status: validationStatus,
        error: validationError,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: validationStatus === 'error' ? 400 : 200,
      }
    );
  } catch (error) {
    console.error('API token validation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});