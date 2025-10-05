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
    const { userId, organizationId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's position(s)
    const { data: userPositions } = await supabase
      .from('user_positions')
      .select('position_id, positions(name, description)')
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    console.log('User positions:', userPositions?.length || 0);

    // Get organization materials
    const { data: materials } = await supabase
      .from('onboarding_materials')
      .select('title, description, file_name')
      .eq('organization_id', organizationId);

    console.log('Organization materials:', materials?.length || 0);

    // Build context for AI
    const positionsContext = userPositions?.map((up: any) => {
      const position = Array.isArray(up.positions) ? up.positions[0] : up.positions;
      return `Посада: ${position?.name || 'Не вказано'}\nОпис: ${position?.description || 'Не вказано'}`;
    }).join('\n\n') || 'Посада не вказана';

    const materialsContext = materials?.map(m =>
      `- ${m.title}: ${m.description || m.file_name}`
    ).join('\n') || 'Немає доступних матеріалів';

    const systemPrompt = `Ти - експерт з корпоративного навчання. Створи персоналізовані навчальні модулі для співробітника на основі:

ПОСАДИ КОРИСТУВАЧА:
${positionsContext}

ДОСТУПНІ МАТЕРІАЛИ ОРГАНІЗАЦІЇ:
${materialsContext}

ІНСТРУКЦІЇ:
1. Створи 4-6 релевантних навчальних модулів
2. Враховуй посаду користувача та наявні матеріали
3. Додай модулі з зовнішніх джерел (інтернет ресурси) які будуть корисні
4. Кожен модуль має містити: title, description, category, duration (хвилини), difficulty (beginner/intermediate/advanced)
5. Додай resources з посиланнями на матеріали (як внутрішні так і зовнішні)

Відповідай ТІЛЬКИ валідним JSON масивом об'єктів без додаткового тексту.`;

    const userPrompt = `Згенеруй навчальні модулі для цього користувача. Формат відповіді:
[
  {
    "title": "Назва модуля",
    "description": "Детальний опис що вивчить користувач",
    "category": "Категорія (наприклад: Інструменти, Розробка, Процеси, Безпека)",
    "duration": 30,
    "difficulty": "beginner",
    "resources": [
      {"name": "Назва ресурсу", "url": "https://...", "type": "internal/external"}
    ]
  }
]`;

    console.log('Calling Lovable AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;
    
    console.log('AI Response received');

    // Parse JSON from AI response
    const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }

    const modules = JSON.parse(jsonMatch[0]);

    // Save modules to database
    const modulesToInsert = modules.map((module: any) => ({
      organization_id: organizationId,
      user_id: userId,
      position_id: userPositions?.[0]?.position_id || null,
      title: module.title,
      description: module.description,
      duration: module.duration,
      category: module.category,
      difficulty: module.difficulty,
      resources: module.resources,
      completed: false,
    }));

    const { data: insertedModules, error: insertError } = await supabase
      .from('learning_modules')
      .insert(modulesToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting modules:', insertError);
      throw insertError;
    }

    console.log('Generated and saved modules:', insertedModules?.length || 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        modules: insertedModules,
        count: insertedModules?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-learning-modules:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
