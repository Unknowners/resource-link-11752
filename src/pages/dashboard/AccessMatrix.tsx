import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";

export default function AccessMatrix() {
  const groups = ["Engineering", "Product", "Marketing", "Leadership"];
  const resources = [
    { name: "Project Alpha", type: "Jira" },
    { name: "Engineering Wiki", type: "Confluence" },
    { name: "Product Roadmap", type: "Notion" },
    { name: "Marketing Assets", type: "Google Drive" },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display">Матриця доступів</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Управління правами груп до ресурсів
          </p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Зберегти зміни
        </Button>
      </div>

      {/* Matrix */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Групи × Ресурси</CardTitle>
          <CardDescription>
            Відмітьте доступи для кожної комбінації групи та ресурсу
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Ресурс</TableHead>
                {groups.map((group) => (
                  <TableHead key={group} className="text-center">{group}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.name}>
                  <TableCell className="font-medium">
                    <div>
                      {resource.name}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                  </TableCell>
                  {groups.map((group) => (
                    <TableCell key={`${resource.name}-${group}`} className="text-center">
                      <Checkbox />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
