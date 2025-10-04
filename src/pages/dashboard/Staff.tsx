import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, MoreVertical, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
  groups: string[];
}

interface Group {
  id: string;
  name: string;
  description: string;
}

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffMember | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  useEffect(() => {
    loadStaff();
    loadGroups();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      
      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!member) return;
      setOrganizationId(member.organization_id);

      // Get all members of the organization
      const { data: members } = await supabase
        .from('organization_members')
        .select('user_id, role')
        .eq('organization_id', member.organization_id);

      if (!members) return;

      // Get profiles for all members
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', members.map(m => m.user_id));

      if (!profiles) return;

      // Get group memberships
      const { data: groupMemberships } = await supabase
        .from('group_members')
        .select('user_id, group_id, groups(name)')
        .in('user_id', members.map(m => m.user_id));

      // Combine data
      const staffData: StaffMember[] = profiles.map(profile => {
        const memberRole = members.find(m => m.user_id === profile.id);
        const userGroups = groupMemberships
          ?.filter(gm => gm.user_id === profile.id)
          .map(gm => (gm.groups as any)?.name)
          .filter(Boolean) || [];

        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          role: memberRole?.role || 'member',
          groups: userGroups
        };
      });

      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.error("Помилка завантаження співробітників");
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!member) return;

      const { data: groups } = await supabase
        .from('groups')
        .select('*')
        .eq('organization_id', member.organization_id);

      if (groups) {
        setAllGroups(groups);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleEditUser = async (user: StaffMember) => {
    setEditingUser(user);
    
    // Get current user's groups
    const { data: userGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);

    const groupIds = new Set(userGroups?.map(g => g.group_id) || []);
    setSelectedGroups(groupIds);
    setIsEditDialogOpen(true);
  };

  const handleSaveUserGroups = async () => {
    if (!editingUser) return;

    try {
      // Get current groups
      const { data: currentGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', editingUser.id);

      const currentGroupIds = new Set(currentGroups?.map(g => g.group_id) || []);

      // Find groups to add and remove
      const groupsToAdd = Array.from(selectedGroups).filter(id => !currentGroupIds.has(id));
      const groupsToRemove = Array.from(currentGroupIds).filter(id => !selectedGroups.has(id));

      // Add user to new groups
      if (groupsToAdd.length > 0) {
        const { error: addError } = await supabase
          .from('group_members')
          .insert(groupsToAdd.map(group_id => ({
            group_id,
            user_id: editingUser.id
          })));

        if (addError) throw addError;
      }

      // Remove user from groups
      if (groupsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('group_members')
          .delete()
          .eq('user_id', editingUser.id)
          .in('group_id', groupsToRemove);

        if (removeError) throw removeError;
      }

      toast.success("Групи користувача оновлено");
      setIsEditDialogOpen(false);
      setEditingUser(null);
      loadStaff();
    } catch (error) {
      console.error('Error updating user groups:', error);
      toast.error("Помилка оновлення груп");
    }
  };

  const toggleGroup = (groupId: string) => {
    const newSelectedGroups = new Set(selectedGroups);
    if (newSelectedGroups.has(groupId)) {
      newSelectedGroups.delete(groupId);
    } else {
      newSelectedGroups.add(groupId);
    }
    setSelectedGroups(newSelectedGroups);
  };

  const handleInviteUser = async () => {
    if (!organizationId || !inviteEmail) {
      toast.error("Введіть email");
      return;
    }

    try {
      // Check if user already exists in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .maybeSingle();

      if (!existingProfile) {
        toast.error("Користувач з таким email не зареєстрований в системі");
        return;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('user_id', existingProfile.id)
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (existingMember) {
        toast.error("Користувач вже є членом організації");
        return;
      }

      // Add user to organization
      const { error } = await supabase
        .from('organization_members')
        .insert({
          user_id: existingProfile.id,
          organization_id: organizationId,
          role: inviteRole
        });

      if (error) throw error;

      toast.success("Користувача додано до організації");
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      loadStaff();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error("Помилка додавання користувача");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!organizationId) return;
    
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('user_id', userId)
        .eq('organization_id', organizationId);

      if (error) throw error;

      toast.success("Користувача видалено");
      loadStaff();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error("Помилка видалення користувача");
    }
  };

  const filteredStaff = staff.filter(member =>
    `${member.first_name} ${member.last_name} ${member.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`;
  };

  const getRoleBadge = (role: string) => {
    return role === "Org Admin" ? (
      <Badge variant="default">Admin</Badge>
    ) : (
      <Badge variant="secondary">Member</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Pending
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="mb-2">Staff</h1>
          <p className="text-muted-foreground">
            Manage team members and their access
          </p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Пошук користувачів..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Завантаження...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Користувачів не знайдено
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Користувач</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Групи</TableHead>
                  <TableHead className="text-right">Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(user.first_name || '', user.last_name || '')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.groups.map((group, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редагувати
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMember(user.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Видалити
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Запросити користувача</DialogTitle>
            <DialogDescription>
              Додайте існуючого користувача до вашої організації
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Роль</Label>
              <select
                id="role"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleInviteUser}>
                Запросити
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редагувати користувача</DialogTitle>
            <DialogDescription>
              Управління групами для {editingUser?.first_name} {editingUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-base mb-3 block">Групи</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                {allGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Немає доступних груп
                  </p>
                ) : (
                  allGroups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={selectedGroups.has(group.id)}
                        onCheckedChange={() => toggleGroup(group.id)}
                      />
                      <label
                        htmlFor={`group-${group.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        <div>{group.name}</div>
                        {group.description && (
                          <div className="text-xs text-muted-foreground">{group.description}</div>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleSaveUserGroups}>
                Зберегти
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
