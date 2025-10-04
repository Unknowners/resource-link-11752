import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Calendar, BookOpen, Lightbulb } from "lucide-react";

interface RoleDocumentationProps {
  role: string;
}

const roleData: Record<string, any> = {
  frontend: {
    title: "Frontend Developer",
    description: "Створення інтерфейсу та взаємодії користувача з системою",
    tags: ["React", "TypeScript", "Tailwind CSS", "REST API", "Git"],
    skills: [
      "HTML5, CSS3 (адаптивна верстка, Flex/Grid)",
      "JavaScript (ES6+) та TypeScript",
      "Робота з React та Next.js",
      "Оптимізація продуктивності фронтенду",
      "Unit/Integration тестування (Jest, Cypress)"
    ],
    tools: [
      "VS Code, WebStorm",
      "React, Next.js, Redux",
      "Git, GitHub/GitLab",
      "Docker (базові знання)",
      "Chrome DevTools"
    ],
    onboarding: [
      {
        period: "Day 1",
        tasks: [
          "Доступ до репозиторію OnboardAI-frontend",
          "Ознайомлення з документацією в Confluence → Frontend Guidelines",
          "Локальний запуск проєкту через npm install && npm run dev"
        ]
      },
      {
        period: "Week 1",
        tasks: [
          "Виконати перші таски у Jira (small UI bugs)",
          "Ознайомитися з компонентною бібліотекою (Storybook)",
          "Пройти воркшоп по CI/CD пайплайну"
        ]
      },
      {
        period: "Month 1",
        tasks: [
          "Взяти повноцінний таск (новий модуль)",
          "Пройти кодрев'ю та закрити мінімум 5 MR/PR",
          "Внести власну пропозицію з оптимізації"
        ]
      }
    ],
    resources: [
      { name: "Frontend Guidelines", url: "https://confluence.onboardai.dev" },
      { name: "Storybook", url: "https://storybook.onboardai.dev" },
      { name: "API Swagger", url: "https://api.onboardai.dev/docs" }
    ]
  },
  backend: {
    title: "Backend Developer",
    description: "Логіка та робота під капотом вебзастосунку",
    tags: ["Node.js", "PostgreSQL", "API", "Docker", "Microservices"],
    skills: [
      "Програмування (Python, Node.js)",
      "Проєктування REST API та GraphQL",
      "Робота з PostgreSQL, MongoDB, Redis",
      "Оптимізація SQL-запитів",
      "Docker та Kubernetes"
    ],
    tools: [
      "VS Code, PyCharm",
      "Docker, Kubernetes",
      "PostgreSQL, Redis",
      "Git + GitHub",
      "Prometheus, Grafana"
    ],
    onboarding: [
      {
        period: "Day 1",
        tasks: [
          "Доступ до GitHub репозиторію OnboardAI-backend",
          "Ознайомлення з Backend Setup у Confluence",
          "Налаштувати локальне середовище (Docker-compose)",
          "Виконати тестовий запит до API через Swagger"
        ]
      },
      {
        period: "Week 1",
        tasks: [
          "Перші Jira-таски: виправити баг у модулі авторизації",
          "Ознайомитися з архітектурою сервісів",
          "Додати один новий endpoint у dev-гілку",
          "Пройти воркшоп з моніторингу"
        ]
      },
      {
        period: "Month 1",
        tasks: [
          "Реалізувати невеликий сервіс",
          "Покрити функції unit-тестами",
          "Розібратися в CI/CD пайплайні",
          "Підготувати пропозицію з оптимізації"
        ]
      }
    ],
    resources: [
      { name: "Backend Setup", url: "https://confluence.onboardai.dev" },
      { name: "API Swagger", url: "https://api.onboardai.dev/docs" },
      { name: "Database Schema", url: "https://dbdocs.onboardai.dev" }
    ]
  },
  analyst: {
    title: "Data Analyst",
    description: "Перетворення даних на бізнес-інсайти",
    tags: ["SQL", "Python", "Tableau", "A/B Testing", "Statistics"],
    skills: [
      "SQL (PostgreSQL, BigQuery)",
      "Python (pandas, numpy, matplotlib)",
      "BI-інструменти: Power BI, Tableau",
      "Побудова воронок та когортного аналізу",
      "A/B-тестування та статистика"
    ],
    tools: [
      "Jupyter Notebook, VS Code",
      "Tableau, Power BI",
      "SQL-клієнти (DBeaver)",
      "Python (pandas, matplotlib)",
      "Git"
    ],
    onboarding: [
      {
        period: "Day 1",
        tasks: [
          "Отримати доступ до DWH (Data Warehouse)",
          "Ознайомитися з BI-порталом",
          "Переглянути Business Metrics Dictionary",
          "Виконати тестовий SQL-запит"
        ]
      },
      {
        period: "Week 1",
        tasks: [
          "Створити перший базовий дашборд",
          "Ознайомитися з пайплайном ETL",
          "Вивчити основні метрики (DAU, MAU, Retention)",
          "Пройти воркшоп з A/B тестування"
        ]
      },
      {
        period: "Month 1",
        tasks: [
          "Презентувати перший аналіз",
          "Побудувати когортний аналіз retention",
          "Оптимізувати складний SQL-запит",
          "Автоматизувати щотижневий звіт"
        ]
      }
    ],
    resources: [
      { name: "Metrics Dictionary", url: "https://confluence.onboardai.dev" },
      { name: "BI Portal", url: "https://bi.onboardai.dev" },
      { name: "SQL Guides", url: "https://confluence.onboardai.dev/sql" }
    ]
  },
  product: {
    title: "Product Manager",
    description: "Бачення продукту та його розвиток",
    tags: ["Roadmap", "Jira", "User Research", "Metrics", "UX"],
    skills: [
      "Аналітичні: метрики, unit-економіка",
      "Продуктові: roadmap, пріоритизація (RICE)",
      "Комунікаційні: фасилітація мітингів",
      "UX-дослідження: інтерв'ю користувачів",
      "Бізнесові: монетизація, гіпотези"
    ],
    tools: [
      "Jira / Trello",
      "Confluence / Notion",
      "Amplitude / Mixpanel",
      "Figma",
      "SQL + Python (базовий)"
    ],
    onboarding: [
      {
        period: "Day 1",
        tasks: [
          "Доступ до Jira (дошка OnboardAI Product)",
          "Ознайомитися з Product Vision",
          "Подивитися демо-презентацію",
          "Познайомитися з командою"
        ]
      },
      {
        period: "Week 1",
        tasks: [
          "Onboarding з аналітиком: ключові метрики",
          "Ознайомитися з roadmap на квартал",
          "Провести 2 інтерв'ю з новими співробітниками",
          "Перевірити backlog"
        ]
      },
      {
        period: "Month 1",
        tasks: [
          "Створити PRD для нової фічі",
          "Побудувати дашборд adoption rate",
          "Організувати спринт-планінг",
          "Запропонувати гіпотезу для A/B-тесту"
        ]
      }
    ],
    resources: [
      { name: "Product Vision", url: "https://confluence.onboardai.dev" },
      { name: "Product Roadmap", url: "https://confluence.onboardai.dev/roadmap" },
      { name: "Amplitude Dashboard", url: "https://amplitude.onboardai.dev" }
    ]
  },
  marketing: {
    title: "Marketing Specialist / UA Manager",
    description: "Залучення нових користувачів через рекламу",
    tags: ["Google Ads", "Facebook Ads", "CPA", "ROAS", "Analytics"],
    skills: [
      "Performance-маркетинг (Google, Meta, LinkedIn)",
      "Робота з аналітикою: Amplitude, GA4",
      "A/B-тестування креативів",
      "Планування бюджету і медіаміксу",
      "Знання воронок (impressions → paid)"
    ],
    tools: [
      "Google Ads, Facebook Ads Manager",
      "Appsflyer / Adjust",
      "Amplitude",
      "Canva / Figma",
      "Jira / Notion"
    ],
    onboarding: [
      {
        period: "Day 1",
        tasks: [
          "Доступ до Ads-акаунтів (Google, Meta, LinkedIn)",
          "Переглянути Media Plan у Jira",
          "Ознайомитися з метриками в Amplitude"
        ]
      },
      {
        period: "Week 1",
        tasks: [
          "Запустити перші A/B-тести креативів",
          "Зробити аналіз конкурентів",
          "Зустріч з PM щодо value proposition"
        ]
      },
      {
        period: "Month 1",
        tasks: [
          "Оптимізувати кампанії під CPA < $50",
          "Зробити звіт по ROAS",
          "Підготувати нову партію креативів",
          "Запустити LinkedIn Ads на Європу"
        ]
      }
    ],
    resources: [
      { name: "Media Plan", url: "https://confluence.onboardai.dev" },
      { name: "UA Dashboard", url: "https://amplitude.onboardai.dev" },
      { name: "Brand Guidelines", url: "https://confluence.onboardai.dev/brand" }
    ]
  }
};

export default function RoleDocumentation({ role }: RoleDocumentationProps) {
  const data = roleData[role];

  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Документація для цієї ролі ще не доступна</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-2xl">{data.title}</CardTitle>
          <CardDescription className="text-base">{data.description}</CardDescription>
          <div className="flex flex-wrap gap-2 mt-4">
            {data.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Skills & Tools */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Основні навички
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.skills.map((skill: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span className="text-sm">{skill}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Інструменти
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.tools.map((tool: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span className="text-sm">{tool}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Timeline */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Процес онбордингу
          </CardTitle>
          <CardDescription>Ваш шлях адаптації в команді</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
            {data.onboarding.map((phase: any, idx: number) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left">
                  <span className="font-semibold">{phase.period}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 mt-2">
                    {phase.tasks.map((task: string, taskIdx: number) => (
                      <li key={taskIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{task}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card className="border-2 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Корисні ресурси
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.resources.map((resource: any, idx: number) => (
              <a
                key={idx}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <span className="text-sm font-medium">{resource.name}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
