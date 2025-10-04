import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  created_at: string;
  user_email: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: any;
}

export default function Audit() {
  const [events, setEvents] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
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

      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', member.organization_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get user emails
      const userIds = [...new Set(logs?.map(log => log.user_id).filter(Boolean) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const logsWithEmails = (logs || []).map(log => ({
        ...log,
        user_email: profiles?.find(p => p.id === log.user_id)?.email || 'Система'
      }));

      setEvents(logsWithEmails);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error("Помилка завантаження аудит-логів");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.resource_type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || event.resource_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      "create": "bg-green-50 text-green-700 border-green-200",
      "update": "bg-blue-50 text-blue-700 border-blue-200",
      "delete": "bg-red-50 text-red-700 border-red-200",
    };
    return (
      <Badge variant="outline" className={colors[action] || ""}>
        {action === 'create' ? 'Створено' : action === 'update' ? 'Оновлено' : action === 'delete' ? 'Видалено' : action}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getResourceTypeName = (type: string | null) => {
    const types: Record<string, string> = {
      'group': 'Група',
      'resource': 'Ресурс',
      'integration': 'Інтеграція',
      'member': 'Учасник',
    };
    return type ? types[type] || type : 'Невідомо';
  };

  const getDetailsText = (log: AuditLog) => {
    if (!log.details) return '';
    
    if (log.action === 'create' && log.resource_type === 'group') {
      return `Назва: ${log.details.name}`;
    }
    if (log.action === 'create' && log.resource_type === 'member') {
      return `Email: ${log.details.email}, Роль: ${log.details.role}`;
    }
    if (log.action === 'create' && log.resource_type === 'resource') {
      return `${log.details.name} (${log.details.type})`;
    }
    if (log.action === 'create' && log.resource_type === 'integration') {
      return `${log.details.name} (${log.details.type})`;
    }
    if (log.action === 'delete' && log.resource_type === 'member') {
      return `Email: ${log.details.email}`;
    }
    
    return JSON.stringify(log.details).substring(0, 100);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="font-display">Аудит-лог</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Повна історія дій в організації
        </p>
      </div>

      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Пошук по користувачу, дії або сутності..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Всі дії" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі дії</SelectItem>
                <SelectItem value="resource">Ресурси</SelectItem>
                <SelectItem value="member">Користувачі</SelectItem>
                <SelectItem value="integration">Інтеграції</SelectItem>
                <SelectItem value="group">Групи</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Історія подій</CardTitle>
          <CardDescription>
            Хронологічний список всіх дій в системі
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Завантаження...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Подій не знайдено
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Час</TableHead>
                    <TableHead>Користувач</TableHead>
                    <TableHead>Дія</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Деталі</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(event.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">{event.user_email}</TableCell>
                      <TableCell>{getActionBadge(event.action)}</TableCell>
                      <TableCell>{getResourceTypeName(event.resource_type)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                        {getDetailsText(event)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
