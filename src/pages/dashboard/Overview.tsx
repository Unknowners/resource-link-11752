import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Users, Link2, CheckCircle2 } from "lucide-react";

export default function Overview() {
  const stats = [
    {
      name: "Всього ресурсів",
      value: "24",
      icon: FolderOpen,
      description: "З усіх інтеграцій",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "Активних користувачів",
      value: "12",
      icon: Users,
      description: "Учасників команди",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Інтеграції",
      value: "4",
      icon: Link2,
      description: "Підключені сервіси",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      name: "Груп",
      value: "5",
      icon: CheckCircle2,
      description: "Активних груп",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const recentActivity = [
    { user: "Іван Петренко", action: "додав ресурс", resource: "Project Alpha", time: "2 години тому" },
    { user: "Олена Коваль", action: "запросив", resource: "Микола Сидоренко", time: "5 годин тому" },
    { user: "Admin", action: "підключив", resource: "Jira інтеграцію", time: "1 день тому" },
    { user: "Марія Шевченко", action: "створив групу", resource: "Marketing Team", time: "2 дні тому" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl">Огляд панелі</h1>
        <p className="text-muted-foreground text-base sm:text-lg mt-2">
          Ласкаво просимо! Ось що відбувається у вашій організації.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="glass-card hover:shadow-xl transition-all border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Остання активність</CardTitle>
          <CardDescription className="text-base">Останні оновлення у вашій організації</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-6 border-b last:border-b-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-base">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}{" "}
                    <span className="font-semibold">{activity.resource}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
