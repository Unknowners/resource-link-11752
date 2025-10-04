import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Link as LinkIcon, Zap, Lock, BarChart3, FileText, Bell, Brain, Globe, Workflow, Cloud } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI-Асистент",
      description: "Інтелектуальні рекомендації щодо доступів на основі поведінки команди. Автоматична оптимізація структури груп та ресурсів для максимальної ефективності.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: LinkIcon,
      title: "Уніфіковані інтеграції",
      description: "Підключайте Jira, Confluence, Notion та Google Drive через безпечний OAuth. Єдина панель управління для всіх ваших робочих інструментів.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Контроль доступу",
      description: "Гранулярні права на рівні організацій, груп та користувачів. RBAC модель з підтримкою кастомних ролей та детальних політик безпеки.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Users,
      title: "Управління командою",
      description: "Інтуїтивне управління співробітниками з можливістю масового імпорту. Автоматичні запрошення, онбординг та налаштування доступів.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Zap,
      title: "Реал-тайм синхронізація",
      description: "Автоматичне оновлення ресурсів з усіх інтеграцій. Ручний та заплановані синхронізації для контролю над даними.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: BarChart3,
      title: "Аналітика та звіти",
      description: "Детальна аналітика використання ресурсів, активності користувачів. Експорт звітів у різних форматах для аудиту та оптимізації.",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: FileText,
      title: "Повний аудит-лог",
      description: "Журналювання всіх дій в системі з можливістю пошуку та фільтрації. Відповідність вимогам compliance та безпеки даних.",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Bell,
      title: "Розумні сповіщення",
      description: "Персоналізовані нотифікації про зміни доступів, нові ресурси та оновлення. Інтеграція з email, Slack та іншими каналами.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Globe,
      title: "SSO та SAML",
      description: "Корпоративна автентифікація через Google Workspace, Microsoft Azure AD, Okta. Централізоване управління ідентичністю.",
      gradient: "from-teal-500 to-green-500",
    },
    {
      icon: Workflow,
      title: "Автоматизація робочих процесів",
      description: "Налаштовані робочі процеси для автоматичного призначення доступів. Тригери та правила для динамічного управління групами.",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Cloud,
      title: "Хмарне масштабування",
      description: "Інфраструктура готова до роботи з тисячами користувачів. 99.9% SLA uptime та автоматичне резервне копіювання.",
      gradient: "from-sky-500 to-blue-500",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Шифрування даних у спокої та під час передачі. Регулярні пентести та сертифікації ISO 27001, SOC 2.",
      gradient: "from-red-500 to-pink-500",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="py-16 sm:py-24 md:py-32 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 sm:mb-6 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="gradient-text">Потужні можливості</span>
              <br />
              для сучасних команд
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto px-4 sm:px-0">
              Все необхідне для управління доступами та інтеграціями робочого простору на будь-якому масштабі
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="glass-card hover:shadow-2xl transition-all duration-300 group border-2">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
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
      <section className="py-16 sm:py-20 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="mb-4 sm:mb-6 font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Як це працює</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              Розпочніть роботу за декілька хвилин з простим процесом налаштування
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
            {[
              {
                step: "1",
                title: "Створіть організацію",
                description: "Зареєструйтесь та налаштуйте профіль організації. Визначте домени та параметри робочого простору.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                step: "2",
                title: "Підключіть інструменти",
                description: "Інтегрьте Jira, Confluence, Notion та Google Drive через безпечну OAuth автентифікацію за кілька кліків.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                step: "3",
                title: "Організуйте команду",
                description: "Запросіть учасників, створіть групи та призначте відповідні ролі та права доступу.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                step: "4",
                title: "Налаштуйте доступи",
                description: "Прив'яжіть проекти, простори та папки до груп. Команда отримає доступ до всього необхідного з єдиного місця.",
                gradient: "from-orange-500 to-red-500",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start group">
                <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center font-bold text-xl sm:text-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 sm:mb-3 text-xl sm:text-2xl font-display">{item.title}</h3>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
