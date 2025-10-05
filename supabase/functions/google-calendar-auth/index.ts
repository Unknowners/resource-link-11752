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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, userId, code, organizationId } = await req.json();

    if (action === 'get_auth_url') {
      // Get OAuth credentials from organization settings
      const { data: org } = await supabase
        .from('organizations')
        .select('google_calendar_client_id')
        .eq('id', organizationId)
        .single();

      if (!org?.google_calendar_client_id) {
        return new Response(
          JSON.stringify({ error: 'Google Calendar не налаштовано для організації' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const redirectUri = `${supabaseUrl}/functions/v1/google-calendar-callback`;
      const scope = 'https://www.googleapis.com/auth/calendar.events';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${org.google_calendar_client_id}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `state=${userId}`;

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'sync_events') {
      // Get user's Google Calendar credentials
      const { data: creds } = await supabase
        .from('google_calendar_credentials')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!creds || !creds.access_token) {
        return new Response(
          JSON.stringify({ error: 'Не підключено Google Calendar' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user's scheduled sessions
      const { data: sessions } = await supabase
        .from('learning_schedule')
        .select(`
          *,
          learning_modules (
            title,
            description,
            category
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'scheduled')
        .gte('scheduled_date', new Date().toISOString().split('T')[0]);

      if (!sessions || sessions.length === 0) {
        return new Response(
          JSON.stringify({ message: 'Немає запланованих сесій' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Sync each session to Google Calendar
      const results = [];
      for (const session of sessions) {
        const startDateTime = `${session.scheduled_date}T${session.scheduled_time || '09:00'}:00`;
        const endDateTime = new Date(
          new Date(startDateTime).getTime() + session.duration * 60000
        ).toISOString();

        const event = {
          summary: session.learning_modules.title,
          description: `${session.learning_modules.description || ''}\n\nКатегорія: ${session.learning_modules.category}`,
          start: {
            dateTime: startDateTime,
            timeZone: 'Europe/Kiev',
          },
          end: {
            dateTime: endDateTime,
            timeZone: 'Europe/Kiev',
          },
          reminders: {
            useDefault: false,
            overrides: session.reminder_enabled ? [
              { method: 'popup', minutes: 30 }
            ] : [],
          },
        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${creds.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });

        if (!response.ok) {
          console.error('Failed to create event:', await response.text());
          continue;
        }

        const createdEvent = await response.json();
        results.push({ sessionId: session.id, eventId: createdEvent.id });

        // Store the Google Calendar event ID
        await supabase
          .from('learning_schedule')
          .update({ google_calendar_event_id: createdEvent.id })
          .eq('id', session.id);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          synced: results.length,
          total: sessions.length 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-calendar-auth:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
