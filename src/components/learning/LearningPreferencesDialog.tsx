import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";

interface LearningPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function LearningPreferencesDialog({ open, onOpenChange, onSaved }: LearningPreferencesDialogProps) {
  const [preferredTopics, setPreferredTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [learningPace, setLearningPace] = useState<string>("moderate");
  const [preferredDuration, setPreferredDuration] = useState<number>(20);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadPreferences();
    }
  }, [open]);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('learning_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        const prefs = data as any;
        setPreferredTopics(prefs.preferred_topics || []);
        setLearningPace(prefs.learning_pace || 'moderate');
        setPreferredDuration(prefs.preferred_duration || 20);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const addTopic = () => {
    if (topicInput.trim() && !preferredTopics.includes(topicInput.trim())) {
      setPreferredTopics([...preferredTopics, topicInput.trim()]);
      setTopicInput("");
    }
  };

  const removeTopic = (topic: string) => {
    setPreferredTopics(preferredTopics.filter(t => t !== topic));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Потрібна авторизація");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        toast.error("Організація не знайдена");
        return;
      }

      const { error } = await supabase
        .from('learning_preferences' as any)
        .upsert({
          user_id: user.id,
          organization_id: profile.organization_id,
          preferred_topics: preferredTopics,
          learning_pace: learningPace,
          preferred_duration: preferredDuration,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success("Налаштування збережено");
      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error("Помилка при збереженні налаштувань");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Налаштування навчання</DialogTitle>
          <DialogDescription>
            Вкажіть ваші переваги для персоналізованого навчання
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Topics */}
          <div className="space-y-3">
            <Label>Що ви хочете вивчити?</Label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                placeholder="Наприклад: Git, TypeScript, дизайн..."
                className="flex-1 px-3 py-2 border rounded-md bg-background"
              />
              <Button onClick={addTopic} type="button">Додати</Button>
            </div>
            {preferredTopics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {preferredTopics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="gap-1">
                    {topic}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeTopic(topic)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Learning Pace */}
          <div className="space-y-2">
            <Label htmlFor="pace">Темп навчання</Label>
            <Select value={learningPace} onValueChange={setLearningPace}>
              <SelectTrigger id="pace">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Повільний - більше часу на засвоєння</SelectItem>
                <SelectItem value="moderate">Помірний - збалансований підхід</SelectItem>
                <SelectItem value="fast">Швидкий - інтенсивне навчання</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Бажана тривалість одного модуля (хв)</Label>
            <Select 
              value={preferredDuration.toString()} 
              onValueChange={(v) => setPreferredDuration(Number(v))}
            >
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 хвилин - короткі сесії</SelectItem>
                <SelectItem value="20">20 хвилин - оптимально</SelectItem>
                <SelectItem value="30">30 хвилин - поглиблене вивчення</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Збереження..." : "Зберегти та згенерувати"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
