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
    if (userPositions && userPositions.length > 0) {
      console.log('Position names:', userPositions.map((p: any) => p.positions?.name).join(', '));
    }

    // Get user's learning preferences
    const { data: preferences } = await supabase
      .from('learning_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('User preferences:', preferences ? 'Found' : 'Not found');
    if (preferences) {
      console.log('Preferred topics:', preferences.preferred_topics?.join(', ') || 'None');
      console.log('Learning pace:', preferences.learning_pace);
      console.log('Preferred duration:', preferences.preferred_duration);
    }

    // Get organization materials
    const { data: orgMaterials } = await supabase
      .from('onboarding_materials')
      .select('title, description, file_name')
      .eq('organization_id', organizationId);

    console.log('Organization materials:', orgMaterials?.length || 0);

    const systemPrompt = `Ти - AI асистент, який створює персоналізовані навчальні модулі для співробітників.

ВАЖЛИВО: Твоя відповідь має бути валідним JSON об'єктом з полем "modules" що містить масив модулів.

КРИТИЧНО ВАЖЛИВО ДЛЯ ПОСИЛАНЬ:
- ВСІ URL повинні бути РЕАЛЬНИМИ та РОБОЧИМИ посиланнями
- Для відео: використовуй ТІЛЬКИ справжні YouTube посилання (перевір, що вони існують)
- Для документації: використовуй ТІЛЬКИ реальні сайти (MDN, офіційна документація, Stack Overflow)
- НІКОЛИ не вигадуй внутрішні посилання типу "internal.organization.com"
- Якщо не знаєш реального посилання - краще НЕ додавай його взагалі
- Кожне посилання має бути перевірене і працююче

Кожен модуль повинен містити:
- title: назва модуля (максимум 100 символів)
- description: опис модуля (максимум 300 символів)
- duration: тривалість у хвилинах (НЕ більше 30 хвилин!)
- category: категорія (наприклад: "Технології", "Процеси", "Інструменти", "Soft skills")
- difficulty: рівень складності ("beginner", "intermediate", "advanced")
- content: структурований контент модуля з різними типами матеріалів
- resources: масив ресурсів з РЕАЛЬНИМИ посиланнями (name, url, type)

ФОРМАТ content повинен містити масив секцій, кожна секція - це об'єкт:
{
  "type": "text" | "video" | "quiz" | "practice" | "checklist",
  "title": "Назва секції",
  "content": "Вміст (для text - текст, для video - опис і посилання, для quiz - питання, для practice - завдання)",
  "duration": число хвилин на цю секцію,
  "url": "РЕАЛЬНЕ посилання на відео (для type: video)",
  "items": [] // для quiz (питання з варіантами відповідей), checklist (список пунктів), practice (кроки виконання)
}

Приклад структури content:
[
  {
    "type": "text",
    "title": "Вступ",
    "content": "Короткий огляд того, що ви вивчите...",
    "duration": 5
  },
  {
    "type": "video",
    "title": "Демонстрація інструменту",
    "content": "Відео демонстрація використання Git",
    "url": "https://www.youtube.com/watch?v=HVsySz-h9r4",
    "duration": 10
  },
  {
    "type": "quiz",
    "title": "Перевірка знань",
    "duration": 5,
    "content": "Перевірте свої знання з основ",
    "items": [
      {
        "question": "Що таке Git?",
        "options": ["Система контролю версій", "Мова програмування", "База даних"],
        "correct": 0
      }
    ]
  },
  {
    "type": "practice",
    "title": "Практичне завдання",
    "content": "Створіть свій перший Git репозиторій",
    "duration": 10,
    "items": [
      "Встановіть Git на свій комп'ютер",
      "Ініціалізуйте новий репозиторій",
      "Зробіть перший коміт"
    ]
  }
]

Створи 3-5 модулів тривалістю до ${preferences?.preferred_duration || 30} хвилин кожен.
Використовуй доступні матеріали організації та знайди корисні зовнішні ресурси.
Пам'ятай: кожен модуль має бути КОРОТКИМ і містити різноманітний контент.

ВАЖЛИВО: Враховуй наступну інформацію про користувача:
- Посади: ${userPositions?.map((p: any) => p.positions?.name || 'Не вказано').join(', ') || 'Не вказано (створи загальні модулі)'}
- Теми для вивчення: ${preferences?.preferred_topics?.join(', ') || 'Не вказано (обирай актуальні для посади)'}
- Темп навчання: ${preferences?.learning_pace || 'moderate'}
- Бажана тривалість модуля: ${preferences?.preferred_duration || 30} хв
- Доступні матеріали організації: ${orgMaterials?.map((m: any) => m.title).join(', ') || 'Немає'}

Якщо посада НЕ вказана - створюй загальні модулі з soft skills, продуктивності, комунікації.
Якщо є посада - створюй модулі що поєднують загальні навички + специфічні для посади.`;

    const userPrompt = `Створи персоналізовані навчальні модулі для цього користувача.
Кожен модуль має містити структурований контент (текст, відео, квізи, практичні завдання).

${preferences?.preferred_topics && Array.isArray(preferences.preferred_topics) && preferences.preferred_topics.length > 0 ? `
🎯 ПРІОРИТЕТ: Користувач ОБОВ'ЯЗКОВО хоче вивчити ці теми: ${preferences.preferred_topics.join(', ')}
Всі модулі повинні бути про ці теми або тісно з ними пов'язані!
` : ''}

${userPositions && userPositions.length > 0 ? `
💼 ВАЖЛИВА ІНФОРМАЦІЯ: Посада користувача: ${userPositions.map((p: any) => p.positions?.name).join(', ')}
Модулі мають бути адаптовані під специфіку цієї посади та включати практичні навички для неї.
` : 'Створи універсальні модулі для розвитку soft skills'}

КРИТИЧНО ВАЖЛИВІ ПРАВИЛА ДЛЯ ПОСИЛАНЬ:
1. ВСІ URL мають бути РЕАЛЬНИМИ та РОБОЧИМИ
2. Для відео: ТІЛЬКИ існуючі YouTube відео (youtube.com/watch?v=...)
3. Для документації: ТІЛЬКИ відомі сайти (developer.mozilla.org, docs.microsoft.com, github.com/docs)
4. ЗАБОРОНЕНО генерувати внутрішні посилання (internal.*, intranet.*, *.organization.com)
5. Якщо не знаєш реального посилання - НЕ додавай ресурс взагалі
6. resources масив може бути ПОРОЖНІМ, якщо немає перевірених посилань

Формат відповіді:
{
  "modules": [
    {
      "title": "...",
      "description": "...",
      "duration": 25,
      "category": "...",
      "difficulty": "beginner",
      "content": [...],
      "resources": [...]
    }
  ]
}`;

    console.log('Calling Lovable AI...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI Response received');
    
    const generatedContent = aiResponse.choices[0].message.content;
    let modulesData;
    
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = generatedContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       generatedContent.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, generatedContent];
      
      const jsonContent = jsonMatch[1] || generatedContent;
      const parsed = JSON.parse(jsonContent.trim());
      modulesData = parsed.modules || parsed;
      
      if (!Array.isArray(modulesData)) {
        throw new Error('Generated content is not an array');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', generatedContent);
      throw new Error('Invalid AI response format');
    }

    // Save modules to database
    const modulesToInsert = modulesData.map((module: any) => {
      // Фільтруємо ресурси - видаляємо вигадані внутрішні посилання
      const validResources = (module.resources || []).filter((resource: any) => {
        if (!resource.url) return false;
        // Видаляємо вигадані внутрішні посилання
        if (resource.url.includes('internal.') || 
            resource.url.includes('intranet.') ||
            resource.url.includes('organization.com')) {
          console.log('Filtered out fake internal URL:', resource.url);
          return false;
        }
        // Залишаємо тільки реальні домени
        return resource.url.startsWith('http://') || resource.url.startsWith('https://');
      });

      return {
        organization_id: organizationId,
        user_id: userId,
        position_id: userPositions?.[0]?.position_id || null,
        title: module.title,
        description: module.description,
        duration: module.duration,
        category: module.category,
        difficulty: module.difficulty,
        content: module.content || [],
        resources: validResources,
        completed: false,
      };
    });

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
