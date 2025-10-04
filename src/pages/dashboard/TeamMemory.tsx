import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Lightbulb, Plus, Clock, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

interface Idea {
  id: string;
  title: string;
  content: string;
  author: string;
  status: "active" | "completed" | "outdated";
  createdAt: Date;
  suggestion?: string;
}

export default function TeamMemory() {
  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: "1",
      title: "Автоматизація звітів",
      content: "Можна автоматизувати створення щотижневих звітів через скрипти",
      author: "Олена К.",
      status: "active",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      suggestion: "Це пасує до вашої поточної теми!"
    },
    {
      id: "2",
      title: "Нова фіча для клієнтів",
      content: "Додати можливість експорту даних у різних форматах",
      author: "Максим П.",
      status: "active",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      title: "Оптимізація бази даних",
      content: "Треба переглянути індекси у головній таблиці",
      author: "Ірина Л.",
      status: "completed",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: "", content: "" });

  const handleAddIdea = () => {
    if (!newIdea.title.trim() || !newIdea.content.trim()) return;

    const idea: Idea = {
      id: Date.now().toString(),
      title: newIdea.title,
      content: newIdea.content,
      author: "Ви",
      status: "active",
      createdAt: new Date(),
    };

    setIdeas([idea, ...ideas]);
    setNewIdea({ title: "", content: "" });
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: Idea["status"]) => {
    const config = {
      active: { label: "Активна", variant: "default" as const, icon: AlertCircle },
      completed: { label: "Завершено", variant: "outline" as const, icon: CheckCircle2 },
      outdated: { label: "Застаріла", variant: "secondary" as const, icon: Clock },
    };
    const { label, variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="text-xs">
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl mb-2">Team Memory</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Командний інбокс ідей та нотаток
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Додати ідею
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Нова ідея</DialogTitle>
              <DialogDescription>
                Додайте нову ідею або нотатку для команди
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Назва</Label>
                <Input
                  id="title"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  placeholder="Коротка назва ідеї"
                />
              </div>
              <div>
                <Label htmlFor="content">Опис</Label>
                <Textarea
                  id="content"
                  value={newIdea.content}
                  onChange={(e) => setNewIdea({ ...newIdea, content: e.target.value })}
                  placeholder="Детальний опис ідеї або нотатки..."
                  rows={4}
                />
              </div>
              <Button onClick={handleAddIdea} className="w-full">
                Зберегти
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.map((idea) => (
          <Card
            key={idea.id}
            className={`border-2 hover:shadow-lg transition-shadow ${
              idea.suggestion ? "border-primary" : ""
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2 mb-2">
                <CardTitle className="text-base">{idea.title}</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(idea.status)}
                <Badge variant="outline" className="text-xs">
                  {idea.author}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {idea.content}
              </p>

              {idea.suggestion && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-primary font-medium">
                      {idea.suggestion}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(idea.createdAt, { addSuffix: true, locale: uk })}
              </p>

              <div className="flex gap-2">
                {idea.status === "active" && (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      Допрацювати
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Архівувати
                    </Button>
                  </>
                )}
                {idea.status === "completed" && (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Завершено
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{ideas.filter(i => i.status === "active").length}</div>
              <div className="text-xs text-muted-foreground">Активних</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{ideas.filter(i => i.status === "completed").length}</div>
              <div className="text-xs text-muted-foreground">Завершених</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{ideas.length}</div>
              <div className="text-xs text-muted-foreground">Всього ідей</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
