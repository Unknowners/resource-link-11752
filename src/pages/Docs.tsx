import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Book, Rocket, Shield, Plug, Users as UsersIcon, Settings, ArrowRight } from "lucide-react";

export default function Docs() {
  const sections = [
    {
      icon: Rocket,
      title: "Швидкий старт",
      description: "Розпочніть роботу за 5 хвилин",
      items: [
        "Створення організації",
        "Підключення першої інтеграції",
        "Запрошення команди",
        "Створення груп та призначення доступів"
      ],
      link: "#quickstart"
    },
    {
      icon: Plug,
      title: "Інтеграції",
      description: "Підключення робочих інструментів",
      items: [
        "Налаштування Jira OAuth",
        "Підключення Confluence",
        "Інтеграція з Notion",
        "Google Drive setup"
      ],
      link: "#integrations"
    },
    {
      icon: UsersIcon,
      title: "Управління командою",
      description: "Робота з користувачами та групами",
      items: [
        "Запрошення користувачів",
        "Ролі та права доступу",
        "Створення та управління групами",
        "Масове адміністрування"
      ],
      link: "#team-management"
    },
    {
      icon: Shield,
      title: "Безпека",
      description: "Політики та best practices",
      items: [
        "OAuth scopes та дозволи",
        "Аудит та compliance",
        "Обробка даних",
        "SSO та SAML"
      ],
      link: "#security"
    },
    {
      icon: Settings,
      title: "Налаштування",
      description: "Конфігурація організації",
      items: [
        "Загальні налаштування",
        "Домени та SSO",
        "Білінг та плани",
        "API та вебхуки"
      ],
      link: "#configuration"
    },
    {
      icon: Book,
      title: "API документація",
      description: "Інтеграція через API",
      items: [
        "REST API довідник",
        "Автентифікація",
        "Приклади використання",
        "Rate limits та квоти"
      ],
      link: "#api"
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
              <span className="gradient-text">Документація</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Все, що вам потрібно знати для ефективної роботи з DocuMinds
            </p>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className="glass-card hover:shadow-2xl transition-all border-2 group">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                    <CardDescription className="text-base">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                      <a href={section.link}>
                        Детальніше
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-12 font-display text-center">Популярні запитання</h2>
            
            <div className="space-y-6">
              <Card className="glass-card border-2">
                <CardHeader>
                  <CardTitle className="text-xl">Як підключити Jira?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Перейдіть до розділу Інтеграції → Jira → Connect. Вас буде перенаправлено до Atlassian для авторизації. 
                    Після підтвердження DocuMinds отримає доступ до ваших проектів.
                  </p>
                  <Button variant="link" className="p-0">Детальна інструкція →</Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-2">
                <CardHeader>
                  <CardTitle className="text-xl">Як створити групу?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    У розділі Групи натисніть "Створити групу", введіть назву та опис. 
                    Після створення додайте користувачів та призначте ресурси через вкладки Members та Resources.
                  </p>
                  <Button variant="link" className="p-0">Дізнатись більше →</Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-2">
                <CardHeader>
                  <CardTitle className="text-xl">Що таке матриця доступів?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Матриця доступів - це візуальний інструмент для управління правами груп до ресурсів. 
                    Ви можете швидко призначити кілька ресурсів кільком групам одночасно.
                  </p>
                  <Button variant="link" className="p-0">Переглянути приклад →</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6 font-display">Потрібна допомога?</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Наша команда підтримки готова допомогти вам
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">
                  Зв'язатись з підтримкою
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">
                  Замовити демо
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
