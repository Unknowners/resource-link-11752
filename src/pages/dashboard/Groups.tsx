import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Trash2, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Group {
  id: string;
  name: string;
  description: string | null;
  member_count?: number;
  resource_count?: number;
}

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
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

      const { data: groupsData, error } = await supabase
        .from('groups')
        .select('*')
        .eq('organization_id', member.organization_id);

      if (error) throw error;

      // Get member counts
      const { data: memberCounts } = await supabase
        .from('group_members')
        .select('group_id');

      // Get resource counts
      const { data: resourceCounts } = await supabase
        .from('resource_permissions')
        .select('group_id');

      const groupsWithCounts = (groupsData || []).map(group => ({
        ...group,
        member_count: memberCounts?.filter(m => m.group_id === group.id).length || 0,
        resource_count: resourceCounts?.filter(r => r.group_id === group.id).length || 0,
      }));

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error("Помилка завантаження груп");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!organizationId) return;
    
    try {
      const { error } = await supabase
        .from('groups')
        .insert({
          organization_id: organizationId,
          name: formData.name,
          description: formData.description,
        });

      if (error) throw error;

      toast.success("Групу створено");
      setIsDialogOpen(false);
      setFormData({ name: "", description: "" });
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error("Помилка створення групи");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast.success("Групу видалено");
      loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error("Помилка видалення групи");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="mb-2">Групи</h1>
          <p className="text-muted-foreground">
            Організуйте команду та керуйте доступом до ресурсів
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Створити групу
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Створити нову групу</DialogTitle>
              <DialogDescription>
                Додайте назву та опис для нової групи
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Назва</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Engineering"
                />
              </div>
              <div>
                <Label htmlFor="description">Опис</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Команда розробки та технічні спеціалісти"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleCreateGroup} disabled={!formData.name}>
                Створити
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">
          Завантаження...
        </div>
      ) : groups.length === 0 ? (
        <Card className="glass-card border-dashed">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Створіть вашу першу групу</CardTitle>
            <CardDescription>
              Групи допомагають організувати членів команди та контролювати доступ до ресурсів
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Створити групу
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/app/groups/${group.id}`)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-4">{group.name}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div>
                    <p className="text-2xl font-bold">{group.member_count}</p>
                    <p className="text-xs text-muted-foreground">Членів</p>
                  </div>
                  <div className="border-l pl-4">
                    <p className="text-2xl font-bold">{group.resource_count}</p>
                    <p className="text-xs text-muted-foreground">Ресурсів</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
