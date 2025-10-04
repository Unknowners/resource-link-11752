import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  user_email: string;
  created_at: string;
  details: any;
}

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      const { data: auditLogs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Get user emails
      const userIds = [...new Set(auditLogs?.map(log => log.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const logsWithEmails = (auditLogs || []).map(log => ({
        ...log,
        user_email: profiles?.find(p => p.id === log.user_id)?.email || 'Система'
      }));

      setLogs(logsWithEmails);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error("Помилка завантаження логів");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.resource_type && log.resource_type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('create') || action.includes('signup')) return 'default';
    if (action.includes('update') || action.includes('login')) return 'outline';
    if (action.includes('delete')) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-display">Глобальний аудит</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Всі дії користувачів у системі
        </p>
      </div>

      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Пошук в логах..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Завантаження...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Логів не знайдено
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Користувач</TableHead>
                  <TableHead>Дія</TableHead>
                  <TableHead>Ресурс</TableHead>
                  <TableHead>ID ресурсу</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">
                      {new Date(log.created_at).toLocaleString('uk-UA')}
                    </TableCell>
                    <TableCell>{log.user_email}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.resource_type || '-'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.resource_id ? log.resource_id.substring(0, 8) + '...' : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
