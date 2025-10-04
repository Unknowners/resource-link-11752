-- Додаємо тип аутентифікації
ALTER TABLE public.integrations 
ADD COLUMN IF NOT EXISTS auth_type TEXT DEFAULT 'oauth',
ADD COLUMN IF NOT EXISTS api_token TEXT,
ADD COLUMN IF NOT EXISTS api_email TEXT;

COMMENT ON COLUMN public.integrations.auth_type IS 'oauth or api_token';
COMMENT ON COLUMN public.integrations.api_token IS 'API token для Basic Auth';
COMMENT ON COLUMN public.integrations.api_email IS 'Email для Basic Auth з API token';