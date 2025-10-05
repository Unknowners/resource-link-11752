import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // userId
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(
        `<html><body><script>window.close();</script><p>Авторизація скасована</p></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code || !state) {
      throw new Error('Missing code or state');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get organization and OAuth credentials
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', state)
      .single();

    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('google_calendar_client_id, google_calendar_client_secret')
      .eq('id', profile.organization_id)
      .single();

    if (!org?.google_calendar_client_id || !org?.google_calendar_client_secret) {
      throw new Error('Google Calendar credentials not configured');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: org.google_calendar_client_id,
        client_secret: org.google_calendar_client_secret,
        redirect_uri: `${supabaseUrl}/functions/v1/google-calendar-callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();

    // Store credentials
    await supabase
      .from('google_calendar_credentials')
      .upsert({
        user_id: state,
        organization_id: profile.organization_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      }, {
        onConflict: 'user_id'
      });

    return new Response(
      `<html><body><script>window.opener.postMessage({type:'google_calendar_connected'}, '*'); window.close();</script><p>Успішно підключено! Ви можете закрити це вікно.</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Error in google-calendar-callback:', error);
    return new Response(
      `<html><body><p>Помилка: ${error instanceof Error ? error.message : 'Unknown error'}</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
});
