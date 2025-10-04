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
    const { question, userId } = await req.json();
    
    if (!question || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ error: 'User not found in organization' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch available resources for the user's organization
    const { data: resources } = await supabase
      .from('resources')
      .select('id, name, type, integration, url')
      .eq('organization_id', membership.organization_id)
      .eq('status', 'active')
      .limit(10);

    // Build context from resources
    const context = resources?.map(r => 
      `[${r.integration}] ${r.name} (${r.type})${r.url ? `: ${r.url}` : ''}`
    ).join('\n') || 'Немає доступних ресурсів.';

    console.log('Question:', question);
    console.log('Context resources:', resources?.length || 0);

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Ти - AI-асистент для корпоративної бази знань. Твоє завдання - відповідати на питання співробітників на основі доступних ресурсів.

ВАЖЛИВІ ПРАВИЛА:
1. Завжди вказуй ДЖЕРЕЛА інформації з контексту (назву ресурсу та тип)
2. Оцінюй РІВЕНЬ ВПЕВНЕНОСТІ (висока/середня/низька) у своїй відповіді
3. Якщо інформації недостатньо - чесно кажи "не знаю" та підказуй, де шукати далі
4. Використовуй ЦИТАТИ з контексту, коли це можливо
5. Відповідай українською мовою
6. Будь конкретним та структурованим

ФОРМАТ ВІДПОВІДІ:
**Відповідь:** [твоя відповідь]

**Джерела:**
- [Назва ресурсу] ([тип])

**Рівень впевненості:** [висока/середня/низька]

**Додаткові рекомендації:** [якщо є]

Доступні ресурси:
${context}`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Перевищено ліміт запитів. Спробуйте пізніше.',
            retryAfter: 60
          }), 
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Недостатньо кредитів для AI запитів.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices[0].message.content;

    console.log('AI Response generated successfully');

    // Parse the response to extract sources and confidence
    const response = {
      answer,
      sources: resources || [],
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in knowledge-qa function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
