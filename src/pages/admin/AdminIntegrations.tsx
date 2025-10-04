import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IntegrationHealth {
  id: string;
  organization_id: string;
  organization_name: string;
  name: string;
  type: string;
  status: string;
  last_sync_at: string | null;
  error_message: string | null;
  created_at: string;
}

export default function AdminIntegrations() {
  const [integrations, setIntegrations] = useState<IntegrationHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    connected: 0,
    errors: 0,
    disconnected: 0,
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);

      // Load all integrations
      const { data: integrationsData, error } = await supabase
        .from('integrations')
        .select('*, organization_id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get organization names
      const orgIds = [...new Set(integrationsData?.map(i => i.organization_id) || [])];
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id, name')
        .in('id', orgIds);

      const integrationsWithOrgs = (integrationsData || []).map(integration => ({
        ...integration,
        organization_name: orgs?.find(o => o.id === integration.organization_id)?.name || 'Unknown'
      }));

      setIntegrations(integrationsWithOrgs);

      // Calculate stats
      const total = integrationsWithOrgs.length;
      const connected = integrationsWithOrgs.filter(i => i.status === 'connected').length;
      const errors = integrationsWithOrgs.filter(i => i.status === 'error').length;
      const disconnected = integrationsWithOrgs.filter(i => i.status === 'disconnected').length;

      setStats({ total, connected, errors, disconnected });
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast.error("Помилка завантаження інтеграцій");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Підключено
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Помилка
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Відключено
          </Badge>
        );
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-display mb-2">Стан інтеграцій</h1>
        <p className="text-muted-foreground text-lg">
          Моніторинг всіх інтеграцій в системі
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Всього</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-green-700">Підключено</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">{stats.connected}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-700">Помилки</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-700">{stats.errors}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-700">Відключено</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-700">{stats.disconnected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Всі інтеграції</CardTitle>
          <CardDescription>
            Список всіх інтеграцій в системі
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Завантаження...
            </div>
          ) : integrations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Інтеграцій не знайдено
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Організація</TableHead>
                  <TableHead>Назва</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Остання синхронізація</TableHead>
                  <TableHead>Помилка</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell className="font-medium">
                      {integration.organization_name}
                    </TableCell>
                    <TableCell>{integration.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{integration.type}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(integration.status)}</TableCell>
                    <TableCell>
                      {integration.last_sync_at
                        ? new Date(integration.last_sync_at).toLocaleString('uk-UA')
                        : 'Ніколи'}
                    </TableCell>
                    <TableCell className="text-sm text-destructive">
                      {integration.error_message || '-'}
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
