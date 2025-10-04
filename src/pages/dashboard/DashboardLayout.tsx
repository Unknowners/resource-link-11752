import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  UserCog,
  Link2,
  FileText,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

const navigation = [
  { name: "Огляд", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ресурси", href: "/dashboard/resources", icon: FolderOpen },
  { name: "Групи", href: "/dashboard/groups", icon: Users },
  { name: "Команда", href: "/dashboard/staff", icon: UserCog },
  { name: "Інтеграції", href: "/dashboard/integrations", icon: Link2 },
  { name: "Аудит-лог", href: "/dashboard/audit", icon: FileText },
  { name: "Налаштування", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-display font-bold">DocuMinds</span>
          </Link>
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
          <div className="mb-4 px-4 py-3 rounded-xl bg-secondary/50">
            <p className="text-sm font-semibold">Demo Organization</p>
            <p className="text-xs text-muted-foreground">admin@demo.com</p>
          </div>
          <Button variant="ghost" className="w-full justify-start text-base" asChild>
            <Link to="/">
              <LogOut className="mr-2 h-5 w-5" />
              Вийти
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
