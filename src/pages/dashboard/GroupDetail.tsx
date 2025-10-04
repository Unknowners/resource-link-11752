import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Users, FolderOpen, Plus, Trash2, ExternalLink, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Group {
  id: string;
  name: string;
  description: string;
}

interface Member {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  integration: string;
  url: string | null;
  status?: string;
}

interface OrganizationMember {
  user_id: string;
  profiles: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [availableMembers, setAvailableMembers] = useState<OrganizationMember[]>([]);
  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedResource, setSelectedResource] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("");
  const [resourceIntegrationFilter, setResourceIntegrationFilter] = useState("");

  const filteredMembers = useMemo(() => {
    if (!memberSearch) return availableMembers;
    const search = memberSearch.toLowerCase();
    return availableMembers.filter(member => 
      member.profiles.email.toLowerCase().includes(search) ||
      member.profiles.first_name?.toLowerCase().includes(search) ||
      member.profiles.last_name?.toLowerCase().includes(search)
    );
  }, [availableMembers, memberSearch]);

  const filteredResources = useMemo(() => {
    let filtered = availableResources;

    // Filter by type
    if (resourceTypeFilter) {
      filtered = filtered.filter(resource => resource.type === resourceTypeFilter);
    }

    // Filter by integration
    if (resourceIntegrationFilter) {
      filtered = filtered.filter(resource => resource.integration === resourceIntegrationFilter);
    }

    // Filter by search text
    if (resourceSearch) {
      const search = resourceSearch.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(search) ||
        resource.type.toLowerCase().includes(search) ||
        resource.integration.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [availableResources, resourceSearch, resourceTypeFilter, resourceIntegrationFilter]);

  const uniqueResourceTypes = useMemo(() => {
    const types = new Set(availableResources.map(r => r.type));
    return Array.from(types).sort();
  }, [availableResources]);

  const uniqueIntegrations = useMemo(() => {
    const integrations = new Set(availableResources.map(r => r.integration));
    return Array.from(integrations).sort();
  }, [availableResources]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMember) return;
      setOrganizationId(orgMember.organization_id);

      const { data: groupData } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();
      
      if (groupData) setGroup(groupData);

      const { data: groupMembersData } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', id);

      if (groupMembersData && groupMembersData.length > 0) {
        const memberUserIds = groupMembersData.map(m => m.user_id);
        
        const { data: memberProfiles } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .in('id', memberUserIds);

        if (memberProfiles) {
          const formattedMembers = memberProfiles.map((p) => ({
            id: p.id,
            email: p.email || '',
            first_name: p.first_name,
            last_name: p.last_name,
          }));
          setMembers(formattedMembers);
        }
      } else {
        setMembers([]);
      }

      const { data: groupResourcesData } = await supabase
        .from('resource_permissions')
        .select('resource_id')
        .eq('group_id', id);

      if (groupResourcesData && groupResourcesData.length > 0) {
        const resourceIds = groupResourcesData.map(r => r.resource_id);
        
        const { data: resourceData } = await supabase
          .from('resources')
          .select('id, name, type, integration, url, status')
          .in('id', resourceIds);

        if (resourceData) {
          setResources(resourceData);
        }
      } else {
        setResources([]);
      }

      const { data: orgMembers } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', orgMember.organization_id);

      if (orgMembers) {
        const memberIds = new Set(groupMembersData?.map((m: any) => m.user_id) || []);
        const availableUserIds = orgMembers
          .filter((m) => !memberIds.has(m.user_id))
          .map((m) => m.user_id);
        
        if (availableUserIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name')
            .in('id', availableUserIds);

          if (profilesData) {
            const available = profilesData.map((p) => ({
              user_id: p.id,
              profiles: {
                email: p.email || '',
                first_name: p.first_name,
                last_name: p.last_name,
              },
            }));
            setAvailableMembers(available);
          }
        } else {
          setAvailableMembers([]);
        }
      }

      const { data: allResources } = await supabase
        .from('resources')
        .select('*')
        .eq('organization_id', orgMember.organization_id)
        .eq('status', 'active');

      if (allResources) {
        const assignedResourceIds = new Set(groupResourcesData?.map((r: any) => r.resource_id) || []);
        const available = allResources.filter((r) => !assignedResourceIds.has(r.id));
        setAvailableResources(available);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMember || !id) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: id,
          user_id: selectedMember,
        });

      if (error) throw error;

      toast.success('Учасника додано до групи');
      setIsMemberDialogOpen(false);
      setSelectedMember("");
      setMemberSearch("");
      loadData();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Помилка додавання учасника');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', id)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Учасника видалено з групи');
      loadData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Помилка видалення учасника');
    }
  };

  const handleAddResource = async () => {
    if (!selectedResource || !id) return;

    try {
      const { error } = await supabase
        .from('resource_permissions')
        .insert({
          group_id: id,
          resource_id: selectedResource,
        });

      if (error) throw error;

      toast.success('Ресурс додано до групи');
      setIsResourceDialogOpen(false);
      setSelectedResource("");
      setResourceSearch("");
      setResourceTypeFilter("");
      setResourceIntegrationFilter("");
      loadData();
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Помилка додавання ресурсу');
    }
  };

  const handleRemoveResource = async (resourceId: string) => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('resource_permissions')
        .delete()
        .eq('group_id', id)
        .eq('resource_id', resourceId);

      if (error) throw error;

      toast.success('Ресурс видалено з групи');
      loadData();
    } catch (error) {
      console.error('Error removing resource:', error);
      toast.error('Помилка видалення ресурсу');
    }
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      jira_project: { label: "Jira Project", variant: "default" },
      confluence_space: { label: "Confluence", variant: "secondary" },
      atlassian_site: { label: "Atlassian Site", variant: "outline" },
    };
    const badge = badges[type] || { label: type, variant: "outline" as const };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'active') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Активний</Badge>;
    }
    if (status === 'removed') {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Видалено</Badge>;
    }
    return <Badge variant="secondary">Невідомий</Badge>;
  };

  if (loading) {
    return <div className="p-8">Завантаження...</div>;
  }

  if (!group) {
    return <div className="p-8">Групу не знайдено</div>;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/app/groups">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-display">{group.name}</h1>
          <p className="text-muted-foreground text-lg mt-1">
            {group.description}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Учасників</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{members.length}</div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ресурсів</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{resources.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="members">Учасники</TabsTrigger>
          <TabsTrigger value="resources">Ресурси</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card className="border-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Учасники групи</CardTitle>
                  <CardDescription>Користувачі з доступом до ресурсів цієї групи</CardDescription>
                </div>
                <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={availableMembers.length === 0}>
                      <Plus className="mr-2 h-4 w-4" />
                      Додати
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Додати учасника</DialogTitle>
                      <DialogDescription>
                        Виберіть користувача для додавання до групи
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Пошук учасника</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Шукати за іменем або email..."
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Виберіть користувача ({filteredMembers.length})</Label>
                        <ScrollArea className="h-64 border rounded-md">
                          <div className="p-2 space-y-1">
                            {filteredMembers.map((member) => (
                              <Button
                                key={member.user_id}
                                variant={selectedMember === member.user_id ? "secondary" : "ghost"}
                                className="w-full justify-start text-left"
                                onClick={() => setSelectedMember(member.user_id)}
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {member.profiles.first_name?.[0]}{member.profiles.last_name?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium truncate">
                                      {member.profiles.first_name} {member.profiles.last_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {member.profiles.email}
                                    </p>
                                  </div>
                                </div>
                              </Button>
                            ))}
                            {filteredMembers.length === 0 && (
                              <div className="text-center py-8 text-muted-foreground text-sm">
                                Нічого не знайдено
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                      <Button onClick={handleAddMember} disabled={!selectedMember} className="w-full">
                        Додати учасника
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Користувач</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.first_name?.[0]}{member.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {member.first_name} {member.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {members.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Немає учасників
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card className="border-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Ресурси групи</CardTitle>
                  <CardDescription>Ресурси доступні учасникам групи</CardDescription>
                </div>
                <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={availableResources.length === 0}>
                      <Plus className="mr-2 h-4 w-4" />
                      Додати
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Додати ресурс</DialogTitle>
                      <DialogDescription>
                        Виберіть ресурс для додавання до групи
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Тип ресурсу</Label>
                          <select
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            value={resourceTypeFilter}
                            onChange={(e) => setResourceTypeFilter(e.target.value)}
                          >
                            <option value="">Всі типи</option>
                            {uniqueResourceTypes.map((type) => (
                              <option key={type} value={type}>
                                {type === 'jira_project' ? 'Jira Project' :
                                 type === 'confluence_space' ? 'Confluence' :
                                 type === 'atlassian_site' ? 'Atlassian Site' : type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Інтеграція</Label>
                          <select
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            value={resourceIntegrationFilter}
                            onChange={(e) => setResourceIntegrationFilter(e.target.value)}
                          >
                            <option value="">Всі інтеграції</option>
                            {uniqueIntegrations.map((integration) => (
                              <option key={integration} value={integration}>
                                {integration}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label>Пошук ресурсу</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Шукати за назвою..."
                            value={resourceSearch}
                            onChange={(e) => setResourceSearch(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Виберіть ресурс ({filteredResources.length})</Label>
                        <ScrollArea className="h-80 border rounded-md mt-2">
                          <div className="p-3 space-y-2">
                            {filteredResources.map((resource) => (
                              <Button
                                key={resource.id}
                                variant={selectedResource === resource.id ? "secondary" : "ghost"}
                                className="w-full justify-start text-left h-auto py-3 px-4"
                                onClick={() => setSelectedResource(resource.id)}
                              >
                                <div className="flex-1 overflow-hidden space-y-2">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate flex-1">
                                      {resource.name}
                                    </p>
                                    {getTypeBadge(resource.type)}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    📦 {resource.integration}
                                  </p>
                                </div>
                              </Button>
                            ))}
                            {filteredResources.length === 0 && (
                              <div className="text-center py-12 text-muted-foreground text-sm">
                                Нічого не знайдено
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                      <Button onClick={handleAddResource} disabled={!selectedResource} className="w-full">
                        Додати ресурс
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Назва</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Інтеграція</TableHead>
                    <TableHead className="text-right">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.name}</TableCell>
                      <TableCell>{getTypeBadge(resource.type)}</TableCell>
                      <TableCell>{getStatusBadge(resource.status)}</TableCell>
                      <TableCell>{resource.integration}</TableCell>
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
                            onClick={() => handleRemoveResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {resources.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Немає ресурсів
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
