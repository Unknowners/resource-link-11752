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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { integration_id } = await req.json();

    // Отримуємо поточні credentials
    const { data: credentials, error: credError } = await supabaseClient
      .from('integration_credentials')
      .select('*, integrations(*)')
      .eq('integration_id', integration_id)
      .eq('user_id', user.id)
      .single();

    if (credError || !credentials || !credentials.refresh_token) {
      throw new Error('No refresh token available');
    }

    const integration = credentials.integrations;
    console.log('Refreshing token for:', integration.name);

    // Оновлюємо токен
    const tokenResponse = await fetch(integration.oauth_token_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refresh_token,
        client_id: integration.oauth_client_id,
        client_secret: integration.oauth_client_secret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token refresh failed:', errorText);
      throw new Error(`Failed to refresh token: ${errorText}`);
    }

    const tokens: OAuthTokenResponse = await tokenResponse.json();
    console.log('Token refreshed successfully');

    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    // Зберігаємо нові токени
    const { error: updateError } = await supabaseClient
      .from('integration_credentials')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || credentials.refresh_token,
        token_expires_at: expiresAt,
      })
      .eq('id', credentials.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        access_token: tokens.access_token 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
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