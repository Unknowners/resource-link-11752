import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  created_at: string;
  details: any;
  user_email: string | null;
}

export default function Audit() {
  const [events, setEvents] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    loadAuditLogs();
  }, [currentPage, typeFilter]);

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

      // Build query
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('organization_id', member.organization_id);

      // Apply type filter
      if (typeFilter !== 'all') {
        query = query.eq('resource_type', typeFilter);
      }

      // Get total count
      const { count } = await query;
      setTotalCount(count || 0);

      // Get paginated data
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data: logs, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Get user emails for each log
      const userIds = [...new Set(logs?.map(log => log.user_id).filter(Boolean))];
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
      toast.error("Помилка завантаження логів");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.resource_type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      "create": "bg-green-50 text-green-700 border-green-200",
      "update": "bg-blue-50 text-blue-700 border-blue-200",
      "delete": "bg-red-50 text-red-700 border-red-200",
    };
    
    const labels: Record<string, string> = {
      "create": "Створено",
      "update": "Оновлено",
      "delete": "Видалено",
    };

    return (
      <Badge variant="outline" className={colors[action] || ""}>
        {labels[action] || action}
      </Badge>
    );
  };

  const getResourceTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      "group": "Група",
      "resource": "Ресурс",
      "integration": "Інтеграція",
      "member": "Користувач",
    };
    return labels[type || ''] || type || '-';
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
                <SelectItem value="all">Всі типи</SelectItem>
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
                      {new Date(event.created_at).toLocaleString('uk-UA')}
                    </TableCell>
                    <TableCell className="font-medium">{event.user_email}</TableCell>
                    <TableCell>{getActionBadge(event.action)}</TableCell>
                    <TableCell>{getResourceTypeLabel(event.resource_type)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {event.details?.name || JSON.stringify(event.details)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {!loading && totalCount > itemsPerPage && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Сторінка {currentPage} з {totalPages} ({totalCount} подій)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Попередня
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Наступна
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
