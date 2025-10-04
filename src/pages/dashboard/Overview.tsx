import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Users, Link2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

interface Stats {
  resources: number;
  users: number;
  integrations: number;
  groups: number;
}

interface ActivityLog {
  id: string;
  user_email: string;
  action: string;
  resource_type: string;
  details: any;
  created_at: string;
}

export default function Overview() {
  const [stats, setStats] = useState<Stats>({ resources: 0, users: 0, integrations: 0, groups: 0 });
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Overview - Current user:', user?.id);
      
      if (!user) {
        console.log('Overview - No user found');
        setLoading(false);
        return;
      }

      const { data: member, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      console.log('Overview - Organization member:', member, 'Error:', memberError);

      if (!member) {
        console.log('Overview - No organization found for user');
        setLoading(false);
        return;
      }

      // Load stats
      const [resourcesData, usersData, integrationsData, groupsData] = await Promise.all([
        supabase.from('resources').select('id', { count: 'exact', head: true }).eq('organization_id', member.organization_id),
        supabase.from('organization_members').select('id', { count: 'exact', head: true }).eq('organization_id', member.organization_id),
        supabase.from('integrations').select('id', { count: 'exact', head: true }).eq('organization_id', member.organization_id),
        supabase.from('groups').select('id', { count: 'exact', head: true }).eq('organization_id', member.organization_id),
      ]);

      console.log('Overview - Loading stats for org:', member.organization_id);

      setStats({
        resources: resourcesData.count || 0,
        users: usersData.count || 0,
        integrations: integrationsData.count || 0,
        groups: groupsData.count || 0,
      });

      console.log('Overview - Stats loaded:', {
        resources: resourcesData.count || 0,
        users: usersData.count || 0,
        integrations: integrationsData.count || 0,
        groups: groupsData.count || 0,
      });

      // Load recent activity
      const { data: logsData } = await supabase
        .from('audit_logs')
        .select('id, action, resource_type, details, created_at, profiles(email)')
        .eq('organization_id', member.organization_id)
        .order('created_at', { ascending: false })
        .limit(5);

      const formattedLogs: ActivityLog[] = (logsData || []).map(log => ({
        id: log.id,
        user_email: (log.profiles as any)?.email || 'Невідомий',
        action: log.action,
        resource_type: log.resource_type,
        details: log.details,
        created_at: log.created_at,
      }));

      setActivity(formattedLogs);
      console.log('Overview - Activity logs loaded:', formattedLogs.length, 'items');
    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      name: "Всього ресурсів",
      value: stats.resources.toString(),
      icon: FolderOpen,
      description: "З усіх інтеграцій",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "Активних користувачів",
      value: stats.users.toString(),
      icon: Users,
      description: "Учасників команди",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Інтеграції",
      value: stats.integrations.toString(),
      icon: Link2,
      description: "Підключені сервіси",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      name: "Груп",
      value: stats.groups.toString(),
      icon: CheckCircle2,
      description: "Активних груп",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const getActionText = (log: ActivityLog) => {
    const actionMap: Record<string, string> = {
      create: "створив",
      update: "оновив",
      delete: "видалив",
    };
    const resourceMap: Record<string, string> = {
      resource: "ресурс",
      group: "групу",
      integration: "інтеграцію",
      member: "учасника",
    };
    const action = actionMap[log.action] || log.action;
    const resourceType = resourceMap[log.resource_type] || log.resource_type;
    const resourceName = log.details?.name || log.details?.email || '';
    return `${action} ${resourceType}${resourceName ? ` "${resourceName}"` : ''}`;
  };

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
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground">Завантаження...</div>
        ) : (
          statsData.map((stat) => {
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
          })
        )}
      </div>

      {/* Recent Activity */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Остання активність</CardTitle>
          <CardDescription className="text-base">Останні оновлення у вашій організації</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Завантаження...</div>
          ) : activity.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Активності ще немає</div>
          ) : (
            <div className="space-y-6">
              {activity.map((log) => (
                <div key={log.id} className="flex items-start gap-4 pb-6 border-b last:border-b-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-base">
                      <span className="font-semibold">{log.user_email}</span>{" "}
                      {getActionText(log)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: uk })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
