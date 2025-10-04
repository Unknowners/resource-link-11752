import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Можливості", href: "/features" },
  { name: "Ціни", href: "/pricing" },
  { name: "Контакти", href: "/contact" },
];

export const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  DocuMinds
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-base font-medium transition-colors hover:text-primary relative group ${
                    isActive(item.href) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-accent transform origin-left transition-transform ${
                    isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`} />
                </Link>
              ))}
            </div>

            <div className="hidden md:flex md:items-center md:space-x-4">
              <Button variant="ghost" className="text-base" asChild>
                <Link to="/login">Увійти</Link>
              </Button>
              <Button className="text-base shadow-lg hover:shadow-xl transition-all" asChild>
                <Link to="/signup">Почати безкоштовно</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t py-6">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="mt-6 space-y-3 px-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Увійти
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    Почати безкоштовно
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-50" />
                  <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                <span className="text-xl font-display font-bold">DocuMinds</span>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-md">
                Уніфікована платформа для управління робочим простором з AI. 
                Об'єднуйте інструменти, автоматизуйте доступи, підвищуйте продуктивність.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">Продукт</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link to="/features" className="hover:text-primary transition-colors">
                    Можливості
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-primary transition-colors">
                    Ціни
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">Компанія</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link to="/contact" className="hover:text-primary transition-colors">
                    Контакти
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-muted-foreground">
            <p>© 2025 DocuMinds. Всі права захищені.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
