import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Resource {
  id: string;
  name: string;
  type: string;
  integration: string;
  url: string | null;
  groups: string[];
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    integration: "",
    url: "",
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
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

      const { data: resourcesData, error } = await supabase
        .from('resources')
        .select('*')
        .eq('organization_id', member.organization_id);

      if (error) throw error;

      // Get resource permissions with group names
      const { data: permissions } = await supabase
        .from('resource_permissions')
        .select('resource_id, group_id, groups(name)')
        .in('resource_id', resourcesData?.map(r => r.id) || []);

      const resourcesWithGroups: Resource[] = (resourcesData || []).map(resource => ({
        ...resource,
        groups: permissions
          ?.filter(p => p.resource_id === resource.id)
          .map(p => (p.groups as any)?.name)
          .filter(Boolean) || []
      }));

      setResources(resourcesWithGroups);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error("Помилка завантаження ресурсів");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async () => {
    if (!organizationId) return;
    
    try {
      const { error } = await supabase
        .from('resources')
        .insert({
          organization_id: organizationId,
          name: formData.name,
          type: formData.type,
          integration: formData.integration,
          url: formData.url,
        });

      if (error) throw error;

      toast.success("Ресурс створено");
      setIsDialogOpen(false);
      setFormData({ name: "", type: "", integration: "", url: "" });
      loadResources();
    } catch (error) {
      console.error('Error creating resource:', error);
      toast.error("Помилка створення ресурсу");
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      toast.success("Ресурс видалено");
      loadResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error("Помилка видалення ресурсу");
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || resource.integration.toLowerCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      jiraProject: { label: "Jira Project", variant: "default" },
      confluenceSpace: { label: "Confluence", variant: "secondary" },
      notionSpace: { label: "Notion", variant: "outline" },
      gdriveFolder: { label: "Google Drive", variant: "default" },
    };
    const badge = badges[type] || { label: type, variant: "outline" as const };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="mb-2">Ресурси</h1>
          <p className="text-muted-foreground">
            Керуйте та переглядайте всі інтегровані ресурси
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Додати ресурс
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Додати новий ресурс</DialogTitle>
              <DialogDescription>
                Введіть інформацію про новий ресурс
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Назва</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Project Alpha"
                />
              </div>
              <div>
                <Label htmlFor="type">Тип</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="jiraProject"
                />
              </div>
              <div>
                <Label htmlFor="integration">Інтеграція</Label>
                <Input
                  id="integration"
                  value={formData.integration}
                  onChange={(e) => setFormData({ ...formData, integration: e.target.value })}
                  placeholder="Jira"
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleCreateResource} disabled={!formData.name || !formData.type || !formData.integration}>
                Додати
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Пошук ресурсів..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Фільтр за типом" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі типи</SelectItem>
                <SelectItem value="jira">Jira</SelectItem>
                <SelectItem value="confluence">Confluence</SelectItem>
                <SelectItem value="notion">Notion</SelectItem>
                <SelectItem value="google drive">Google Drive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Завантаження...
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Ресурсів не знайдено
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Назва</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Інтеграція</TableHead>
                  <TableHead>Групи</TableHead>
                  <TableHead className="text-right">Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.name}</TableCell>
                    <TableCell>{getTypeBadge(resource.type)}</TableCell>
                    <TableCell>{resource.integration}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {resource.groups.map((group, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {resource.url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
