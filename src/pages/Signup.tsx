import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, Eye, EyeOff, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/app");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/app");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(formData.password);
  
  const passwordRequirements = [
    { text: "Мінімум 8 символів", met: formData.password.length >= 8 },
    { text: "Великі та малі літери", met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
    { text: "Містить цифру", met: /\d/.test(formData.password) },
    { text: "Спецсимвол (!@#$...)", met: /[^a-zA-Z0-9]/.test(formData.password) },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const doPasswordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Паролі не співпадають");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Пароль не відповідає вимогам безпеки");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company: formData.company,
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("Користувач з таким email вже зареєстрований");
        } else {
          toast.error(error.message);
        }
      } else {
        if (data.user && data.session) {
          toast.success("Реєстрація успішна! Ласкаво просимо!");
          navigate("/app");
        } else {
          toast.success("Реєстрація успішна! Перевірте email для підтвердження.");
          navigate("/login");
        }
      }
    } catch (error) {
      toast.error("Помилка при реєстрації");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <Card className="w-full max-w-2xl relative z-10 border-2 shadow-2xl">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-lg opacity-50" />
              <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-display">Створити акаунт</CardTitle>
          <CardDescription className="text-center">
            Заповніть форму для реєстрації в системі
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Ім'я *</Label>
                <Input
                  id="firstName"
                  placeholder="Іван"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Прізвище *</Label>
                <Input
                  id="lastName"
                  placeholder="Петренко"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="h-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="ivan.petrenko@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company">Компанія</Label>
              <Input
                id="company"
                placeholder="Назва вашої компанії"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Пароль *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  className="h-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {passwordFocused && formData.password && (
                <div className="space-y-2 mt-2 p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Progress value={passwordStrength} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground w-16 text-right font-medium">
                      {passwordStrength < 50 ? 'Слабкий' : passwordStrength < 75 ? 'Середній' : 'Сильний'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {passwordRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        {req.met ? (
                          <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={req.met ? "text-green-500" : "text-muted-foreground"}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Підтвердіть пароль *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="h-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className={`text-xs flex items-center gap-1.5 mt-1.5 ${doPasswordsMatch ? 'text-green-500' : 'text-destructive'}`}>
                  {doPasswordsMatch ? (
                    <><Check className="h-3 w-3" /> Паролі співпадають</>
                  ) : (
                    <><X className="h-3 w-3" /> Паролі не співпадають</>
                  )}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 mt-4" 
              disabled={loading || !isPasswordValid || !doPasswordsMatch}
            >
              {loading ? "Реєстрація..." : "Створити акаунт"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <div className="text-sm text-center text-muted-foreground">
            Вже є акаунт?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Увійти
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
