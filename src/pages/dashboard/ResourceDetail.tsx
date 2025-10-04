import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ExternalLink, RefreshCw, Users, Calendar } from "lucide-react";

export default function ResourceDetail() {
  const { id } = useParams();

  const resource = {
    name: "Project Alpha",
    type: "Jira Project",
    provider: "Jira",
    externalId: "PROJ",
    url: "https://jira.atlassian.net/browse/PROJ",
    lastSync: "2 години тому",
    status: "connected",
  };

  const groups = [
    { name: "Engineering", access: "Admin", members: 8 },
    { name: "Product", access: "Read", members: 4 },
  ];

  const history = [
    { timestamp: "2025-01-15 14:32", action: "Синхронізовано", actor: "System" },
    { timestamp: "2025-01-15 10:15", action: "Призначено групу Engineering", actor: "Іван Петренко" },
    { timestamp: "2025-01-14 16:20", action: "Ресурс додано", actor: "Admin" },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/app/resources">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display">{resource.name}</h1>
            <Badge variant="outline">{resource.type}</Badge>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              {resource.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            {resource.provider} • {resource.externalId}
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Відкрити в {resource.provider}
          </a>
        </Button>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Синхронізувати
        </Button>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Провайдер</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resource.provider}</div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Остання синхронізація</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resource.lastSync}</div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Груп з доступом</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Groups */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Призначені групи</CardTitle>
          <CardDescription>Групи з доступом до цього ресурсу</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Група</TableHead>
                <TableHead>Рівень доступу</TableHead>
                <TableHead>Учасників</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.name}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    <Badge>{group.access}</Badge>
                  </TableCell>
                  <TableCell>{group.members}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Історія змін</CardTitle>
          <CardDescription>Останні дії з цим ресурсом</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Час</TableHead>
                <TableHead>Дія</TableHead>
                <TableHead>Користувач</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((event, index) => (
                <TableRow key={index}>
                  <TableCell className="text-sm text-muted-foreground">
                    {event.timestamp}
                  </TableCell>
                  <TableCell>{event.action}</TableCell>
                  <TableCell className="font-medium">{event.actor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
