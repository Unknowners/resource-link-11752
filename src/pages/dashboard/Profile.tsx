import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Save, User as UserIcon, Mail, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
  });
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading profile:', error);
          toast.error("Помилка завантаження профілю");
          return;
        }

        if (profileData) {
          setProfile({
            firstName: profileData.first_name || "",
            lastName: profileData.last_name || "",
            email: profileData.email || user.email || "",
            company: profileData.company || "",
          });
        } else {
          // Profile doesn't exist yet, use data from auth user metadata
          setProfile({
            firstName: (user.user_metadata?.first_name as string) || "",
            lastName: (user.user_metadata?.last_name as string) || "",
            email: user.email || "",
            company: (user.user_metadata?.company as string) || "",
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error("Помилка завантаження профілю");
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          company: profile.company,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Профіль оновлено");
    } catch (error) {
      toast.error("Помилка при оновленні профілю");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Паролі не співпадають");
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error("Пароль повинен містити мінімум 6 символів");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;
      toast.success("Пароль змінено");
      setPasswords({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Помилка при зміні паролю");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() || "U";
  };

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
                {getInitials()}
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
              <Input 
                id="firstName" 
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Прізвище</Label>
              <Input 
                id="lastName" 
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Компанія</Label>
            <Input 
              id="company" 
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile.email} disabled />
            <p className="text-sm text-muted-foreground">
              Email не можна змінити
            </p>
          </div>
          <Button onClick={handleUpdateProfile} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Збереження..." : "Зберегти зміни"}
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
            <Label htmlFor="newPassword">Новий пароль</Label>
            <Input 
              id="newPassword" 
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Підтвердіть пароль</Label>
            <Input 
              id="confirmPassword" 
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            />
          </div>
          <Button variant="outline" onClick={handleChangePassword} disabled={loading}>
            {loading ? "Зміна..." : "Змінити пароль"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
