-- Додаємо колонку integration_id як FK до integrations
ALTER TABLE public.resources 
ADD COLUMN integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE;

-- Заповнюємо integration_id на основі існуючого поля integration (назва)
UPDATE public.resources r
SET integration_id = i.id
FROM public.integrations i
WHERE r.integration = i.name AND r.organization_id = i.organization_id;

-- Створюємо індекс для швидкого пошуку
CREATE INDEX idx_resources_integration_id ON public.resources(integration_id);

-- Додаємо NOT NULL constraint після заповнення даних
ALTER TABLE public.resources 
ALTER COLUMN integration_id SET NOT NULL;

-- Тепер можемо видалити стару колонку integration (назву) або залишити для backward compatibility
-- Для безпеки залишимо обидві колонки, але integration_id буде primary reference