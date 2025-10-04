import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, RefreshCw, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  last_sync_at: string | null;
  error_message: string | null;
  resource_count?: number;
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
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

      const { data: integrationsData, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', member.organization_id);

      if (error) throw error;

      // Get resource counts per integration
      const { data: resources } = await supabase
        .from('resources')
        .select('integration')
        .eq('organization_id', member.organization_id);

      const integrationsWithCounts = (integrationsData || []).map(integration => ({
        ...integration,
        resource_count: resources?.filter(r => r.integration === integration.name).length || 0
      }));

      setIntegrations(integrationsWithCounts);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast.error("Помилка завантаження інтеграцій");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntegration = async () => {
    if (!organizationId) return;
    
    try {
      const { error } = await supabase
        .from('integrations')
        .insert({
          organization_id: organizationId,
          name: formData.name,
          type: formData.type,
          status: 'connected',
        });

      if (error) throw error;

      toast.success("Інтеграцію створено");
      setIsDialogOpen(false);
      setFormData({ name: "", type: "" });
      loadIntegrations();
    } catch (error) {
      console.error('Error creating integration:', error);
      toast.error("Помилка створення інтеграції");
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;

      toast.success("Інтеграцію видалено");
      loadIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast.error("Помилка видалення інтеграції");
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
        return <Badge variant="secondary">Відключено</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="mb-2">Інтеграції</h1>
          <p className="text-muted-foreground">
            Підключіть та керуйте інтеграціями
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Додати інтеграцію
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Додати нову інтеграцію</DialogTitle>
              <DialogDescription>
                Введіть дані для нової інтеграції
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Назва</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jira"
                />
              </div>
              <div>
                <Label htmlFor="type">Тип</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="jira"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleCreateIntegration} disabled={!formData.name || !formData.type}>
                Додати
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">
          Завантаження...
        </div>
      ) : integrations.length === 0 ? (
        <Card className="glass-card border-dashed">
          <CardHeader className="text-center">
            <CardTitle>Додайте першу інтеграцію</CardTitle>
            <CardDescription>
              Інтеграції допомагають підключити зовнішні сервіси
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Додати інтеграцію
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {integration.name}
                      {getStatusBadge(integration.status)}
                    </CardTitle>
                    <CardDescription>{integration.type}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteIntegration(integration.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {integration.status === "error" ? (
                  <div className="space-y-4">
                    <p className="text-sm text-destructive">{integration.error_message}</p>
                    <Button variant="outline" className="w-full">
                      Перепідключити
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Остання синхронізація</span>
                      <span className="font-medium">
                        {integration.last_sync_at 
                          ? new Date(integration.last_sync_at).toLocaleString('uk-UA')
                          : 'Ніколи'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ресурсів</span>
                      <span className="font-medium">{integration.resource_count}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
