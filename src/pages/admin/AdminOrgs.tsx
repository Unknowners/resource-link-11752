import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  plan: string;
  status: string;
  created_at: string;
  member_count?: number;
}

export default function AdminOrgs() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      
      const { data: organizations, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;

      // Get member counts
      const { data: memberCounts, error: membersError } = await supabase
        .from('organization_members')
        .select('organization_id');

      if (membersError) throw membersError;

      const orgsWithCounts = (organizations || []).map(org => ({
        ...org,
        member_count: memberCounts?.filter(m => m.organization_id === org.id).length || 0
      }));

      setOrgs(orgsWithCounts);
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error("Помилка завантаження організацій");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = orgs.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-display">Організації</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Управління всіма організаціями
        </p>
      </div>

      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Пошук організацій..." 
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
          ) : filteredOrgs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="mb-4">Організацій не знайдено</p>
              <Button>Створити організацію</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Назва</TableHead>
                  <TableHead>План</TableHead>
                  <TableHead>Користувачів</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата створення</TableHead>
                  <TableHead className="text-right">Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>
                      <Badge>
                        {org.plan === 'starter' ? 'Starter' : 
                         org.plan === 'professional' ? 'Professional' : 'Enterprise'}
                      </Badge>
                    </TableCell>
                    <TableCell>{org.member_count}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={org.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
                      >
                        {org.status === 'active' ? 'Активна' : 'Неактивна'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(org.created_at).toLocaleDateString('uk-UA')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/orgs/${org.id}`}>Переглянути</Link>
                      </Button>
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
