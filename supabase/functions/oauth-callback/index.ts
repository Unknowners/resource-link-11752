import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
}

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

    // Отримуємо користувача
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { integration_id, code, state, redirect_uri } = await req.json();
    console.log('OAuth callback received:', { integration_id, state, redirect_uri });

    // Отримуємо налаштування інтеграції
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integrations')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integration not found');
    }

    console.log('Integration found:', integration.name);

    // Обмінюємо код на токени
    // redirect_uri повинен співпадати з тим, який використовувався при авторизації
    const redirectUri = integration.config?.redirect_uri || redirect_uri || 'https://documinds.online/app/integrations';
    console.log('Using redirect_uri for token exchange:', redirectUri);
    
    let tokenResponse: Response;
    if (integration.type === 'notion') {
      // Notion requires Basic auth header and JSON body for token exchange
      console.log('client_id:', integration.oauth_client_id);
      const secretPreview = (integration.oauth_client_secret ?? '').slice(0, 5) + '...';
      console.log('client_secret:', secretPreview);
      console.log('redirect_uri in request:', redirectUri);

      // Safe Base64 for Deno (UTF-8 safe)
      const encoder = new TextEncoder();
      const data = encoder.encode(`${integration.oauth_client_id}:${integration.oauth_client_secret}`);
      const basic = btoa(String.fromCharCode(...data));

      tokenResponse = await fetch(integration.oauth_token_url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basic}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });
    } else {
      // Default OAuth token exchange (x-www-form-urlencoded)
      tokenResponse = await fetch(integration.oauth_token_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: integration.oauth_client_id,
          client_secret: integration.oauth_client_secret,
          redirect_uri: redirectUri,
        }),
      });
    }

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Failed to exchange code for token: ${errorText}`);
    }

    const tokens: OAuthTokenResponse = await tokenResponse.json();
    console.log('Tokens received successfully');

    // Обчислюємо час закінчення токена
    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    // Перевіряємо які scopes реально були надані
    const grantedScopes = tokens.scope || integration.oauth_scopes || '';
    const requestedScopes = integration.oauth_scopes?.split(' ') || [];
    const grantedScopesArray = grantedScopes ? grantedScopes.split(' ').filter((s: string) => s) : [];
    const missingScopes = requestedScopes.filter((scope: string) => !grantedScopesArray.includes(scope));

    console.log('Requested scopes:', requestedScopes);
    console.log('Granted scopes:', grantedScopesArray);
    console.log('Missing scopes:', missingScopes);

    // Валідуємо connection тестовим запитом
    let validationStatus = 'pending';
    let validationError = null;

    try {
      // Для Atlassian - тестуємо доступ до accessible-resources
      if (integration.type === 'atlassian') {
        const testResponse = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Accept': 'application/json',
          },
        });

        if (testResponse.ok) {
          const resources = await testResponse.json();
          console.log('Atlassian resources accessible:', resources.length);
          validationStatus = 'validated';
        } else {
          const errorText = await testResponse.text();
          console.error('Validation failed:', errorText);
          validationError = `Failed to access Atlassian resources: ${errorText}`;
          validationStatus = 'error';
        }
      }
      // Для Google - перевіряємо userinfo
      else if (integration.type === 'google_drive') {
        const testResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        });

        if (testResponse.ok) {
          validationStatus = 'validated';
        } else {
          validationError = 'Failed to access Google user info';
          validationStatus = 'error';
        }
      }
      // Для GitHub - перевіряємо user
      else if (integration.type === 'github') {
        const testResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Accept': 'application/vnd.github+json',
          },
        });

        if (testResponse.ok) {
          validationStatus = 'validated';
        } else {
          validationError = 'Failed to access GitHub user info';
          validationStatus = 'error';
        }
      }
      // Для Notion - перевіряємо доступ до користувача та workspaces
      else if (integration.type === 'notion') {
        const testResponse = await fetch('https://api.notion.com/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Notion-Version': '2022-06-28',
          },
        });

        if (testResponse.ok) {
          validationStatus = 'validated';
          console.log('Notion user access validated');
        } else {
          const errorText = await testResponse.text();
          console.error('Notion validation failed:', errorText);
          validationError = `Failed to access Notion user info: ${errorText}`;
          validationStatus = 'error';
        }
      } else {
        // Для інших провайдерів - вважаємо validated якщо токен отримано
        validationStatus = 'validated';
      }
    } catch (validationErr) {
      console.error('Validation error:', validationErr);
      validationError = validationErr instanceof Error ? validationErr.message : 'Unknown validation error';
      validationStatus = 'error';
    }

    // Зберігаємо токени та статус валідації
    const { error: credentialsError } = await supabaseClient
      .from('integration_credentials')
      .upsert({
        integration_id: integration_id,
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: expiresAt,
        scope: tokens.scope || integration.oauth_scopes,
        granted_scopes: grantedScopes,
        connection_status: validationStatus,
        validation_error: validationError,
        last_validated_at: new Date().toISOString(),
      });

    if (credentialsError) {
      console.error('Failed to save credentials:', credentialsError);
      throw credentialsError;
    }

    console.log('Credentials saved successfully with status:', validationStatus);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: validationStatus === 'validated' 
          ? 'Авторизація успішна! Підключення перевірено.' 
          : validationStatus === 'error'
          ? `Токен отримано, але є проблема: ${validationError}`
          : 'Авторизація успішна! Перевірка підключення...',
        status: validationStatus,
        integration_type: integration.type,
        missing_scopes: missingScopes.length > 0 ? missingScopes : undefined,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
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