import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Users, FolderOpen, Plus, Trash2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get organization
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMember) return;
      setOrganizationId(orgMember.organization_id);

      // Load group
      const { data: groupData } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();
      
      if (groupData) setGroup(groupData);

      // Load group members
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

      // Load group resources
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

      // Load available members (org members not in group)
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
          // Get profiles for available users
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

      // Load available resources (org resources not in group)
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Додати учасника</DialogTitle>
                      <DialogDescription>
                        Виберіть користувача для додавання до групи
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Користувач</Label>
                        <Select value={selectedMember} onValueChange={setSelectedMember}>
                          <SelectTrigger>
                            <SelectValue placeholder="Виберіть користувача" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableMembers.map((member) => (
                              <SelectItem key={member.user_id} value={member.user_id}>
                                {member.profiles.first_name} {member.profiles.last_name} ({member.profiles.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddMember} className="w-full">
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Додати ресурс</DialogTitle>
                      <DialogDescription>
                        Виберіть ресурс для додавання до групи
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Ресурс</Label>
                        <Select value={selectedResource} onValueChange={setSelectedResource}>
                          <SelectTrigger>
                            <SelectValue placeholder="Виберіть ресурс" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableResources.map((resource) => (
                              <SelectItem key={resource.id} value={resource.id}>
                                {resource.name} ({resource.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddResource} className="w-full">
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
