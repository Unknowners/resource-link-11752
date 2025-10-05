import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Download, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { LearningCalendar } from "./LearningCalendar";
import { ScheduleDialog } from "./ScheduleDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Module {
  id: string;
  title: string;
  duration: number;
  category: string;
}

export function CalendarView() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);

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
        .select('id, title, duration, category')
        .eq('user_id', user.id)
        .eq('organization_id', profile.organization_id)
        .eq('completed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModules(modules || []);
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setSelectedModule(module);
      setScheduleDialogOpen(true);
    }
  };

  const handleScheduled = () => {
    setCalendarKey(prev => prev + 1); // Refresh calendar
    setSelectedModule(null);
  };

  const connectGoogleCalendar = async () => {
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

      // Get auth URL
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: {
          action: 'get_auth_url',
          userId: user.id,
          organizationId: profile.organization_id,
        }
      });

      if (error || !data?.authUrl) {
        toast.error("Google Calendar не налаштовано. Зверніться до адміністратора.");
        return;
      }

      // Open OAuth window
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const authWindow = window.open(
        data.authUrl,
        'Google Calendar Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for success message
      const messageHandler = (event: MessageEvent) => {
        if (event.data?.type === 'google_calendar_connected') {
          toast.success("Google Calendar підключено!");
          window.removeEventListener('message', messageHandler);
          syncToGoogleCalendar();
        }
      };
      window.addEventListener('message', messageHandler);

    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      toast.error("Помилка підключення");
    }
  };

  const syncToGoogleCalendar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: {
          action: 'sync_events',
          userId: user.id,
        }
      });

      if (error) throw error;

      if (data?.synced) {
        toast.success(`Синхронізовано ${data.synced} подій з Google Calendar`);
      }
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error);
      toast.error("Помилка синхронізації");
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-sm font-medium mb-2 block">
                Запланувати модуль
              </label>
              <Select onValueChange={handleModuleSelect}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Оберіть модуль для планування" />
                </SelectTrigger>
                <SelectContent>
                  {modules.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Немає доступних модулів
                    </div>
                  ) : (
                    modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        <div className="flex items-center gap-2">
                          <span>{module.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {module.duration} хв
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={connectGoogleCalendar}
                variant="outline"
                className="gap-2 flex-1 sm:flex-initial"
              >
                <Share2 className="h-4 w-4" />
                Google Calendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <LearningCalendar key={calendarKey} />

      {/* Schedule Dialog */}
      {selectedModule && (
        <ScheduleDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          module={selectedModule}
          onScheduled={handleScheduled}
        />
      )}
    </div>
  );
}
