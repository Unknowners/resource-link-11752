import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, Shield, Zap, Users, Link as LinkIcon, Brain, Lock, BarChart } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
          }}
        />
        <div className="absolute inset-0 z-0" style={{ background: "var(--gradient-hero)" }} />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20">
              <Sparkles className="h-4 w-4" />
              AI-Powered Workspace Intelligence
            </div>
            <h1 className="mb-6 font-display">
              Унікальна платформа для
              <br />
              <span className="gradient-text">керування робочим простором</span>
            </h1>
            <p className="mb-10 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Об'єднайте Jira, Confluence, Notion та Google Drive в єдиному інтелектуальному просторі. 
              Автоматизуйте доступи та підвищуйте продуктивність команди.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all" asChild>
                <Link to="/signup">
                  Почати безкоштовно
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2" asChild>
                <Link to="/contact">Замовити демо</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              14 днів безкоштовно • Без кредитної картки • Скасувати можна будь-коли
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-1/4 right-10 w-24 h-24 bg-accent/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-primary-foreground/80">Компаній довіряють</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-primary-foreground/80">Активних користувачів</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-primary-foreground/80">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="mb-6 font-display">Все, що потрібно вашій команді</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Потужні функції для управління інтеграціями робочого простору
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass-card hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-4">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">AI-Асистент</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Інтелектуальні рекомендації доступів та автоматична оптимізація структури команди
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center mb-4">
                  <LinkIcon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Уніфіковані інтеграції</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Jira, Confluence, Notion, Google Drive — всі інструменти в одному місці
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Контроль доступу</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Гранулярні права на рівні груп з повним аудитом дій
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Управління командою</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Інтуїтивне керування співробітниками, групами та ролями
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Реал-тайм синхронізація</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Автоматичне оновлення ресурсів у режимі реального часу
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                  <BarChart className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Аналітика та звіти</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Детальна аналітика використання та аудит всіх дій
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mb-6 font-display">Інтеграції</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Підключайте інструменти, які ваша команда вже використовує
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Jira", color: "from-blue-600 to-blue-400" },
              { name: "Confluence", color: "from-blue-500 to-cyan-400" },
              { name: "Notion", color: "from-gray-800 to-gray-600" },
              { name: "Google Drive", color: "from-yellow-500 to-red-500" },
            ].map((tool) => (
              <div
                key={tool.name}
                className="group relative overflow-hidden flex items-center justify-center p-10 bg-card rounded-2xl border-2 border-border hover:border-primary transition-all hover:shadow-xl cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <span className="text-2xl font-bold relative z-10">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-accent opacity-95" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="mb-6 font-display text-white">Готові розпочати?</h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Приєднуйтесь до команд, які вже оптимізували свій робочий простір з DocuMinds
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-2xl hover:scale-105 transition-all" asChild>
              <Link to="/signup">
                Спробувати безкоштовно
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
