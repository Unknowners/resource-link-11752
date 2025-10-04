import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Link as LinkIcon, Zap, Lock, BarChart3, FileText, Bell } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: LinkIcon,
      title: "Unified Workspace Integration",
      description: "Connect and manage Jira, Confluence, Notion, and Google Drive from a single dashboard. Seamlessly navigate between all your tools.",
    },
    {
      icon: Shield,
      title: "Role-Based Access Control",
      description: "Define granular permissions with multi-level access control. Org Admins, Members, and Super Admins each have appropriate access levels.",
    },
    {
      icon: Users,
      title: "Group Management",
      description: "Create groups, assign members, and map resources with ease. Control who sees what with flexible group-based permissions.",
    },
    {
      icon: Zap,
      title: "Real-time Synchronization",
      description: "Keep your resources up-to-date with automatic syncing. Manual refresh available anytime you need instant updates.",
    },
    {
      icon: Lock,
      title: "Secure OAuth Integration",
      description: "Industry-standard OAuth authentication ensures your credentials stay safe. We only store reference data, never your content.",
    },
    {
      icon: BarChart3,
      title: "Audit & Compliance",
      description: "Track every action with comprehensive audit logs. Know who accessed what, when, and how for complete transparency.",
    },
    {
      icon: FileText,
      title: "Resource Mapping",
      description: "Easily map Jira projects, Confluence spaces, Notion pages, and Drive folders to your organizational structure.",
    },
    {
      icon: Bell,
      title: "Activity Notifications",
      description: "Stay informed with real-time notifications about access changes, new resources, and team updates.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="py-20 sm:py-32" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6">
              <span className="gradient-text">Powerful Features</span>
              <br />
              for Modern Teams
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to manage workspace access and integrations at scale
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="glass-card">
                  <CardHeader>
                    <Icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple onboarding process
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="mb-2">Create Your Organization</h3>
                <p className="text-muted-foreground">
                  Sign up and set up your organization profile. Define your domain and workspace settings.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="mb-2">Connect Your Tools</h3>
                <p className="text-muted-foreground">
                  Link your Jira, Confluence, Notion, and Google Drive accounts through secure OAuth authentication.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="mb-2">Organize Your Team</h3>
                <p className="text-muted-foreground">
                  Invite team members, create groups, and assign appropriate roles and permissions.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="mb-2">Map Resources & Start Working</h3>
                <p className="text-muted-foreground">
                  Assign projects, spaces, and folders to groups. Your team can now access everything they need from one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
