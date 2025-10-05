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
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      setLoading(true);
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

      if (template) {
        // Replace variables in template
        let script = template.script_template;
        script = script.replace(/\{first_name\}/g, profile.first_name || '');
        script = script.replace(/\{last_name\}/g, profile.last_name || '');
        script = script.replace(/\{company\}/g, profile.company || '');
        
        setScriptText(script);
      } else {
        // Default message if no template
        setScriptText(`Вітаємо, ${profile.first_name || 'користувач'}! Ласкаво просимо до нашої команди.`);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error("Помилка завантаження шаблону");
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    if (!scriptText.trim()) {
      toast.error("Текст для відео відсутній");
      return;
    }

    setVideoGenerating(true);
    setVideoUrl(null);
    setCurrentVideoId(null);

    try {
      console.log('Calling generate-heygen-video with text:', scriptText);
      const { data, error } = await supabase.functions.invoke('generate-heygen-video', {
        body: { text: scriptText, language: 'uk' }
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

  const checkVideoStatus = async (videoId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-heygen-video', {
        body: { videoId }
      });

      if (error) throw error;

      const raw: any = data;
      const status = (raw?.status ?? raw?.data?.status ?? raw?.data?.video?.status ?? raw?.data?.task?.status)?.toString().toLowerCase();
      const url =
        raw?.video_url ??
        raw?.data?.video_url ??
        raw?.data?.video?.url ??
        raw?.data?.output_url ??
        raw?.data?.result_url ??
        raw?.data?.download_url;

      console.log('HeyGen status:', status, 'url:', url, 'response:', raw);

      if (['completed', 'done', 'succeeded', 'finished', 'success'].includes(status)) {
        if (url) {
          setVideoUrl(url);
          setVideoGenerating(false);
          toast.success("Відео готове!");
        } else {
          setTimeout(() => checkVideoStatus(videoId), 4000);
        }
      } else if (!status || ['processing', 'pending', 'queued', 'in_progress', 'generating', 'started', 'draft', 'synthesizing', 'waiting'].includes(status)) {
        // "waiting" is a valid status from HeyGen
        setTimeout(() => checkVideoStatus(videoId), 5000);
      } else if (['failed', 'error', 'canceled', 'cancelled'].includes(status)) {
        throw new Error('Video generation failed');
      } else {
        // Unknown status - continue polling
        console.warn('Unknown HeyGen status:', status);
        setTimeout(() => checkVideoStatus(videoId), 6000);
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
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h2 className="font-display text-2xl">Вітальне відео</h2>
              <p className="text-muted-foreground">
                Згенеруйте персоналізоване відео-привітання з AI-аватаром
              </p>
            </div>

            {scriptText && (
              <Card className="p-4 bg-secondary/50">
                <p className="text-sm font-medium mb-2">Текст відео:</p>
                <p className="text-sm text-muted-foreground">{scriptText}</p>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                onClick={generateVideo}
                disabled={videoGenerating || !scriptText.trim()}
                className="flex-1 h-12"
                size="lg"
              >
                {videoGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Генерується відео...
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5 mr-2" />
                    Згенерувати відео
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-12"
                onClick={loadTemplate}
                disabled={loading}
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>

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
