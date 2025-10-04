import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, ExternalLink, Filter } from "lucide-react";

export default function Search() {
  const results = [
    {
      id: "1",
      name: "Project Alpha",
      type: "jiraProject",
      provider: "Jira",
      url: "#",
      groups: ["Engineering", "Product"],
    },
    {
      id: "2",
      name: "Engineering Wiki",
      type: "confluenceSpace",
      provider: "Confluence",
      url: "#",
      groups: ["Engineering"],
    },
    {
      id: "3",
      name: "Product Roadmap",
      type: "notionSpace",
      provider: "Notion",
      url: "#",
      groups: ["Product", "Leadership"],
    },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display">Пошук ресурсів</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Знайдіть потрібні проекти, документи та папки
        </p>
      </div>

      {/* Search */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Пошук за назвою, типом або провайдером..." 
                className="pl-10 h-12 text-base"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48 h-12">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Всі типи" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі типи</SelectItem>
                <SelectItem value="jira">Jira</SelectItem>
                <SelectItem value="confluence">Confluence</SelectItem>
                <SelectItem value="notion">Notion</SelectItem>
                <SelectItem value="gdrive">Google Drive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Назва</TableHead>
                <TableHead>Провайдер</TableHead>
                <TableHead>Групи</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{result.provider}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {result.groups.map((group) => (
                        <Badge key={group} variant="secondary" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
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
