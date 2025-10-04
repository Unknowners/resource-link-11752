import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Building2, Users, Link2, FileText, LogOut, Sparkles, Shield } from "lucide-react";

const navigation = [
  { name: "Організації", href: "/admin/orgs", icon: Building2 },
  { name: "Користувачі", href: "/admin/users", icon: Users },
  { name: "Інтеграції", href: "/admin/integrations", icon: Link2 },
  { name: "Аудит", href: "/admin/audit", icon: FileText },
];

export default function AdminLayout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-50" />
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-display font-bold">DocuMinds</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-semibold">Super Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-base" asChild>
            <Link to="/">
              <LogOut className="mr-2 h-5 w-5" />
              Вийти
            </Link>
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
