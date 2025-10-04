import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageCircle, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const faqData = [
  {
    category: "Загальні питання",
    questions: [
      {
        q: "Як працює Jira у нас?",
        a: "Jira використовується як єдина система управління завданнями. У кожної ролі є власна дошка (Frontend, Backend, Analytics, Marketing, Product). Завдання розділені на: To Do → In Progress → Code Review → Done. Баги позначаються префіксом [BUG], нові фічі — [TASK]."
      },
      {
        q: "Які мітинги є в компанії?",
        a: "Daily Standup (щодня, 15 хв) — короткий апдейт кожного члена команди. Sprint Planning (раз на 2 тижні) — планування задач на спринт. Demo (раз на 2 тижні) — презентація результатів. Retro (раз на 2 тижні) — аналіз того, що вдалось і що покращити. Product Sync (щотижня) — обговорення пріоритетів з Product Manager."
      },
      {
        q: "Як виглядає процес деплою?",
        a: "Staging → автоматичний деплой після merge у develop. Production → деплой через GitHub Actions (або Jenkins), потрібен code review та апрув DevOps."
      },
      {
        q: "Де зберігається документація?",
        a: "Confluence → гайди та процеси. Notion → дизайн-компоненти та внутрішні чеклісти. Swagger → API документація."
      }
    ]
  },
  {
    category: "Доступи та інструменти",
    questions: [
      {
        q: "Як отримати доступ до бази даних?",
        a: "Потрібно створити Jira-таску у проєкті IT Support з тегом [ACCESS]. У тасці вказати: email, роль, рівень доступу (read-only чи write). Затвердження займає до 24 годин."
      },
      {
        q: "Що робити, якщо не працює VPN?",
        a: "Перевірити інструкцію в Confluence → VPN Troubleshooting. Якщо не допомогло — написати у Slack-канал #it-support. Прикріпи скріншот помилки."
      },
      {
        q: "У яких Slack-каналах обов'язково бути?",
        a: "#general — оголошення, #frontend-support / #backend-support / #analytics — за ролями, #product — обговорення фіч, #random — неформальна комунікація."
      }
    ]
  },
  {
    category: "Розробка",
    questions: [
      {
        q: "Які правила code review?",
        a: "Мінімум 1 approve від колеги та від Tech Lead. У коментарях використовуємо конструктивний фідбек (посилання на документацію або приклади коду). Час на review — не більше 24 год."
      },
      {
        q: "Як повідомити про баг у продукті?",
        a: "Створити Jira-таску з префіксом [BUG], додати скрін/лог. Пріоритет: Low / Medium / High / Critical."
      }
    ]
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [question, setQuestion] = useState("");

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      item =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const handleAskQuestion = () => {
    if (question.trim()) {
      // TODO: Integrate with AI backend
      console.log("Question asked:", question);
      setQuestion("");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl">FAQ & Q&A</h1>
        <p className="text-muted-foreground text-base sm:text-lg mt-2">
          Знайдіть відповіді на найчастіші питання або поставте власне запитання
        </p>
      </div>

      {/* Search */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Шукати в FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ask Question Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Не знайшли відповідь?</CardTitle>
              <CardDescription>Поставте своє запитання і отримайте відповідь від AI або команди</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Textarea
              placeholder="Введіть ваше запитання..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 min-h-[100px] sm:min-h-[60px]"
            />
            <Button onClick={handleAskQuestion} className="sm:self-end">
              <Send className="mr-2 h-4 w-4" />
              Відправити
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Sections */}
      <div className="space-y-6">
        {filteredFAQ.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Нічого не знайдено. Спробуйте інший пошуковий запит.
            </CardContent>
          </Card>
        ) : (
          filteredFAQ.map((category, idx) => (
            <Card key={idx} className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                      <AccordionTrigger className="text-left">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
