import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Link as LinkIcon, Database, Cloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  name: string;
  type: string;
  integration: string;
  url: string | null;
  status?: string;
  last_synced_at?: string;
}

interface OnboardingMaterial {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  bucket: string;
  mime_type: string | null;
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
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [materials, setMaterials] = useState<OnboardingMaterial[]>([]);
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

      // Get user's groups
      const { data: userGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      const userGroupIds = userGroups?.map(g => g.group_id) || [];

      // Get resources accessible to user's groups
      const { data: accessiblePermissions } = await supabase
        .from('resource_permissions')
        .select('resource_id')
        .in('group_id', userGroupIds);

      const accessibleResourceIds = [...new Set(accessiblePermissions?.map(p => p.resource_id) || [])];

      // Fetch resources (or empty array if no access)
      if (accessibleResourceIds.length > 0) {
        const { data: resourcesData } = await supabase
          .from('resources')
          .select('*')
          .eq('organization_id', member.organization_id)
          .eq('status', 'active')
          .in('id', accessibleResourceIds)
          .order('name');

        setResources(resourcesData || []);
      } else {
        setResources([]);
      }

      // Get user's positions
      const { data: userPositions } = await supabase
        .from('user_positions')
        .select('position_id')
        .eq('user_id', user.id)
        .eq('organization_id', member.organization_id);

      const userPositionIds = userPositions?.map(p => p.position_id) || [];

      if (userPositionIds.length > 0) {
        // Get all ancestor positions (including self and parents via hierarchy)
        const { data: hierarchy } = await supabase
          .from('position_hierarchy')
          .select('ancestor_id')
          .in('descendant_id', userPositionIds)
          .eq('organization_id', member.organization_id);

        const allPositionIds = [...new Set(hierarchy?.map(h => h.ancestor_id) || [])];

        if (allPositionIds.length > 0) {
          // Get materials for these positions
          const { data: positionMaterialLinks } = await supabase
            .from('position_materials')
            .select('material_id')
            .in('position_id', allPositionIds)
            .eq('organization_id', member.organization_id);

          const materialIds = [...new Set(positionMaterialLinks?.map(pm => pm.material_id) || [])];

          if (materialIds.length > 0) {
            const { data: materialsData } = await supabase
              .from('onboarding_materials')
              .select('id, title, description, file_name, file_path, bucket, mime_type')
              .in('id', materialIds)
              .eq('organization_id', member.organization_id)
              .order('title');

            setMaterials(materialsData || []);
          } else {
            setMaterials([]);
          }
        } else {
          setMaterials([]);
        }
      } else {
        setMaterials([]);
      }
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

  const filteredMaterials = materials.filter((material) =>
    material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (material.description && material.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    material.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadMaterial = async (material: OnboardingMaterial) => {
    try {
      const { data, error } = await supabase.storage
        .from(material.bucket)
        .download(material.file_path);

      if (error) {
        console.error('Storage error:', error);
        toast({
          title: "Помилка завантаження",
          description: "Файл не знайдено в сховищі. Зверніться до адміністратора для завантаження матеріалів.",
          variant: "destructive",
        });
        return;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Успішно завантажено",
        description: `Файл ${material.file_name} завантажено`,
      });
    } catch (error) {
      console.error('Error downloading material:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити файл. Спробуйте пізніше.",
        variant: "destructive",
      });
    }
  };

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
      ) : filteredResources.length === 0 && filteredMaterials.length === 0 ? (
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
        <>
          {/* Onboarding Materials Section */}
          {filteredMaterials.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Матеріали онбордингу</h2>
                <Badge variant="secondary">{filteredMaterials.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.map((material) => (
                  <Card
                    key={material.id}
                    className="hover:shadow-lg transition-shadow border-2 cursor-pointer"
                    onClick={() => downloadMaterial(material)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <CardTitle className="text-base truncate">
                            {material.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {material.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {material.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Матеріал посади
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {material.file_name}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Integration Resources Section */}
          {filteredResources.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Ресурси інтеграцій</h2>
                <Badge variant="secondary">{filteredResources.length}</Badge>
              </div>
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
            </div>
          )}
        </>
      )}

      {/* Stats */}
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground text-center">
          Всього доступно: <span className="font-semibold text-foreground">{filteredResources.length + filteredMaterials.length}</span> {(filteredResources.length + filteredMaterials.length) === 1 ? 'ресурс' : 'ресурсів'}
        </p>
      </div>
    </div>
  );
}
