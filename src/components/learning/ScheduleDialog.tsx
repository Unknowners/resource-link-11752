import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: {
    id: string;
    title: string;
    duration: number;
  };
  onScheduled?: () => void;
}

export function ScheduleDialog({ open, onOpenChange, module, onScheduled }: ScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSchedule = async () => {
    if (!selectedDate) {
      toast.error("Оберіть дату");
      return;
    }

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
        .from('learning_schedule')
        .insert({
          user_id: user.id,
          module_id: module.id,
          organization_id: profile.organization_id,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: selectedTime,
          duration: module.duration,
          reminder_enabled: reminderEnabled,
          notes: notes || null,
          status: 'scheduled'
        });

      if (error) throw error;

      toast.success(`Навчання заплановано на ${format(selectedDate, 'dd MMMM yyyy', { locale: uk })} о ${selectedTime}`);
      onOpenChange(false);
      onScheduled?.();
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime("09:00");
      setNotes("");
      setReminderEnabled(true);
    } catch (error) {
      console.error('Error scheduling:', error);
      toast.error("Помилка при плануванні");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Запланувати навчання</DialogTitle>
          <DialogDescription>
            {module.title} • {module.duration} хв
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Calendar */}
          <div>
            <Label className="mb-2 block">Оберіть дату</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border pointer-events-auto mx-auto"
            />
          </div>

          {/* Time picker */}
          <div>
            <Label htmlFor="time">Час</Label>
            <input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
            />
          </div>

          {/* Reminder toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="reminder">Нагадування</Label>
            <Switch
              id="reminder"
              checked={reminderEnabled}
              onCheckedChange={setReminderEnabled}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Нотатки (необов'язково)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Додайте нотатки..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button onClick={handleSchedule} disabled={!selectedDate || isSubmitting}>
            {isSubmitting ? "Збереження..." : "Запланувати"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
