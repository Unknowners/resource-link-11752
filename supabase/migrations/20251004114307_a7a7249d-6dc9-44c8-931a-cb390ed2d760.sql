-- Додаємо поля для збереження реально виданих scopes та статусу
ALTER TABLE public.integration_credentials 
ADD COLUMN IF NOT EXISTS granted_scopes TEXT,
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS validation_error TEXT,
ADD COLUMN IF NOT EXISTS last_validated_at TIMESTAMP WITH TIME ZONE;

-- Створюємо enum для статусів (опціонально, для кращої типізації)
COMMENT ON COLUMN public.integration_credentials.connection_status IS 'pending, validated, error';
COMMENT ON COLUMN public.integration_credentials.granted_scopes IS 'Scopes які користувач реально надав';
COMMENT ON COLUMN public.integration_credentials.validation_error IS 'Помилка при валідації connection';
COMMENT ON COLUMN public.integration_credentials.last_validated_at IS 'Коли останній раз валідували';