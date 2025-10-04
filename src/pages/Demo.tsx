import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Demo() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    companySize: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Дякуємо! Ми зв'яжемось з вами найближчим часом для демонстрації.");
    setFormData({ name: "", email: "", company: "", companySize: "", phone: "", message: "" });
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 font-display">
              <span className="gradient-text">Замовити демо</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Побачите DocuMinds в дії. Наші експерти покажуть, як платформа може оптимізувати ваш робочий простір.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Form */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <Card className="border-2 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-display">Заповніть форму</CardTitle>
                  <CardDescription className="text-base">
                    Ми зв'яжемось протягом 24 годин та запропонуємо зручний час
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base">Ім'я *</Label>
                      <Input
                        id="name"
                        placeholder="Ваше повне ім'я"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-base">Компанія *</Label>
                      <Input
                        id="company"
                        placeholder="Назва вашої компанії"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companySize" className="text-base">Розмір команди *</Label>
                      <Select value={formData.companySize} onValueChange={(value) => setFormData({ ...formData, companySize: value })}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Оберіть розмір" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 співробітників</SelectItem>
                          <SelectItem value="11-50">11-50 співробітників</SelectItem>
                          <SelectItem value="51-200">51-200 співробітників</SelectItem>
                          <SelectItem value="201-1000">201-1000 співробітників</SelectItem>
                          <SelectItem value="1000+">1000+ співробітників</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-base">Телефон</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+38 (0XX) XXX-XX-XX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-base">Додаткова інформація</Label>
                      <Textarea
                        id="message"
                        rows={4}
                        placeholder="Розкажіть про ваші потреби та очікування..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base" size="lg">
                      Замовити демо
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              <div>
                <h2 className="mb-8 font-display text-3xl">Що включає демо?</h2>
              </div>

              <Card className="glass-card border-2">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">30-хвилинна сесія</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Персоналізована демонстрація платформи з нашим експертом
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-2">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Live демо</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Побачите всі ключові функції в дії на реальних прикладах
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-2">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Q&A сесія</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Відповімо на всі ваші запитання та обговоримо ваші специфічні потреби
                  </p>
                </CardContent>
              </Card>

              <div className="p-6 bg-secondary/50 rounded-2xl border-2">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Безкоштовно та без зобов'язань.</strong> Після демо ви зможете отримати 14-денний тестовий період для власних експериментів.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
