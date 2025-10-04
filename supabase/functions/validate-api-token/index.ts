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

    const { integration_id, email, api_token } = await req.json();

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

    let validationStatus = 'pending';
    let validationError = null;

    // Валідуємо для Atlassian
    if (integration.type === 'atlassian') {
      // Створюємо Basic Auth header
      const authString = btoa(`${email}:${api_token}`);
      
      try {
        // Тестуємо доступ до Atlassian API
        const testResponse = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Accept': 'application/json',
          },
        });

        if (testResponse.ok) {
          const resources = await testResponse.json();
          console.log('Atlassian resources accessible:', resources.length);
          
          if (resources.length === 0) {
            validationStatus = 'error';
            validationError = 'No accessible Atlassian resources found';
          } else {
            validationStatus = 'validated';
            console.log('Available sites:', resources.map((r: any) => r.name).join(', '));
            
            // Синхронізуємо ресурси в БД
            for (const resource of resources) {
              const { error: resourceError } = await supabaseClient
                .from('resources')
                .upsert({
                  organization_id: integration.organization_id,
                  name: resource.name,
                  type: 'atlassian_site',
                  integration: integration.name,
                  url: resource.url,
                }, {
                  onConflict: 'organization_id,name,integration',
                });
              
              if (resourceError) {
                console.error('Failed to sync resource:', resource.name, resourceError);
              }
            }
            
            console.log(`Synced ${resources.length} Atlassian sites to database`);
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