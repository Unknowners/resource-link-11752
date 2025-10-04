import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  Plug, 
  Users, 
  FolderOpen, 
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      navigate("/app");
    }
  };

  const handleSkip = () => {
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="w-full max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-lg opacity-50" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <h1 className="font-display text-3xl mb-4">Ласкаво просимо до DocuMinds</h1>
          <p className="text-muted-foreground text-lg">
            Давайте налаштуємо ваш робочий простір за кілька простих кроків
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm text-muted-foreground">
            <span>Крок {step} з {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <Card className="glass-card border-2 shadow-2xl">
          {step === 1 && (
            <>
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Email підтверджено</CardTitle>
                <CardDescription className="text-base">
                  Вашу організацію успішно створено
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-secondary/50 rounded-xl">
                  <p className="font-semibold mb-2">Demo Organization</p>
                  <p className="text-sm text-muted-foreground">admin@demo.com</p>
                </div>
                <p className="text-muted-foreground">
                  Тепер давайте підключимо ваші робочі інструменти та запросимо команду.
                </p>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Plug className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Підключіть інтеграції</CardTitle>
                <CardDescription className="text-base">
                  Оберіть сервіси, які використовує ваша команда
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {["Jira", "Confluence", "Notion", "Google Drive"].map((service) => (
                  <div key={service} className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-primary transition-colors">
                    <span className="font-medium">{service}</span>
                    <Button variant="outline">Підключити</Button>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground mt-4">
                  Ви зможете підключити більше інтеграцій пізніше
                </p>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Запросіть команду</CardTitle>
                <CardDescription className="text-base">
                  Додайте співробітників до вашої організації
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-6 border-2 border-dashed rounded-xl text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Запросіть членів команди через email
                    </p>
                    <Button>Запросити користувачів</Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Або імпортуйте користувачів пізніше через CSV файл
                </p>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                  <FolderOpen className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Створіть групи</CardTitle>
                <CardDescription className="text-base">
                  Організуйте команду та налаштуйте доступи до ресурсів
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 border-2 border-dashed rounded-xl text-center">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Групи допомагають організувати доступи до проектів та документів
                  </p>
                  <Button>Створити першу групу</Button>
                </div>
                <div className="bg-primary/5 p-4 rounded-xl">
                  <p className="text-sm">
                    <strong>Порада:</strong> Створюйте групи на основі відділів або проектів для легшого управління доступами
                  </p>
                </div>
              </CardContent>
            </>
          )}

          <div className="p-6 border-t flex justify-between">
            <Button variant="ghost" onClick={handleSkip}>
              Пропустити
            </Button>
            <Button onClick={handleNext}>
              {step === totalSteps ? "Завершити" : "Далі"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
