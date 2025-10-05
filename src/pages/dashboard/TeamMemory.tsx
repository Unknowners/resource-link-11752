import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Lightbulb, Plus, Clock, CheckCircle2, Trash2, Loader2, Star, MessageSquare, Archive, Sparkles, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpinAnimation } from "@/components/team-memory/SpinAnimation";
import { EnvelopeAnimation } from "@/components/team-memory/EnvelopeAnimation";
import { IdeaStorageAnimation } from "@/components/team-memory/IdeaStorageAnimation";
import { motion, AnimatePresence } from "framer-motion";

interface Idea {
  id: string;
  title: string;
  content: string;
  user_id: string;
  author: string;
  status: "active" | "completed" | "archived";
  createdAt: Date;
  suggestion?: string;
  project_id?: string;
  project_name?: string;
  karma: number;
  comments: Array<{
    user_id: string;
    user_name: string;
    text: string;
    created_at: string;
  }>;
  archived: boolean;
  scheduled_reminder_date?: string;
}

interface Project {
  id: string;
  name: string;
}

export default function TeamMemory() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSpinDialogOpen, setIsSpinDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [newIdea, setNewIdea] = useState({ 
    title: "", 
    content: "", 
    project_id: "",
    scheduled_reminder_date: ""
  });
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadIdeas();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!member) return;

      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('organization_id', member.organization_id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!member) return;
      setOrganizationId(member.organization_id);

      const { data: ideasData, error } = await supabase
        .from('team_ideas')
        .select(`
          *,
          profiles!team_ideas_user_id_fkey (
            first_name,
            last_name
          ),
          projects:project_id (
            id,
            name
          )
        `)
        .eq('organization_id', member.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedIdeas: Idea[] = (ideasData || []).map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        content: idea.content,
        user_id: idea.user_id,
        author: idea.profiles 
          ? `${idea.profiles.first_name || ''} ${idea.profiles.last_name || ''}`.trim() || 'Користувач'
          : 'Користувач',
        status: idea.status,
        createdAt: new Date(idea.created_at),
        suggestion: idea.suggestion,
        project_id: idea.project_id,
        project_name: idea.projects?.name,
        karma: idea.karma || 0,
        comments: idea.comments || [],
        archived: idea.archived || false,
        scheduled_reminder_date: idea.scheduled_reminder_date
      }));

      setIdeas(formattedIdeas);
    } catch (error) {
      console.error('Error loading ideas:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити ідеї",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIdea = async () => {
    if (!newIdea.title.trim() || !newIdea.content.trim()) {
      toast({
        title: "Помилка",
        description: "Заповніть всі поля",
        variant: "destructive"
      });
      return;
    }

    if (!organizationId) return;

    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Wait for envelope flying animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { error } = await supabase
        .from('team_ideas')
        .insert({
          organization_id: organizationId,
          user_id: user.id,
          title: newIdea.title,
          content: newIdea.content,
          status: 'active',
          project_id: newIdea.project_id || null,
          scheduled_reminder_date: newIdea.scheduled_reminder_date || null,
          karma: 0,
          comments: [],
          archived: false
        });

      if (error) throw error;

      // Show success animation
      setShowSuccess(true);
      
      toast({
        title: "Успіх",
        description: "Ідею додано успішно"
      });

      // Wait for success animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      setNewIdea({ title: "", content: "", project_id: "", scheduled_reminder_date: "" });
      setIsDialogOpen(false);
      setIsSubmitting(false);
      setShowSuccess(false);
      loadIdeas();
    } catch (error) {
      console.error('Error adding idea:', error);
      setIsSubmitting(false);
      setShowSuccess(false);
      toast({
        title: "Помилка",
        description: "Не вдалося додати ідею",
        variant: "destructive"
      });
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Успішно",
        description: "Ідею видалено",
      });

      loadIdeas();
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося видалити ідею",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_ideas')
        .update({ archived: true, status: 'archived' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Успіх",
        description: "Ідею архівовано"
      });

      loadIdeas();
      setIsSpinDialogOpen(false);
    } catch (error) {
      console.error('Error archiving idea:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося архівувати ідею",
        variant: "destructive"
      });
    }
  };

  const handleLike = async (id: string, currentKarma: number) => {
    try {
      const { error } = await supabase
        .from('team_ideas')
        .update({ karma: currentKarma + 1 })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "👍",
        description: "+1 карма!"
      });

      loadIdeas();
    } catch (error) {
      console.error('Error liking idea:', error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedIdea || !newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const comment = {
        user_id: user.id,
        user_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Користувач',
        text: newComment,
        created_at: new Date().toISOString()
      };

      const updatedComments = [...(selectedIdea.comments || []), comment];

      const { error } = await supabase
        .from('team_ideas')
        .update({ 
          comments: updatedComments,
          karma: selectedIdea.karma + 1 
        })
        .eq('id', selectedIdea.id);

      if (error) throw error;

      toast({
        title: "Успіх",
        description: "Коментар додано"
      });

      setNewComment("");
      setIsCommentDialogOpen(false);
      loadIdeas();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося додати коментар",
        variant: "destructive"
      });
    }
  };

  const handleSpin = async () => {
    setSpinning(true);
    
    let filteredIdeas = ideas.filter(idea => !idea.archived && idea.status === 'active');
    
    if (filterProject !== "all") {
      filteredIdeas = filteredIdeas.filter(idea => idea.project_id === filterProject);
    }

    if (filteredIdeas.length === 0) {
      toast({
        title: "Упс!",
        description: "Немає активних ідей для обертання барабану",
        variant: "destructive"
      });
      setSpinning(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const randomIdea = filteredIdeas[Math.floor(Math.random() * filteredIdeas.length)];
    setSelectedIdea(randomIdea);
    setSpinning(false);
    setIsSpinDialogOpen(true);
  };

  const handlePostpone = async (id: string, days: number) => {
    try {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + days);

      const { error } = await supabase
        .from('team_ideas')
        .update({ scheduled_reminder_date: newDate.toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Успіх",
        description: `Нагадування відкладено на ${days} днів`
      });

      setIsSpinDialogOpen(false);
      loadIdeas();
    } catch (error) {
      console.error('Error postponing idea:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося відкласти ідею",
        variant: "destructive"
      });
    }
  };

  const handleDevelop = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsCommentDialogOpen(true);
  };

  const getStatusBadge = (status: Idea["status"]) => {
    const config = {
      active: { label: "Активна", variant: "default" as const, icon: Clock },
      completed: { label: "Завершено", variant: "outline" as const, icon: CheckCircle2 },
      archived: { label: "Архів", variant: "secondary" as const, icon: Archive },
    };
    const { label, variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="text-xs">
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const activeIdeas = ideas.filter(idea => !idea.archived);
  const topIdea = [...activeIdeas].sort((a, b) => b.karma - a.karma)[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header with Spin Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl mb-2">🎰 Барабан Ідей</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Командний інбокс ідей та креативний спін
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!isSubmitting) setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Додати ідею
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Нова ідея</DialogTitle>
                <DialogDescription>
                  Додайте нову ідею або нотатку для команди
                </DialogDescription>
              </DialogHeader>

              {/* Envelope Animation */}
              <EnvelopeAnimation 
                isOpen={isDialogOpen} 
                isSubmitting={isSubmitting}
              />

              {/* Storage Animation on Success */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <IdeaStorageAnimation showSuccess={showSuccess} />
                  </motion.div>
                )}
              </AnimatePresence>

              <ScrollArea className="max-h-[60vh]">
                <motion.div 
                  className="space-y-4 pr-4"
                  animate={isDialogOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
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
                  <div>
                    <Label htmlFor="project">Проєкт (опціонально)</Label>
                    <Select value={newIdea.project_id} onValueChange={(value) => setNewIdea({ ...newIdea, project_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Виберіть проєкт" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Без проєкту</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reminder">Нагадування (опціонально)</Label>
                    <Input
                      id="reminder"
                      type="date"
                      value={newIdea.scheduled_reminder_date}
                      onChange={(e) => setNewIdea({ ...newIdea, scheduled_reminder_date: e.target.value })}
                    />
                  </div>
                </motion.div>
              </ScrollArea>
              <Button 
                onClick={handleAddIdea} 
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Відправляємо...
                  </>
                ) : (
                  "Зберегти"
                )}
              </Button>
            </DialogContent>
          </Dialog>

          <Button variant="secondary" onClick={handleSpin} disabled={spinning || activeIdeas.length === 0}>
            {spinning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Крутимо...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Крутнути барабан
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Фільтр по проєкту:</Label>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі проєкти</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Spin Dialog */}
      <Dialog open={isSpinDialogOpen || spinning} onOpenChange={(open) => {
        if (!spinning) setIsSpinDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {spinning ? "Крутимо барабан..." : "Барабан обрав ідею!"}
            </DialogTitle>
          </DialogHeader>

          {/* Spin Animation */}
          {spinning && (
            <div className="py-8">
              <SpinAnimation isSpinning={spinning} />
              <p className="text-center text-muted-foreground mt-4">
                Обираємо випадкову ідею...
              </p>
            </div>
          )}

          {selectedIdea && !spinning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div>
                <h3 className="font-semibold text-lg">{selectedIdea.title}</h3>
                {selectedIdea.project_name && (
                  <Badge variant="outline" className="mt-2">
                    {selectedIdea.project_name}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{selectedIdea.content}</p>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Карма: {selectedIdea.karma}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Створено {formatDistanceToNow(selectedIdea.createdAt, { addSuffix: true, locale: uk })}
              </p>

              <div className="flex flex-col gap-2">
                <Button onClick={() => handleDevelop(selectedIdea)} className="w-full">
                  ✅ Розвинути ідею
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => handlePostpone(selectedIdea.id, 7)}>
                    🕒 Відкласти на 7 днів
                  </Button>
                  <Button variant="outline" onClick={() => handlePostpone(selectedIdea.id, 30)}>
                    🕒 Відкласти на 30 днів
                  </Button>
                </div>
                <Button variant="destructive" onClick={() => handleArchive(selectedIdea.id)} className="w-full">
                  🗑️ Архівувати
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Розвинути ідею</DialogTitle>
          </DialogHeader>
          {selectedIdea && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {/* Idea Card */}
                <Card className="bg-secondary/50">
                  <CardHeader>
                    <CardTitle className="text-base">{selectedIdea.title}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      {getStatusBadge(selectedIdea.status)}
                      <Badge variant="outline" className="text-xs">
                        {selectedIdea.author}
                      </Badge>
                      {selectedIdea.project_name && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedIdea.project_name}
                        </Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {selectedIdea.karma} карма
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedIdea.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(selectedIdea.createdAt, { addSuffix: true, locale: uk })}
                    </p>
                  </CardContent>
                </Card>

                {/* Existing Comments */}
                {selectedIdea.comments && selectedIdea.comments.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-base">Коментарі ({selectedIdea.comments.length})</Label>
                    {selectedIdea.comments.map((comment, index) => (
                      <Card key={index} className="border-l-4 border-l-primary/50">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {comment.user_name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: uk })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Add New Comment */}
                <div className="space-y-2">
                  <Label htmlFor="comment">Додати коментар</Label>
                  <Textarea
                    id="comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Додайте свої думки щодо цієї ідеї..."
                    rows={4}
                  />
                  <Button onClick={handleAddComment} className="w-full" disabled={!newComment.trim()}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Додати коментар (+1 карма)
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Top Idea Card */}
      {topIdea && (
        <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              💡 Ідея тижня
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <h3 className="font-semibold">{topIdea.title}</h3>
            <p className="text-sm text-muted-foreground">{topIdea.content}</p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                {topIdea.karma} карма
              </Badge>
              <Badge variant="outline">{topIdea.author}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ideas Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : activeIdeas.length === 0 ? (
        <Card className="p-12 text-center">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Поки що немає ідей. Додайте першу!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeIdeas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-base">{idea.title}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => handleDeleteIdea(idea.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(idea.status)}
                  <Badge variant="outline" className="text-xs">
                    {idea.author}
                  </Badge>
                  {idea.project_name && (
                    <Badge variant="secondary" className="text-xs">
                      {idea.project_name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {idea.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleLike(idea.id, idea.karma)}
                      className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                    >
                      <Star className="h-4 w-4 text-yellow-500" />
                      {idea.karma}
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedIdea(idea);
                        setIsCommentDialogOpen(true);
                      }}
                      className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {idea.comments.length}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(idea.createdAt, { addSuffix: true, locale: uk })}
                  </p>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{activeIdeas.length}</div>
              <div className="text-xs text-muted-foreground">Активних</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{ideas.filter(i => i.status === "completed").length}</div>
              <div className="text-xs text-muted-foreground">Завершених</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{ideas.reduce((sum, i) => sum + i.karma, 0)}</div>
              <div className="text-xs text-muted-foreground">Загальна карма</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
