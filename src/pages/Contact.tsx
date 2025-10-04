import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Calendar, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Дякуємо! Ми зв'яжемось з вами найближчим часом.");
    setFormData({ name: "", email: "", company: "", message: "" });
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 font-display">
              <span className="gradient-text">Зв'яжіться з нами</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Є питання? Ми будемо раді вам допомогти. Напишіть нам, і ми відповімо якомога швидше.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="border-2 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-display">Надішліть повідомлення</CardTitle>
                  <CardDescription className="text-base">
                    Заповніть форму нижче, і ми відповімо протягом 24 годин.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base">Ім'я</Label>
                      <Input
                        id="name"
                        placeholder="Ваше ім'я"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-base">Компанія</Label>
                      <Input
                        id="company"
                        placeholder="Назва вашої компанії"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-base">Повідомлення</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        placeholder="Розкажіть нам про ваші потреби..."
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base" size="lg">
                      Надіслати повідомлення
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="mb-8 font-display text-3xl">Інші способи зв'язку</h2>
              </div>

              <Card className="glass-card hover:shadow-xl transition-all border-2">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Загальні питання
                  </p>
                  <a
                    href="mailto:hello@documinds.com"
                    className="text-primary hover:underline text-lg font-medium"
                  >
                    hello@documinds.com
                  </a>
                </CardContent>
              </Card>

              <Card className="glass-card hover:shadow-xl transition-all border-2">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Відділ продажів</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Цікавить Enterprise план?
                  </p>
                  <a
                    href="mailto:sales@documinds.com"
                    className="text-primary hover:underline text-lg font-medium"
                  >
                    sales@documinds.com
                  </a>
                </CardContent>
              </Card>

              <Card className="glass-card hover:shadow-xl transition-all border-2">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Замовити демо</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Подивіться DocuMinds в дії з персоналізованою демонстрацією
                  </p>
                  <Button variant="outline" className="w-full h-11" size="lg">
                    Запланувати демо
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card hover:shadow-xl transition-all border-2">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                    <Phone className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Телефон</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Пн-Пт: 9:00 - 18:00
                  </p>
                  <a
                    href="tel:+380442345678"
                    className="text-primary hover:underline text-lg font-medium"
                  >
                    +38 (044) 234-56-78
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
