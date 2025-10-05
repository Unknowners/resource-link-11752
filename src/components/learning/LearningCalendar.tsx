import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Bell, X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO, isSameDay } from "date-fns";
import { uk } from "date-fns/locale";

interface ScheduledSession {
  id: string;
  module_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  reminder_enabled: boolean;
  notes: string;
  status: string;
  learning_modules: {
    title: string;
    category: string;
  };
}

export function LearningCalendar() {
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('learning_schedule')
        .select(`
          *,
          learning_modules (
            title,
            category
          )
        `)
        .eq('user_id', user.id)
        .gte('scheduled_date', format(new Date(), 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setSessions(data as ScheduledSession[] || []);
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast.error("Помилка завантаження розкладу");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('learning_schedule')
        .update({ status: 'cancelled' })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success("Сесію скасовано");
      loadSchedule();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error("Помилка при скасуванні");
    }
  };

  const completeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('learning_schedule')
        .update({ status: 'completed' })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success("Сесію завершено!");
      loadSchedule();
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error("Помилка при завершенні");
    }
  };

  const getSessionsByDate = () => {
    const grouped: Record<string, ScheduledSession[]> = {};
    sessions.forEach(session => {
      const date = session.scheduled_date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(session);
    });
    return grouped;
  };

  const sessionsByDate = getSessionsByDate();
  const today = format(new Date(), 'yyyy-MM-dd');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Завантаження...</div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Календар навчання
          </CardTitle>
          <CardDescription>Заплануйте свої навчальні сесії</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Поки що немає запланованих сесій
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Календар навчання
        </CardTitle>
        <CardDescription>Ваші заплановані навчальні сесії</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(sessionsByDate).map(([date, dateSessions]) => {
          const sessionDate = parseISO(date);
          const isToday = isSameDay(sessionDate, new Date());

          return (
            <div key={date} className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {format(sessionDate, 'EEEE, d MMMM', { locale: uk })}
                </h3>
                {isToday && (
                  <Badge variant="default" className="text-xs">Сьогодні</Badge>
                )}
              </div>

              <div className="space-y-2">
                {dateSessions.map((session) => (
                  <Card key={session.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">
                            {session.learning_modules.title}
                          </h4>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.scheduled_time} • {session.duration} хв
                            </span>
                            {session.reminder_enabled && (
                              <span className="flex items-center gap-1">
                                <Bell className="h-3 w-3" />
                                Нагадування
                              </span>
                            )}
                          </div>
                          {session.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {session.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {session.status === 'scheduled' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => completeSession(session.id)}
                                title="Завершити"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => cancelSession(session.id)}
                                title="Скасувати"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {session.status === 'completed' && (
                            <Badge variant="default" className="bg-green-500">
                              Завершено
                            </Badge>
                          )}
                          {session.status === 'cancelled' && (
                            <Badge variant="secondary">Скасовано</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
