import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

const Forbidden = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("403 Error: User attempted to access forbidden route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-accent/5 p-4">
      <Card className="w-full max-w-md border-2 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-display">403</CardTitle>
          <CardDescription className="text-lg mt-2">Доступ заборонено</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            У вас немає прав для доступу до цієї сторінки. Зверніться до адміністратора організації.
          </p>
          <Button className="w-full" asChild>
            <a href="/">Повернутись на головну</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forbidden;
