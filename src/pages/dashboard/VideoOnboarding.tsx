import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function VideoOnboarding() {
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [scriptText, setScriptText] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingVideo();
  }, []);

  const checkExistingVideo = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if video already exists
      const { data: existingVideo } = await supabase
        .from('onboarding_videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingVideo?.status === 'completed' && existingVideo?.video_url) {
        // Video is ready - display it
        setVideoUrl(existingVideo.video_url);
        setVideoGenerating(false);
        setLoading(false);
      } else if (existingVideo?.status === 'processing' && existingVideo?.provider_video_id) {
        // Video is being generated - continue polling
        setVideoGenerating(true);
        setCurrentVideoId(existingVideo.provider_video_id);
        setLoading(false);
        checkVideoStatus(existingVideo.provider_video_id);
      } else {
        // No video or failed - start generation
        await startVideoGeneration();
      }
    } catch (error) {
      console.error('Error checking video:', error);
      toast.error("Помилка перевірки відео");
      setLoading(false);
    }
  };

  const startVideoGeneration = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, company, organization_id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.organization_id) {
        toast.error("Організація не знайдена");
        return;
      }

      // Get active template
      const { data: template } = await supabase
        .from('onboarding_templates')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .maybeSingle();

      let script = '';
      if (template) {
        script = template.script_template;
        script = script.replace(/\{first_name\}/g, profile.first_name || '');
        script = script.replace(/\{last_name\}/g, profile.last_name || '');
        script = script.replace(/\{company\}/g, profile.company || '');
      } else {
        script = `Вітаємо, ${profile.first_name || 'користувач'}! Ласкаво просимо до нашої команди.`;
      }

      setScriptText(script);
      setLoading(false);
      
      // Start generation
      await generateVideo(script, profile.organization_id);
    } catch (error) {
      console.error('Error starting generation:', error);
      toast.error("Помилка запуску генерації");
      setLoading(false);
    }
  };

  const generateVideo = async (text: string, organizationId: string) => {
    setVideoGenerating(true);
    setVideoUrl(null);
    setCurrentVideoId(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Calling generate-heygen-video with text:', text);
      const { data, error } = await supabase.functions.invoke('generate-heygen-video', {
        body: { text, language: 'uk' }
      });

      console.log('HeyGen generation response:', { data, error });

      if (error) {
        console.error('HeyGen error:', error);
        throw error;
      }

      const videoId =
        (data && (data as any).video_id) ??
        (data && (data as any).data?.video_id);

      if (videoId) {
        // Save to database
        await supabase
          .from('onboarding_videos')
          .insert({
            user_id: user.id,
            organization_id: organizationId,
            provider_video_id: videoId,
            provider: 'heygen',
            script: text,
            status: 'processing'
          });

        setCurrentVideoId(videoId);
        toast.success("Відео генерується, зачекайте...");
        checkVideoStatus(videoId);
      } else {
        console.warn("Unexpected HeyGen response (no video_id):", data);
        throw new Error("Не вдалося отримати ідентифікатор відео");
      }
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error("Помилка генерації відео");
      setVideoGenerating(false);
    }
  };

  const checkVideoStatus = async (videoId: string, attemptCount = 0) => {
    const MAX_ATTEMPTS = 60; // 5 минут максимум (60 * 5 секунд)
    
    try {
      if (attemptCount >= MAX_ATTEMPTS) {
        toast.error("Час очікування відео минув. Спробуйте ще раз або зверніться до підтримки.");
        setVideoGenerating(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-heygen-video', {
        body: { videoId }
      });

      if (error) throw error;

      const raw: any = data;
      const status = (raw?.status ?? raw?.data?.status ?? raw?.data?.video?.status ?? raw?.data?.task?.status)?.toString().toLowerCase();
      const errorData = raw?.error ?? raw?.data?.error;
      const url =
        raw?.video_url ??
        raw?.data?.video_url ??
        raw?.data?.video?.url ??
        raw?.data?.output_url ??
        raw?.data?.result_url ??
        raw?.data?.download_url;

      console.log(`HeyGen check #${attemptCount + 1}:`, { status, url, error: errorData });

      if (['completed', 'done', 'succeeded', 'finished', 'success'].includes(status)) {
        if (url) {
          // Update database
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('onboarding_videos')
              .update({
                status: 'completed',
                video_url: url
              })
              .eq('provider_video_id', videoId)
              .eq('user_id', user.id);
          }
          
          setVideoUrl(url);
          setVideoGenerating(false);
          toast.success("Відео готове!");
        } else {
          setTimeout(() => checkVideoStatus(videoId, attemptCount + 1), 4000);
        }
      } else if (['failed', 'error', 'canceled', 'cancelled'].includes(status)) {
        const errorMsg = errorData?.message || errorData?.detail || 'Генерація відео не вдалася';
        console.error('HeyGen generation failed:', errorData);
        toast.error(`Помилка генерації: ${errorMsg}`);
        setVideoGenerating(false);
      } else if (!status || ['processing', 'pending', 'queued', 'in_progress', 'generating', 'started', 'draft', 'synthesizing', 'waiting'].includes(status)) {
        // Continue polling
        setTimeout(() => checkVideoStatus(videoId, attemptCount + 1), 5000);
      } else {
        // Unknown status - continue polling but log warning
        console.warn('Unknown HeyGen status:', status);
        setTimeout(() => checkVideoStatus(videoId, attemptCount + 1), 6000);
      }
    } catch (error) {
      console.error('Error checking video status:', error);
      toast.error("Помилка перевірки статусу відео");
      setVideoGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Video className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl">Відео онбординг</h1>
            <p className="text-muted-foreground text-sm">
              Ваше персональне вітальне відео
            </p>
          </div>
        </div>
      </div>

      <Card className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {videoGenerating && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <div>
                  <h2 className="font-display text-2xl mb-2">Генерація відео</h2>
                  <p className="text-muted-foreground">
                    Ваше персоналізоване вітальне відео створюється...<br />
                    Це може зайняти кілька хвилин.
                  </p>
                </div>
              </div>
            )}

            {videoUrl && (
              <Card className="p-4 space-y-3 border-2 border-primary/20">
                <h3 className="font-semibold text-lg">Ваше відео готове!</h3>
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg"
                  autoPlay
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(videoUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Відкрити у новій вкладці
                </Button>
              </Card>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
