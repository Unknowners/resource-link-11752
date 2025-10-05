import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScheduleDialog } from "@/components/learning/ScheduleDialog";
import { ArrowLeft, BookOpen, Clock, ExternalLink, FileText, CheckCircle2, Video, ClipboardList, Brain, Calendar } from "lucide-react";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface ContentSection {
  type: 'text' | 'video' | 'quiz' | 'practice' | 'checklist';
  title: string;
  content: string;
  duration?: number;
  url?: string;
  items?: QuizQuestion[] | string[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  difficulty: string;
  content: ContentSection[] | any;
  resources: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  completed: boolean;
  completed_at: string | null;
}

export default function ModuleDetail() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  useEffect(() => {
    loadModule();
    checkQuizStatus();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("id", moduleId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      
      // Parse resources from JSONB
      const moduleData = {
        ...data,
        resources: Array.isArray(data.resources) ? data.resources as Array<{name: string; url: string; type: string}> : []
      };
      
      setModule(moduleData as unknown as Module);
    } catch (error) {
      console.error("Error loading module:", error);
      toast.error("Не вдалося завантажити модуль");
    } finally {
      setIsLoading(false);
    }
  };

  const checkQuizStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !moduleId) return;

      const { data: quizResult } = await supabase
        .from("quiz_results")
        .select("score, total_questions, passed")
        .eq("user_id", user.id)
        .eq("module_id", moduleId)
        .maybeSingle();

      if (quizResult) {
        setQuizSubmitted(true);
        setQuizScore(quizResult.score);
      }
    } catch (error) {
      console.error("Error checking quiz status:", error);
    }
  };

  const getFinalQuiz = (): ContentSection | null => {
    if (!module?.content || !Array.isArray(module.content)) return null;
    const quizSections = module.content.filter(s => s.type === 'quiz');
    return quizSections.length > 0 ? quizSections[quizSections.length - 1] : null;
  };

  const submitQuiz = async () => {
    const finalQuiz = getFinalQuiz();
    if (!finalQuiz || !finalQuiz.items) {
      toast.error("Квіз не знайдено");
      return;
    }

    const questions = finalQuiz.items as QuizQuestion[];
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) {
        correctCount++;
      }
    });

    const passed = correctCount >= Math.ceil(questions.length * 0.7); // 70% to pass

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !module) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const { error } = await supabase
        .from("quiz_results")
        .upsert({
          user_id: user.id,
          module_id: module.id,
          organization_id: profile.organization_id,
          answers: quizAnswers,
          score: correctCount,
          total_questions: questions.length,
          passed: passed,
        }, {
          onConflict: 'user_id,module_id'
        });

      if (error) throw error;

      setQuizSubmitted(true);
      setQuizScore(correctCount);

      if (passed) {
        toast.success(`Вітаємо! Ви пройшли квіз (${correctCount}/${questions.length})`);
        // Auto-complete module if quiz passed
        markAsCompleted();
      } else {
        toast.error(`Недостатньо балів (${correctCount}/${questions.length}). Потрібно мінімум ${Math.ceil(questions.length * 0.7)}`);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Помилка при збереженні результатів");
    }
  };

  const markAsCompleted = async () => {
    if (!module) return;

    // Check if quiz passed
    if (!quizSubmitted || quizScore === null) {
      toast.error("Спершу необхідно пройти фінальний квіз!");
      return;
    }

    try {
      const { error } = await supabase
        .from("learning_modules")
        .update({ 
          completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq("id", module.id);

      if (error) throw error;

      toast.success("Модуль позначено як завершений!");
      setModule({ ...module, completed: true, completed_at: new Date().toISOString() });
    } catch (error) {
      console.error("Error marking module as completed:", error);
      toast.error("Помилка при оновленні статусу");
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'quiz': return <Brain className="h-4 w-4" />;
      case 'practice': return <ClipboardList className="h-4 w-4" />;
      case 'checklist': return <CheckCircle2 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Модуль не знайдено</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/app/skillsmith")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад до списку модулів
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{module.category}</Badge>
                <Badge variant="outline">{module.difficulty}</Badge>
                {module.completed && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Завершено
                  </Badge>
                )}
              </div>
              <CardTitle className="text-3xl mb-2">{module.title}</CardTitle>
              <CardDescription className="text-base">
                {module.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{module.duration} хв</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{module.resources?.length || 0} матеріалів</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator />

          {/* Learning Content */}
          {module.content && Array.isArray(module.content) && module.content.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Навчальний контент
              </h3>
              <Accordion type="single" collapsible className="w-full">
                {module.content.map((section: ContentSection, index: number) => (
                  <AccordionItem key={index} value={`section-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        {getSectionIcon(section.type)}
                        <div className="text-left">
                          <div className="font-medium">{section.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {section.type === 'video' && 'Відео'}
                            {section.type === 'quiz' && 'Тест'}
                            {section.type === 'practice' && 'Практика'}
                            {section.type === 'checklist' && 'Чекліст'}
                            {section.type === 'text' && 'Текст'}
                            {section.duration && ` • ${section.duration} хв`}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4 space-y-3">
                        <p className="text-sm text-muted-foreground">{section.content}</p>
                        
                        {section.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(section.url, "_blank")}
                            className="w-full sm:w-auto"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Відкрити відео
                          </Button>
                        )}
                        
                        {section.items && section.items.length > 0 && (
                          <div className="space-y-2">
                            {section.type === 'quiz' && (
                              <div className="space-y-3">
                                {(section.items as QuizQuestion[]).map((item, idx) => (
                                  <Card key={idx} className="p-4">
                                    <p className="font-medium text-sm mb-3">{item.question}</p>
                                    <div className="space-y-2">
                                      {item.options?.map((option: string, optIdx: number) => {
                                        const isSelected = quizAnswers[idx] === optIdx;
                                        const isCorrect = item.correct === optIdx;
                                        const showResult = quizSubmitted;

                                        return (
                                          <div
                                            key={optIdx}
                                            onClick={() => !quizSubmitted && setQuizAnswers({...quizAnswers, [idx]: optIdx})}
                                            className={`text-sm p-3 rounded cursor-pointer transition-colors ${
                                              isSelected ? 'bg-primary/20 border-2 border-primary' : 
                                              'border-2 border-transparent hover:bg-accent/50'
                                            } ${
                                              showResult && isCorrect ? 'bg-green-500/20 border-green-500' :
                                              showResult && isSelected && !isCorrect ? 'bg-red-500/20 border-red-500' :
                                              ''
                                            }`}
                                          >
                                            {option}
                                            {showResult && isCorrect && <span className="ml-2">✓</span>}
                                            {showResult && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </Card>
                                ))}
                                {!quizSubmitted && (
                                  <Button 
                                    onClick={submitQuiz}
                                    disabled={Object.keys(quizAnswers).length < (section.items as QuizQuestion[]).length}
                                    className="w-full mt-4"
                                  >
                                    Відправити відповіді
                                  </Button>
                                )}
                                {quizSubmitted && quizScore !== null && (
                                  <div className="mt-4 p-4 rounded bg-accent">
                                    <p className="text-sm font-medium">
                                      Результат: {quizScore}/{(section.items as QuizQuestion[]).length}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            {(section.type === 'practice' || section.type === 'checklist') && (
                              <ul className="space-y-2">
                                {(section.items as string[]).map((item: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          <Separator />

          {/* Resources Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Додаткові матеріали
            </h3>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-3">
                {module.resources && module.resources.length > 0 ? (
                  module.resources.map((resource, index) => (
                    <Card key={index} className="p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{resource.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Тип: {resource.type === "internal" ? "Внутрішній матеріал" : "Зовнішнє посилання"}
                          </p>
                        </div>
                        {resource.type === "external" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resource.url, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Відкрити
                          </Button>
                        )}
                        {resource.type === "internal" && (
                          <Badge variant="secondary">Доступно в системі</Badge>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Матеріали відсутні
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button onClick={() => setScheduleDialogOpen(true)} variant="outline" size="lg">
              <Calendar className="mr-2 h-5 w-5" />
              Запланувати в календарі
            </Button>
            {!module.completed ? (
              <Button 
                onClick={markAsCompleted} 
                size="lg"
                disabled={!quizSubmitted || quizScore === null}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {quizSubmitted ? "Позначити як завершений" : "Спочатку пройдіть квіз"}
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Завершено {new Date(module.completed_at!).toLocaleDateString("uk-UA")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        module={{
          id: module.id,
          title: module.title,
          duration: module.duration
        }}
        onScheduled={() => toast.success("Навчання додано в календар")}
      />
    </div>
  );
}
