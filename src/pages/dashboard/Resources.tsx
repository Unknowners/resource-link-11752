import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Link as LinkIcon, Database, Cloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Resource {
  id: string;
  name: string;
  type: string;
  integration: string;
  url: string | null;
  status?: string;
  last_synced_at?: string;
}

const getResourceIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "document":
    case "page":
      return FileText;
    case "link":
      return LinkIcon;
    case "database":
      return Database;
    default:
      return Cloud;
  }
};

const getIntegrationColor = (integration: string) => {
  const colors: Record<string, string> = {
    notion: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    confluence: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    github: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    slack: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  };
  return colors[integration.toLowerCase()] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!member) return;

      const { data: resourcesData } = await supabase
        .from('resources')
        .select('*')
        .eq('organization_id', member.organization_id)
        .eq('status', 'active')
        .order('name');

      setResources(resourcesData || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter((resource) =>
    resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.integration.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl mb-2">Доступні джерела</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Перегляд усіх доступних вам ресурсів та документів
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук за назвою, типом або інтеграцією..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Resources List */}
      {loading ? (
        <div className="text-center text-muted-foreground py-12">
          Завантаження...
        </div>
      ) : filteredResources.length === 0 ? (
        <Card className="border-2">
          <CardContent className="p-12 text-center">
            <Cloud className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {searchQuery ? "Нічого не знайдено" : "Немає доступних ресурсів"}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Спробуйте змінити пошуковий запит"
                : "Ресурси з'являться тут після підключення інтеграцій"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const Icon = getResourceIcon(resource.type);
            return (
              <Card
                key={resource.id}
                className="hover:shadow-lg transition-shadow border-2 cursor-default"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-base truncate">
                        {resource.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={getIntegrationColor(resource.integration)}
                    >
                      {resource.integration}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                  {resource.url && (
                    <p className="text-xs text-muted-foreground truncate">
                      {resource.url}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground text-center">
          Всього доступно: <span className="font-semibold text-foreground">{filteredResources.length}</span> {filteredResources.length === 1 ? 'ресурс' : 'ресурсів'}
        </p>
      </div>
    </div>
  );
}
