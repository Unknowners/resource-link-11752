import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, BookOpen, Clock, ExternalLink, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  difficulty: string;
  content: any;
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

  useEffect(() => {
    loadModule();
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

  const markAsCompleted = async () => {
    if (!module) return;

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

          {/* Resources Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Навчальні матеріали
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

          {/* Action Button */}
          <div className="flex justify-end">
            {!module.completed ? (
              <Button onClick={markAsCompleted} size="lg">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Позначити як завершений
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground">
                Завершено {new Date(module.completed_at!).toLocaleDateString("uk-UA")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
