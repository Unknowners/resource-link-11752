import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Users, FolderOpen, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function GroupDetail() {
  const { id } = useParams();

  const members = [
    { id: "1", name: "Іван Петренко", email: "ivan@demo.com" },
    { id: "2", name: "Олена Коваль", email: "olena@demo.com" },
  ];

  const resources = [
    { id: "1", name: "Project Alpha", type: "Jira", access: "Admin" },
    { id: "2", name: "Engineering Wiki", type: "Confluence", access: "Read" },
  ];

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
          <h1 className="font-display">Engineering</h1>
          <p className="text-muted-foreground text-lg mt-1">
            Development and technical teams
          </p>
        </div>
        <Button variant="outline">Редагувати</Button>
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Додати
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
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
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.email}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
                  <CardTitle className="text-xl">Призначені ресурси</CardTitle>
                  <CardDescription>Проекти та документи з доступом</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Призначити
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Назва</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Рівень доступу</TableHead>
                    <TableHead className="text-right">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{resource.access}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
