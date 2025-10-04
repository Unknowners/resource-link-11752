import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink } from "lucide-react";

export default function Resources() {
  const resources = [
    {
      id: "1",
      name: "Project Alpha",
      type: "jiraProject",
      integration: "Jira",
      url: "#",
      groups: ["Engineering", "Product"],
    },
    {
      id: "2",
      name: "Engineering Wiki",
      type: "confluenceSpace",
      integration: "Confluence",
      url: "#",
      groups: ["Engineering"],
    },
    {
      id: "3",
      name: "Product Roadmap",
      type: "notionSpace",
      integration: "Notion",
      url: "#",
      groups: ["Product", "Leadership"],
    },
    {
      id: "4",
      name: "Marketing Assets",
      type: "gdriveFolder",
      integration: "Google Drive",
      url: "#",
      groups: ["Marketing"],
    },
  ];

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      jiraProject: { label: "Jira Project", variant: "default" },
      confluenceSpace: { label: "Confluence", variant: "secondary" },
      notionSpace: { label: "Notion", variant: "outline" },
      gdriveFolder: { label: "Google Drive", variant: "default" },
    };
    const badge = badges[type] || { label: type, variant: "outline" as const };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2">Resources</h1>
        <p className="text-muted-foreground">
          Manage and view all integrated resources from your connected services
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search resources..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="jira">Jira</SelectItem>
                <SelectItem value="confluence">Confluence</SelectItem>
                <SelectItem value="notion">Notion</SelectItem>
                <SelectItem value="gdrive">Google Drive</SelectItem>
              </SelectContent>
            </Select>
            <Button>Sync All</Button>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Integration</TableHead>
                <TableHead>Groups</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.name}</TableCell>
                  <TableCell>{getTypeBadge(resource.type)}</TableCell>
                  <TableCell>{resource.integration}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {resource.groups.map((group) => (
                        <Badge key={group} variant="outline" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
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
