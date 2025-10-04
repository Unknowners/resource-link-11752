import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Save, User as UserIcon, Mail, Key } from "lucide-react";

export default function Profile() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display">Мій профіль</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Керуйте вашими особистими налаштуваннями
        </p>
      </div>

      {/* Profile Info */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                AD
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">Персональна інформація</CardTitle>
              <CardDescription>Оновіть дані вашого профілю</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ім'я</Label>
              <Input id="firstName" defaultValue="Admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Прізвище</Label>
              <Input id="lastName" defaultValue="Demo" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="admin@demo.com" disabled />
            <p className="text-sm text-muted-foreground">
              Email не можна змінити
            </p>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Зберегти зміни
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Зміна паролю</CardTitle>
              <CardDescription>Оновіть ваш пароль для входу</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Поточний пароль</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Новий пароль</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Підтвердіть пароль</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button variant="outline">Змінити пароль</Button>
        </CardContent>
      </Card>
    </div>
  );
}
