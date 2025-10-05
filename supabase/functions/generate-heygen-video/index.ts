import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, avatarId, voiceId, language } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const heygenApiKey = Deno.env.get('HEYGEN_API_KEY');
    if (!heygenApiKey) {
      throw new Error('HEYGEN_API_KEY is not configured');
    }

    // Resolve a valid voice_id (required by HeyGen)
    let resolvedVoiceId = voiceId as string | undefined;
    if (!resolvedVoiceId) {
      const endpoints = [
        'https://api.heygen.com/v2/voices',
        'https://api.heygen.com/v1/voices.list',
      ];
      let voices: any[] = [];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'GET',
            headers: { 'X-Api-Key': heygenApiKey, 'Accept': 'application/json' },
          });
          if (!res.ok) {
            const t = await res.text();
            console.warn('Voices endpoint failed', url, res.status, t);
            continue;
          }
          const json = await res.json();
          const list = Array.isArray(json?.voices)
            ? json.voices
            : Array.isArray(json?.data?.voices)
            ? json.data.voices
            : [];
          if (list.length) {
            voices = list;
            break;
          }
        } catch (e) {
          console.warn('Error fetching voices from', url, e);
        }
      }

      const langPref = String(language || '').toLowerCase();
      const pickByLang = (lang: string) => voices.find((v: any) => String(v.language || '').toLowerCase().includes(lang));
      resolvedVoiceId =
        (langPref && pickByLang(langPref))?.voice_id ||
        pickByLang('uk')?.voice_id ||
        pickByLang('en')?.voice_id ||
        voices[0]?.voice_id;

      if (!resolvedVoiceId) {
        throw new Error('Could not resolve HeyGen voice_id. Please verify your HeyGen API key and account permissions.');
      }
    }

    // Create video generation request
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': heygenApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: avatarId || 'Anna_public_3_20240108',
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: text,
            voice_id: resolvedVoiceId,
          },
        }],
        dimension: {
          width: 1280,
          height: 720,
        },
        aspect_ratio: '16:9',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen API error:', response.status, errorText);
      throw new Error(`HeyGen API failed: ${errorText}`);
    }

    const data = await response.json();
    console.log('HeyGen video generation initiated:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-heygen-video function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
