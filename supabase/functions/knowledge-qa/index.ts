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
    const { question, userId, organizationId } = await req.json();

    const params = new URLSearchParams({
      question: String(question ?? ''),
      userId: String(userId ?? ''),
      organizationId: String(organizationId ?? ''),
    });

    const url = `https://documindsonline.app.n8n.cloud/webhook/94277c56-d3f1-4d6f-b143-26afefe0bcca?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N webhook error:', response.status, errorText);
      throw new Error(`N8N webhook failed: ${errorText}`);
    }

    const data = await response.json();
    console.log('N8N webhook response:', data);

    // Transform n8n response to expected format
    const formattedResponse = {
      answer: data.output || data.answer || 'Немає відповіді',
      sources: data.sources || [],
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(formattedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in knowledge-qa function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
