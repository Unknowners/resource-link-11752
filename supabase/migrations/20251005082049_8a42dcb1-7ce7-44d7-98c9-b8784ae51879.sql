-- Create table to persist per-user onboarding videos
CREATE TABLE IF NOT EXISTS public.onboarding_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  script TEXT,
  provider TEXT NOT NULL DEFAULT 'heygen',
  provider_video_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  video_url TEXT,
  thumbnail_url TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_onboarding_videos_user ON public.onboarding_videos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_videos_org ON public.onboarding_videos(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_videos_provider_id ON public.onboarding_videos(provider_video_id);

-- Enable RLS
ALTER TABLE public.onboarding_videos ENABLE ROW LEVEL SECURITY;

-- Policies: users can read their own; allow optional client-side inserts for their own rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_videos' AND policyname = 'Users can view their own onboarding videos'
  ) THEN
    CREATE POLICY "Users can view their own onboarding videos"
    ON public.onboarding_videos
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_videos' AND policyname = 'Users can insert their own onboarding videos'
  ) THEN
    CREATE POLICY "Users can insert their own onboarding videos"
    ON public.onboarding_videos
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_onboarding_videos_updated_at'
  ) THEN
    CREATE TRIGGER trg_onboarding_videos_updated_at
    BEFORE UPDATE ON public.onboarding_videos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;