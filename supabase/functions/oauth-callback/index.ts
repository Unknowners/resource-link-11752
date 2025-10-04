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

    const { integration_id, code, state } = await req.json();
    console.log('OAuth callback received:', { integration_id, state });

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
    const tokenResponse = await fetch(integration.oauth_token_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: integration.oauth_client_id,
        client_secret: integration.oauth_client_secret,
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`,
      }),
    });

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

    // Зберігаємо токени
    const { error: credentialsError } = await supabaseClient
      .from('integration_credentials')
      .upsert({
        integration_id: integration_id,
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: expiresAt,
        scope: tokens.scope || integration.oauth_scopes,
      });

    if (credentialsError) {
      console.error('Failed to save credentials:', credentialsError);
      throw credentialsError;
    }

    console.log('Credentials saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Авторизація успішна! Ваш акаунт підключено.' 
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