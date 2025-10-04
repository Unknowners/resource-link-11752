import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminOrgs() {
  const orgs = [
    { id: "1", name: "Demo Organization", plan: "Professional", users: 12, integrations: 4, status: "active" },
    { id: "2", name: "Tech Corp", plan: "Enterprise", users: 150, integrations: 4, status: "active" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-display">Організації</h1>
        <p className="text-muted-foreground text-lg mt-2">Управління всіма організаціями</p>
      </div>

      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Пошук організацій..." className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Назва</TableHead>
                <TableHead>План</TableHead>
                <TableHead>Користувачів</TableHead>
                <TableHead>Інтеграцій</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell><Badge>{org.plan}</Badge></TableCell>
                  <TableCell>{org.users}</TableCell>
                  <TableCell>{org.integrations}</TableCell>
                  <TableCell><Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/orgs/${org.id}`}>Переглянути</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
