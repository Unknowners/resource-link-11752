import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, addWeeks } from "date-fns";
import { uk } from "date-fns/locale";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const DAYS_OF_WEEK = [
  { value: "monday", label: "Пн", full: "Понеділок" },
  { value: "tuesday", label: "Вт", full: "Вівторок" },
  { value: "wednesday", label: "Ср", full: "Середа" },
  { value: "thursday", label: "Чт", full: "Четвер" },
  { value: "friday", label: "Пт", full: "П'ятниця" },
  { value: "saturday", label: "Сб", full: "Субота" },
  { value: "sunday", label: "Нд", full: "Неділя" },
];

export function ScheduleDialog({ open, onOpenChange, module, onScheduled }: ScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repeatType, setRepeatType] = useState<string>("none");
  const [repeatDays, setRepeatDays] = useState<string[]>([]);
  const [repeatCount, setRepeatCount] = useState<number>(4);

  const toggleRepeatDay = (day: string) => {
    setRepeatDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSchedule = async () => {
    if (!selectedDate) {
      toast.error("Оберіть дату");
      return;
    }

    if (repeatType === "weekly" && repeatDays.length === 0) {
      toast.error("Оберіть дні тижня для повторення");
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

      const sessionsToInsert = [];

      if (repeatType === "none") {
        // Single session
        sessionsToInsert.push({
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
      } else if (repeatType === "daily") {
        // Daily repeat for N times
        for (let i = 0; i < repeatCount; i++) {
          const date = addDays(selectedDate, i);
          sessionsToInsert.push({
            user_id: user.id,
            module_id: module.id,
            organization_id: profile.organization_id,
            scheduled_date: format(date, 'yyyy-MM-dd'),
            scheduled_time: selectedTime,
            duration: module.duration,
            reminder_enabled: reminderEnabled,
            notes: notes || null,
            status: 'scheduled'
          });
        }
      } else if (repeatType === "weekly") {
        // Weekly repeat on selected days
        const dayMap: Record<string, number> = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };

        for (let week = 0; week < repeatCount; week++) {
          for (const dayName of repeatDays) {
            const targetDay = dayMap[dayName];
            const currentDay = selectedDate.getDay();
            const daysUntilTarget = (targetDay - currentDay + 7) % 7;
            const date = addDays(addWeeks(selectedDate, week), daysUntilTarget);
            
            sessionsToInsert.push({
              user_id: user.id,
              module_id: module.id,
              organization_id: profile.organization_id,
              scheduled_date: format(date, 'yyyy-MM-dd'),
              scheduled_time: selectedTime,
              duration: module.duration,
              reminder_enabled: reminderEnabled,
              notes: notes || null,
              status: 'scheduled'
            });
          }
        }
      }

      const { error } = await supabase
        .from('learning_schedule')
        .insert(sessionsToInsert);

      if (error) throw error;

      const count = sessionsToInsert.length;
      toast.success(`Заплановано ${count} ${count === 1 ? 'сесію' : count < 5 ? 'сесії' : 'сесій'} навчання`);
      onOpenChange(false);
      onScheduled?.();
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime("09:00");
      setNotes("");
      setReminderEnabled(true);
      setRepeatType("none");
      setRepeatDays([]);
      setRepeatCount(4);
    } catch (error) {
      console.error('Error scheduling:', error);
      toast.error("Помилка при плануванні");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Запланувати навчання</DialogTitle>
          <DialogDescription>
            {module.title} • {module.duration} хв
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Calendar */}
          <div>
            <Label className="mb-2 block">Початкова дата</Label>
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

          {/* Repeat Type */}
          <div>
            <Label htmlFor="repeat">Повторення</Label>
            <Select value={repeatType} onValueChange={setRepeatType}>
              <SelectTrigger id="repeat" className="w-full mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="none">Без повторення</SelectItem>
                <SelectItem value="daily">Щодня</SelectItem>
                <SelectItem value="weekly">Щотижня (обрати дні)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weekly repeat - days selection */}
          {repeatType === "weekly" && (
            <div>
              <Label className="mb-2 block">Дні тижня</Label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={repeatDays.includes(day.value) ? "default" : "outline"}
                    className="p-2 h-auto"
                    onClick={() => toggleRepeatDay(day.value)}
                    title={day.full}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
              {repeatDays.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {repeatDays.map(day => {
                    const dayInfo = DAYS_OF_WEEK.find(d => d.value === day);
                    return (
                      <Badge key={day} variant="secondary" className="gap-1">
                        {dayInfo?.full}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => toggleRepeatDay(day)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Repeat count */}
          {repeatType !== "none" && (
            <div>
              <Label htmlFor="count">
                Кількість {repeatType === "daily" ? "днів" : "тижнів"}
              </Label>
              <input
                id="count"
                type="number"
                min="1"
                max="12"
                value={repeatCount}
                onChange={(e) => setRepeatCount(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              />
            </div>
          )}

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
