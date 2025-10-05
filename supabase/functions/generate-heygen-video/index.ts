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
    const { text, avatarId } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const heygenApiKey = Deno.env.get('HEYGEN_API_KEY');
    if (!heygenApiKey) {
      throw new Error('HEYGEN_API_KEY is not configured');
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
            voice_id: 'bf39d0e71bd54a42b08ae1c208fe0a0f', // Default Ukrainian voice
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
