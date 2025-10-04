import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Building2, Globe, CreditCard } from "lucide-react";

export default function DashboardSettings() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display">Налаштування організації</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Керуйте параметрами вашої організації
        </p>
      </div>

      {/* Organization Profile */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Профіль організації</CardTitle>
              <CardDescription>Загальна інформація про компанію</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Назва організації</Label>
            <Input id="orgName" defaultValue="Demo Organization" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Основний домен</Label>
            <Input id="domain" defaultValue="demo.com" type="text" />
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Зберегти зміни
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Безпека</CardTitle>
              <CardDescription>Налаштування автентифікації та доступу</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div>
              <p className="font-medium">SSO (Single Sign-On)</p>
              <p className="text-sm text-muted-foreground">
                Підключіть корпоративну автентифікацію
              </p>
            </div>
            <Button variant="outline">Налаштувати</Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div>
              <p className="font-medium">Двофакторна автентифікація</p>
              <p className="text-sm text-muted-foreground">
                Обов'язкова 2FA для всіх користувачів
              </p>
            </div>
            <Button variant="outline">Увімкнути</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Білінг та підписка</CardTitle>
              <CardDescription>Управління планом та оплатою</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">Поточний план</p>
              <span className="text-2xl font-bold">$199/міс</span>
            </div>
            <p className="text-sm text-muted-foreground">Professional Plan</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">Змінити план</Button>
            <Button variant="outline" className="flex-1">Історія платежів</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
