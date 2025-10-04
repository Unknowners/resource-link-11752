import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Users, Link2, CheckCircle2 } from "lucide-react";

export default function Overview() {
  const stats = [
    {
      name: "Total Resources",
      value: "24",
      icon: FolderOpen,
      description: "Across all integrations",
    },
    {
      name: "Active Users",
      value: "12",
      icon: Users,
      description: "Team members",
    },
    {
      name: "Integrations",
      value: "4",
      icon: Link2,
      description: "Connected services",
    },
    {
      name: "Groups",
      value: "5",
      icon: CheckCircle2,
      description: "Active groups",
    },
  ];

  const recentActivity = [
    { user: "John Doe", action: "added a new resource", resource: "Project Alpha", time: "2 hours ago" },
    { user: "Jane Smith", action: "invited", resource: "Mike Johnson", time: "5 hours ago" },
    { user: "Admin", action: "connected", resource: "Jira integration", time: "1 day ago" },
    { user: "Sarah Lee", action: "created group", resource: "Marketing Team", time: "2 days ago" },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your organization.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.action}{" "}
                    <span className="font-medium">{activity.resource}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Connect Integration</CardTitle>
            <CardDescription>
              Add Jira, Confluence, Notion, or Google Drive
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-card cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Invite Team Members</CardTitle>
            <CardDescription>Add new users to your organization</CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-card cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Create Group</CardTitle>
            <CardDescription>Organize your team into groups</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
