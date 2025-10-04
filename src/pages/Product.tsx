import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Layers, 
  Shield, 
  Users, 
  BarChart3, 
  Workflow,
  Lock,
  Globe,
  Zap,
  FileText,
  ArrowRight
} from "lucide-react";

export default function Product() {
  const modules = [
    {
      icon: Layers,
      title: "Інтеграції",
      description: "Підключення Jira, Confluence, Notion, Google Drive через OAuth. Автоматична синхронізація та управління токенами.",
      features: [
        "Безпечна OAuth автентифікація",
        "Автоматичне оновлення токенів",
        "Гранулярні scopes",
        "Журналування синхронізацій"
      ],
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: FileText,
      title: "Ресурси",
      description: "Централізоване управління проектами, просторами, базами та папками з усіх підключених платформ.",
      features: [
        "Єдиний каталог ресурсів",
        "Мета-дані та теги",
        "Швидкий пошук та фільтри",
        "Прямі посилання до джерел"
      ],
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Групи",
      description: "Створення та управління групами користувачів з гнучкою системою призначення прав доступу.",
      features: [
        "Ієрархічні групи",
        "Динамічне членство",
        "Масове призначення ресурсів",
        "Історія змін"
      ],
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      title: "Матриця доступів",
      description: "Візуальне управління правами доступу груп до ресурсів з підтримкою різних рівнів.",
      features: [
        "Візуальна матриця Групи×Ресурси",
        "Кастомні рівні доступу",
        "Масові операції",
        "Експорт у CSV"
      ],
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: BarChart3,
      title: "Аудит-лог",
      description: "Повне журналювання всіх дій в системі з можливістю пошуку та аналітики.",
      features: [
        "Деталізація по акторах",
        "Фільтри та пошук",
        "Експорт звітів",
        "Compliance-ready"
      ],
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: Workflow,
      title: "Автоматизація",
      description: "Робочі процеси та правила для автоматичного управління доступами.",
      features: [
        "Тригери на події",
        "Автопризначення груп",
        "Політики доступу",
        "Сповіщення"
      ],
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  const roles = [
    {
      name: "Member",
      description: "Базовий користувач",
      permissions: [
        "Перегляд призначених ресурсів",
        "Доступ до інтегрованих інструментів",
        "Перегляд своїх груп",
        "Базовий пошук"
      ],
    },
    {
      name: "Org Admin",
      description: "Адміністратор організації",
      permissions: [
        "Управління користувачами",
        "Створення та редагування груп",
        "Підключення інтеграцій",
        "Налаштування доступів",
        "Перегляд аудит-логу",
        "Налаштування організації"
      ],
      highlighted: true,
    },
    {
      name: "Super Admin",
      description: "Глобальний адміністратор",
      permissions: [
        "Управління всіма організаціями",
        "Діагностика інтеграцій",
        "Глобальний аудит",
        "Керування білінгом",
        "Feature flags",
        "Health моніторинг"
      ],
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 font-display">
              <span className="gradient-text">Продукт</span>
              <br />
              що масштабується разом з вами
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Модульна платформа для управління робочим простором від стартапу до enterprise
            </p>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mb-6 font-display">Ключові модулі</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Все необхідне для повного контролю над робочим простором
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Card key={module.title} className="glass-card hover:shadow-2xl transition-all duration-300 border-2">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{module.title}</CardTitle>
                    <CardDescription className="text-base">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {module.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Comparison */}
      <section className="py-24 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mb-6 font-display">Порівняння ролей</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Гнучка система прав для різних рівнів доступу
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {roles.map((role) => (
              <Card
                key={role.name}
                className={`${
                  role.highlighted
                    ? "glass-card border-primary shadow-2xl scale-105"
                    : "border-2"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{role.name}</CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {role.permissions.map((permission) => (
                      <li key={permission} className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <span className="text-sm">{permission}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-6 font-display">Безпека та відповідність</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-2">
                <CardHeader>
                  <Lock className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">OAuth 2.0</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Індустріальний стандарт автентифікації. Мінімальні scopes, безпечне зберігання токенів.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="glass-card border-2">
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">Аудит-лог</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Повне журналювання дій для compliance. GDPR, SOC 2, ISO 27001 готовність.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="glass-card border-2">
                <CardHeader>
                  <Globe className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">Приватність даних</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Зберігаємо тільки метадані та посилання. Ваш контент залишається у джерелах.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-accent opacity-95" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="mb-6 font-display text-white">Спробуйте DocuMinds сьогодні</h2>
            <p className="text-xl mb-10 text-white/90 leading-relaxed">
              14 днів безкоштовно. Без кредитної картки.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-10 py-6" asChild>
                <Link to="/signup">
                  Почати безкоштовно
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-white text-white hover:bg-white/10" asChild>
                <Link to="/demo">Замовити демо</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
