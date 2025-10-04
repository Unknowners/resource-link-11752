import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";

export default function Integrations() {
  const integrations = [
    {
      id: "jira",
      name: "Jira",
      description: "Project management and issue tracking",
      status: "connected",
      lastSync: "2 hours ago",
      resourceCount: 8,
    },
    {
      id: "confluence",
      name: "Confluence",
      description: "Team collaboration and documentation",
      status: "connected",
      lastSync: "1 hour ago",
      resourceCount: 6,
    },
    {
      id: "notion",
      name: "Notion",
      description: "All-in-one workspace",
      status: "connected",
      lastSync: "30 minutes ago",
      resourceCount: 5,
    },
    {
      id: "gdrive",
      name: "Google Drive",
      description: "Cloud storage and file sharing",
      status: "error",
      lastSync: "Failed",
      resourceCount: 0,
      error: "Authentication expired. Please reconnect.",
    },
  ];

  const availableIntegrations = [
    {
      id: "slack",
      name: "Slack",
      description: "Team communication platform",
      comingSoon: true,
    },
    {
      id: "github",
      name: "GitHub",
      description: "Code hosting and collaboration",
      comingSoon: true,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2">Integrations</h1>
        <p className="text-muted-foreground">
          Connect and manage your workspace integrations
        </p>
      </div>

      {/* Connected Integrations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Connected Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {integration.name}
                      {getStatusBadge(integration.status)}
                    </CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {integration.status === "error" ? (
                  <div className="space-y-4">
                    <p className="text-sm text-destructive">{integration.error}</p>
                    <Button variant="outline" className="w-full">
                      Reconnect
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last synced</span>
                      <span className="font-medium">{integration.lastSync}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resources</span>
                      <span className="font-medium">{integration.resourceCount}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync Now
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Settings
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Integrations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableIntegrations.map((integration) => (
            <Card key={integration.id} className="glass-card border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {integration.name}
                  {integration.comingSoon && (
                    <Badge variant="secondary">Coming Soon</Badge>
                  )}
                </CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled={integration.comingSoon}>
                  {integration.comingSoon ? "Coming Soon" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
