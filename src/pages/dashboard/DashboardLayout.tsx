import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  { name: "Огляд", href: "/app", icon: LayoutDashboard },
  { name: "Ресурси", href: "/app/resources", icon: FolderOpen },
  { name: "Групи", href: "/app/groups", icon: Users },
  { name: "Команда", href: "/app/staff", icon: UserCog },
  { name: "Інтеграції", href: "/app/integrations", icon: Link2 },
  { name: "Аудит-лог", href: "/app/audit", icon: FileText },
  { name: "Налаштування", href: "/app/settings", icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || "");
      }
    });
  }, []);

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === path || location.pathname === "/app/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Ви успішно вийшли");
      navigate("/");
    } catch (error) {
      toast.error("Помилка при виході");
    }
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
          <Link to="/app/profile" className="block mb-4 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
            <p className="text-sm font-semibold">Мій профіль</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-base" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Вийти
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
