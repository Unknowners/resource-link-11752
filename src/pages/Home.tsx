import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Shield, Zap, Users, Link as LinkIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6">
              <span className="gradient-text">Unified Workspace</span>
              <br />
              Management for Teams
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Connect Jira, Confluence, Notion, and Google Drive in one place. 
              Streamline access control and empower your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Book a Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mb-4">Everything you need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features to manage your organization's workspace integrations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <LinkIcon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Unified Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect all your tools - Jira, Confluence, Notion, and Google Drive in one dashboard
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Advanced Access Control</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Group-based permissions with granular control over resources and teams
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Team Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Easily manage staff, create groups, and assign roles with intuitive controls
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real-time Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Keep your resources updated with automatic synchronization across all platforms
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mb-4">Integrations</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with the tools your team already uses
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {["Jira", "Confluence", "Notion", "Google Drive"].map((tool) => (
              <div
                key={tool}
                className="flex items-center justify-center p-8 bg-card rounded-lg border"
              >
                <span className="text-xl font-semibold">{tool}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center glass-card rounded-2xl p-12">
            <h2 className="mb-4">Ready to get started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join teams streamlining their workspace management
            </p>
            <Button size="lg" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
