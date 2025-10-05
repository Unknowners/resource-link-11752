-- Insert fun test ideas for Team Memory
-- This will insert ideas for existing organizations and users

DO $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
  v_project_id UUID;
BEGIN
  -- Get the first organization and user
  SELECT id INTO v_org_id FROM public.organizations LIMIT 1;
  SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
  SELECT id INTO v_project_id FROM public.projects WHERE organization_id = v_org_id LIMIT 1;

  -- Insert creative and funny ideas
  INSERT INTO public.team_ideas (organization_id, user_id, title, content, status, karma, comments, archived, project_id) VALUES
  
  -- AI і Tech ідеї
  (v_org_id, v_user_id, '🤖 AI-асистент для кави', 'Створити AI, що запам''ятовує як кожен в офісі п''є каву і автоматично замовляє з кав''ярні. Бонус: може передбачити коли буде важкий день і замовити подвійне еспресо!', 'active', 15, '[]'::jsonb, false, v_project_id),
  
  (v_org_id, v_user_id, '🎮 Геймифікація код-рев''ю', 'Додати систему досягнень за код-рев''ю: "Знайшов 100 багів", "Найввічливіший коментатор", "Ніндзя рефакторингу". З лідербордом і віртуальними нагородами!', 'active', 23, '[]'::jsonb, false, v_project_id),
  
  (v_org_id, v_user_id, '🌮 Slack-бот для обідів', 'Бот, що щодня о 12:00 пропонує випадкове місце для обіду. Якщо вся команда погоджується - всі отримують віртуальні смайлики тако!', 'active', 18, '[]'::jsonb, false, null),
  
  -- Креативні бізнес-ідеї
  (v_org_id, v_user_id, '💼 Зустрічі у ВР', 'Проводити планерки у віртуальній реальності. Можна зустрічатись на Марсі, в джунглях або на пляжі. Нудна зустріч? Просто телепортуйся!', 'active', 12, '[]'::jsonb, false, null),
  
  (v_org_id, v_user_id, '🎨 AI генератор мемів', 'Інтегрувати AI, що створює меми про наші проєкти. Автоматично постить у Slack коли хтось пушить в пятницю ввечері.', 'active', 31, '[]'::jsonb, false, v_project_id),
  
  (v_org_id, v_user_id, '🚀 Космічна тематика офісу', 'Перейменувати всі переговорки на назви планет. Кімнати відпочинку - на назви галактик. Дрес-код по п''ятницях - космонавти!', 'active', 8, '[]'::jsonb, false, null),
  
  -- Прикольні офісні фішки
  (v_org_id, v_user_id, '🎵 Музичні теми для релізів', 'Кожен реліз супроводжується епічною музикою. Мажорний реліз = Бетховен. Хотфікс = Бенні Хілл тема.', 'active', 19, '[]'::jsonb, false, v_project_id),
  
  (v_org_id, v_user_id, '🏆 Кубок за найкращий коміт', 'Щотижня голосування за найсмішніший/найкреативніший коміт месседж. Переможець отримує золотий кубок (віртуальний, але дуже престижний).', 'active', 27, '[]'::jsonb, false, null),
  
  (v_org_id, v_user_id, '🌿 Рослини-талісмани', 'Кожній команді - своя рослина-талісман. Треба доглядати за нею. Чия рослина краща - та команда вибирає де буде тімбілдінг!', 'active', 14, '[]'::jsonb, false, null),
  
  -- Жарти та веселі ідеї
  (v_org_id, v_user_id, '😂 Бот "Розробник-оракул"', 'Бот, що передбачає долю коду: "Цей PR буде мерджитись 3 дні", "В цьому коді сховано 5 багів", "Ця функція проживе до наступного рефакторингу"', 'active', 42, '[]'::jsonb, false, v_project_id),
  
  (v_org_id, v_user_id, '🎪 П''ятничний цирк коду', 'Кожної п''ятниці - шоу старого коду. Переглядаємо найсмішніші коментарі, найстрашніші функції, найдовші іфи. З попкорном!', 'active', 35, '[]'::jsonb, false, null),
  
  (v_org_id, v_user_id, '🦸 Супергерої офісу', 'Кожен тиждень хтось стає "Супергероєм тижня" і має суперсилу: може скасувати будь-яку зустріч або змусити всіх принести пончики.', 'active', 21, '[]'::jsonb, false, null),
  
  -- Продуктивність і welfare
  (v_org_id, v_user_id, '🧘 Meditation mode в Slack', 'Режим медитації - всі нотифікації вимкнено, статус "🧘 У нірвані". Ніхто не може турбувати. Мінімум 30 хвилин на день.', 'active', 16, '[]'::jsonb, false, null),
  
  (v_org_id, v_user_id, '🎯 Рандомайзер завдань', 'Іноді обмінюємось завданнями випадково. Frontend dev робить backend, дизайнер - тести. Веселощі гарантовано!', 'active', 9, '[]'::jsonb, false, v_project_id),
  
  (v_org_id, v_user_id, '🍕 Pizza-driven development', 'За кожні 100 закритих тасків - піца для команди. За 1000 - піца-вечірка з караоке. Мотивація 100%!', 'active', 38, '[]'::jsonb, false, null),
  
  -- Футуристичні ідеї
  (v_org_id, v_user_id, '🔮 Квантовий таск-трекер', 'Таска існує одночасно в стані "зроблено" і "не зроблено" до моменту перевірки PM. Шредінгер би оцінив!', 'active', 11, '[]'::jsonb, false, v_project_id),
  
  (v_org_id, v_user_id, '🌈 Офіс у метавсесвіті', 'Купити віртуальний офіс у метавсесвіті. Проводити там зустрічі. Бонус: можна телепортуватись без трафіку!', 'active', 7, '[]'::jsonb, false, null),
  
  (v_org_id, v_user_id, '🎨 AI Artist-in-Residence', 'AI, що малює портрети команди в стилі різних епох. Сьогодні ми Ренесанс, завтра - кіберпанк!', 'active', 25, '[]'::jsonb, false, v_project_id),
  
  -- Дурнуваті але веселі
  (v_org_id, v_user_id, '🦆 Гумова качка для дебагу', 'Офіційна корпоративна гумова качка для rubber duck debugging. З іменем, посадою та правом голосу на планерках!', 'active', 44, '[]'::jsonb, false, null),
  
  (v_org_id, v_user_id, '🎭 Рольові ігри в коді', 'Кожен коміт пишемо від імені персонажа: "Gandalf pushed 3 commits", "Sherlock fixed the mystery bug", "Darth Vader refactored the dark side"', 'active', 29, '[]'::jsonb, false, v_project_id);

  RAISE NOTICE 'Successfully inserted 20 fun test ideas!';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not insert test data: %', SQLERRM;
END $$;