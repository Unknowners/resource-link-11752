-- Додаємо статус до ресурсів
ALTER TABLE public.resources 
ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'removed'));

-- Додаємо індекс для швидкого пошуку
CREATE INDEX idx_resources_status ON public.resources(status);

-- Додаємо поле для відстеження останньої синхронізації
ALTER TABLE public.resources
ADD COLUMN last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now();

COMMENT ON COLUMN public.resources.status IS 'active - ресурс доступний, inactive - тимчасово недоступний, removed - видалений з інтеграції';
COMMENT ON COLUMN public.resources.last_synced_at IS 'Час останньої успішної синхронізації ресурсу';