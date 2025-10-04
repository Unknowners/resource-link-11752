import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  Code2,
  Database,
  BarChart3,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import RoleDocumentation from "@/components/onboarding/RoleDocumentation";

const roles = [
  { 
    id: "frontend", 
    name: "Frontend Developer", 
    icon: Code2,
    color: "from-blue-500 to-cyan-500",
    description: "Розробка інтерфейсів на React, TypeScript"
  },
  { 
    id: "backend", 
    name: "Backend Developer", 
    icon: Database,
    color: "from-green-500 to-emerald-500",
    description: "API, бази даних, серверна логіка"
  },
  { 
    id: "analyst", 
    name: "Data Analyst", 
    icon: BarChart3,
    color: "from-purple-500 to-pink-500",
    description: "SQL, Python, аналітика даних"
  },
  { 
    id: "product", 
    name: "Product Manager", 
    icon: Lightbulb,
    color: "from-orange-500 to-red-500",
    description: "Roadmap, метрики, UX дослідження"
  },
  { 
    id: "marketing", 
    name: "Marketing Specialist", 
    icon: TrendingUp,
    color: "from-pink-500 to-rose-500",
    description: "Performance маркетинг, UA, креативи"
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      navigate("/app");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setTimeout(() => handleNext(), 300);
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
                <CardTitle className="text-2xl">Вітаємо в OnboardAI!</CardTitle>
                <CardDescription className="text-base">
                  Ваш персональний помічник для швидкої адаптації в команді
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border-2 border-primary/20">
                  <h3 className="font-semibold text-lg mb-3">Що вас чекає:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Документація по вашій професії з покроковим планом</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">FAQ з відповідями на найчастіші питання</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Q&A чат для швидких відповідей від AI та команди</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Доступ до всіх ресурсів та інтеграцій компанії</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <p className="text-sm">
                    <strong>Мета OnboardAI:</strong> Скоротити час вашої адаптації та зробити процес навчання структурованим і простим.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Оберіть вашу професію</CardTitle>
                <CardDescription className="text-base">
                  Ми підготували персоналізовану документацію для кожної ролі
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`p-6 border-2 rounded-xl text-left transition-all hover:scale-[1.02] hover:shadow-lg ${
                          selectedRole === role.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{role.name}</h3>
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground mt-6 text-center">
                  Ви завжди зможете переглянути документацію для інших ролей
                </p>
              </CardContent>
            </>
          )}

          {step === 3 && selectedRole && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Ваш план онбордингу</CardTitle>
                <CardDescription className="text-base">
                  Персоналізована документація для {roles.find(r => r.id === selectedRole)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[60vh] overflow-y-auto">
                <RoleDocumentation role={selectedRole} />
              </CardContent>
            </>
          )}

          <div className="p-6 border-t flex justify-between">
            <Button 
              variant="ghost" 
              onClick={step === 1 ? handleSkip : handleBack}
            >
              {step === 1 ? (
                "Пропустити"
              ) : (
                <>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Назад
                </>
              )}
            </Button>
            <Button onClick={handleNext}>
              {step === totalSteps ? "Почати роботу" : "Далі"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
