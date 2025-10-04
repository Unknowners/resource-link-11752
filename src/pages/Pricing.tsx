import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$79",
      description: "Ідеально для малих команд",
      features: [
        "До 25 користувачів",
        "2 інтеграції на вибір",
        "Базове управління групами",
        "Email підтримка",
        "Аудит-лог (30 днів)",
        "99% SLA",
      ],
    },
    {
      name: "Professional",
      price: "$199",
      description: "Для команд що ростуть",
      features: [
        "До 100 користувачів",
        "Всі інтеграції включено",
        "Розширене управління групами",
        "Пріоритетна підтримка",
        "Аудит-лог (90 днів)",
        "Кастомні ролі",
        "AI-асистент (базовий)",
        "99.5% SLA",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Індивідуально",
      description: "Для великих організацій",
      features: [
        "Необмежена кількість користувачів",
        "Всі інтеграції включено",
        "Розширені функції безпеки",
        "Виділений менеджер успіху",
        "Необмежений аудит-лог",
        "Кастомні ролі та права",
        "SSO та SAML",
        "AI-асистент (повний)",
        "99.9% SLA гарантія",
        "Приватний хостинг (опціонально)",
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
              <span className="gradient-text">Прості та прозорі</span>
              <br />
              ціни
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Оберіть план, що підходить вашій організації. Усі плани включають основні функції.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col border-2 transition-all duration-300 ${
                  plan.popular 
                    ? "border-primary shadow-2xl scale-105 glass-card" 
                    : "hover:shadow-xl hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-accent text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Найпопулярніший
                    </div>
                  </div>
                )}
                <CardHeader className="pb-8">
                  <CardTitle className="text-3xl font-display">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold font-display">{plan.price}</span>
                    {plan.price !== "Індивідуально" && (
                      <span className="text-muted-foreground text-lg">/місяць</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full text-base py-6"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link to="/signup">
                      {plan.price === "Індивідуально" ? "Зв'язатись з продажами" : "Почати роботу"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-16 font-display">Часті запитання</h2>
            <div className="space-y-8">
              <div className="glass-card p-8 rounded-2xl">
                <h3 className="mb-3 text-xl font-semibold">Чи можна змінити план пізніше?</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Так, ви можете оновити або знизити свій план у будь-який момент. Зміни вступають у силу негайно, з пропорційним перерахунком.
                </p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <h3 className="mb-3 text-xl font-semibold">Чи є безкоштовний пробний період?</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Так, усі плани включають 14-денний безкоштовний пробний період. Кредитна картка не потрібна для початку роботи.
                </p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <h3 className="mb-3 text-xl font-semibold">Які інтеграції включені?</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Professional та Enterprise плани включають усі інтеграції (Jira, Confluence, Notion, Google Drive). Starter включає 2 інтеграції на ваш вибір.
                </p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <h3 className="mb-3 text-xl font-semibold">Як працює білінг?</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Оплата щомісячна або річна (заощаджуйте 20% з річною оплатою). Ви можете скасувати підписку у будь-який момент без штрафів.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
