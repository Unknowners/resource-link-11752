import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Briefcase, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  domain: string | null;
  plan: string;
  status: string;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export default function AdminOrgDetail() {
  const { orgId } = useParams();
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) {
      loadOrganizationDetails();
    }
  }, [orgId]);

  const loadOrganizationDetails = async () => {
    try {
      setLoading(true);

      // Load organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (orgError) throw orgError;
      setOrg(orgData);

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgId);

      if (membersError) throw membersError;

      // Get profiles for members
      const userIds = membersData?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      const membersWithProfiles = (membersData || []).map(member => {
        const profile = profiles?.find(p => p.id === member.user_id);
        return {
          ...member,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          email: profile?.email,
        };
      });

      setMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error loading organization details:', error);
      toast.error("Помилка завантаження даних організації");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">Завантаження...</div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">Організацію не знайдено</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/orgs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад до організацій
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="font-display mb-2">{org.name}</h1>
        <p className="text-muted-foreground text-lg">
          Деталі організації та члени команди
        </p>
      </div>

      {/* Organization Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">План</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {org.plan === 'starter' ? 'Starter' : 
               org.plan === 'professional' ? 'Professional' : 'Enterprise'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Користувачів</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{members.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Дата створення</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Date(org.created_at).toLocaleDateString('uk-UA')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Organization Details */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Інформація</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Домен</p>
              <p className="font-medium">{org.domain || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Статус</p>
              <Badge 
                variant="outline" 
                className={org.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
              >
                {org.status === 'active' ? 'Активна' : 'Неактивна'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Члени організації</CardTitle>
          <CardDescription>
            Список всіх користувачів в організації
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Членів не знайдено
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ім'я</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Дата приєднання</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.first_name && member.last_name 
                        ? `${member.first_name} ${member.last_name}`
                        : member.email}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                        {member.role === 'owner' ? 'Власник' : 
                         member.role === 'admin' ? 'Адмін' : 'Член'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString('uk-UA')}
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
