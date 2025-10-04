import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";

export default function Groups() {
  const groups = [
    {
      id: "1",
      name: "Engineering",
      description: "Development and technical teams",
      memberCount: 8,
      resourceCount: 12,
    },
    {
      id: "2",
      name: "Product",
      description: "Product management and design",
      memberCount: 4,
      resourceCount: 8,
    },
    {
      id: "3",
      name: "Marketing",
      description: "Marketing and communications",
      memberCount: 3,
      resourceCount: 5,
    },
    {
      id: "4",
      name: "Leadership",
      description: "Executive team",
      memberCount: 2,
      resourceCount: 15,
    },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="mb-2">Groups</h1>
          <p className="text-muted-foreground">
            Organize your team and manage resource access
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <CardTitle className="mt-4">{group.name}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div>
                  <p className="text-2xl font-bold">{group.memberCount}</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
                <div className="border-l pl-4">
                  <p className="text-2xl font-bold">{group.resourceCount}</p>
                  <p className="text-xs text-muted-foreground">Resources</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State for new users */}
      <Card className="glass-card border-dashed">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle>Create your first group</CardTitle>
          <CardDescription>
            Groups help you organize team members and control access to resources
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
