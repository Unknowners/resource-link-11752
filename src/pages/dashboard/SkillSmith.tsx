import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, CheckCircle2, PlayCircle, Calendar } from "lucide-react";

interface Module {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  category: string;
}

export default function SkillSmith() {
  const [modules] = useState<Module[]>([
    {
      id: "1",
      title: "Основи роботи з Notion",
      duration: 25,
      completed: true,
      category: "Інструменти"
    },
    {
      id: "2",
      title: "Git та GitHub - швидкий старт",
      duration: 30,
      completed: true,
      category: "Розробка"
    },
    {
      id: "3",
      title: "Agile методології",
      duration: 20,
      completed: false,
      category: "Процеси"
    },
    {
      id: "4",
      title: "Безпека даних",
      duration: 15,
      completed: false,
      category: "Безпека"
    },
  ]);

  const completedCount = modules.filter(m => m.completed).length;
  const progressPercent = (completedCount / modules.length) * 100;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl mb-2">SkillSmith</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Персональне навчання та розвиток навичок
        </p>
      </div>

      {/* Progress Card */}
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

      {/* Modules List */}
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
                  <CardTitle className="text-base mb-2">{module.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {module.category}
                    </Badge>
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
              {module.completed ? (
                <Button variant="outline" className="w-full" disabled>
                  Завершено
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Почати
                  </Button>
                  <Button variant="outline" size="icon">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Рекомендації для вас
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            На основі вашої ролі та прогресу, рекомендуємо почати з модуля "Agile методології"
          </p>
          <Button>
            Переглянути рекомендації
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
