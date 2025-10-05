import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/learning/CalendarView";
import { LearningPreferencesDialog } from "@/components/learning/LearningPreferencesDialog";
import { BookOpen, Clock, CheckCircle2, PlayCircle, Calendar, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Module {
  id: string;
  title: string;
  description?: string;
  duration: number;
  completed: boolean;
  category: string;
  difficulty?: string;
  resources?: any;
}

export default function SkillSmith() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const { data: modules, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setModules(modules || []);
    } catch (error) {
      console.error('Error loading modules:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити модулі навчання",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openPreferencesForGeneration = () => {
    setPreferencesOpen(true);
  };

  const generateModules = async () => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        toast({
          title: "Помилка",
          description: "Організація не знайдена",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-learning-modules', {
        body: {
          userId: user.id,
          organizationId: profile.organization_id,
        }
      });

      if (error) throw error;

      toast({
        title: "Успіх!",
        description: `Згенеровано ${data.count} персональних навчальних модулів`,
      });

      await loadModules();
    } catch (error) {
      console.error('Error generating modules:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося згенерувати модулі. Спробуйте пізніше.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const markAsCompleted = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from('learning_modules')
        .update({ 
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', moduleId);

      if (error) throw error;

      setModules(modules.map(m => 
        m.id === moduleId ? { ...m, completed: true } : m
      ));

      toast({
        title: "Вітаємо!",
        description: "Модуль позначено як завершений",
      });
    } catch (error) {
      console.error('Error updating module:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося оновити статус модуля",
        variant: "destructive",
      });
    }
  };

  const completedCount = modules.filter(m => m.completed).length;
  const progressPercent = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl mb-2">SkillSmith</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Персональне навчання та розвиток навичок на основі AI
          </p>
        </div>
        <Button 
          onClick={openPreferencesForGeneration}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Генерується...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Згенерувати модулі
            </>
          )}
        </Button>
      </div>

      <LearningPreferencesDialog 
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        onSaved={() => {
          setPreferencesOpen(false);
          generateModules();
        }}
      />

      <Tabs defaultValue="modules" className="w-full">
        <TabsList>
          <TabsTrigger value="modules">Модулі навчання</TabsTrigger>
          <TabsTrigger value="calendar">Календар</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6 mt-6">
          {modules.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Ваш прогрес</span>
                  <Badge variant="outline">{completedCount} / {modules.length}</Badge>
                </CardTitle>
                <CardDescription>Завершено модулів навчання</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progressPercent} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{Math.round(progressPercent)}% завершено</span>
                  <span>{modules.reduce((acc, m) => acc + m.duration, 0)} хв загальний час</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modules List */}
          {modules.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Немає навчальних модулів</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Натисніть кнопку "Згенерувати модулі", щоб AI створив персоналізовані<br />
                  навчальні матеріали на основі вашої посади та доступних ресурсів
                </p>
                <Button onClick={openPreferencesForGeneration} disabled={isGenerating}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Згенерувати модулі
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((module) => (
                <Card
                  key={module.id}
                  className={`border-2 hover:shadow-lg transition-shadow ${
                    module.completed ? "bg-secondary/30" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">{module.title}</CardTitle>
                        {module.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {module.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {module.category}
                          </Badge>
                          {module.difficulty && (
                            <Badge variant="secondary" className="text-xs">
                              {module.difficulty}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {module.duration} хв
                          </Badge>
                        </div>
                      </div>
                      {module.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <PlayCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        onClick={() => navigate(`/app/skillsmith/${module.id}`)}
                        className="w-full"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Переглянути матеріали
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      {!module.completed && (
                        <Button
                          onClick={() => markAsCompleted(module.id)}
                          className="w-full"
                          variant="outline"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Завершити
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* AI Info */}
          {modules.length > 0 && (
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Персоналізоване навчання на основі AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ці модулі були згенеровані спеціально для вас на основі вашої посади, 
                  доступних матеріалів організації та актуальних ресурсів з інтернету. 
                  Ви можете згенерувати нові модулі в будь-який час.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
