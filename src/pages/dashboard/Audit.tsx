import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export default function Audit() {
  const events = [
    {
      id: "1",
      timestamp: "2025-01-15 14:32",
      actor: "Іван Петренко",
      action: "Додано ресурс",
      entity: "Project Alpha",
      details: "Новий Jira проект додано до організації",
    },
    {
      id: "2",
      timestamp: "2025-01-15 13:15",
      actor: "Олена Коваль",
      action: "Запрошено користувача",
      entity: "Микола Сидоренко",
      details: "Надіслано email-запрошення на mikola@demo.com",
    },
    {
      id: "3",
      timestamp: "2025-01-15 11:45",
      actor: "Admin",
      action: "Підключено інтеграцію",
      entity: "Jira",
      details: "OAuth автентифікація успішно завершена",
    },
    {
      id: "4",
      timestamp: "2025-01-14 16:20",
      actor: "Марія Шевченко",
      action: "Створено групу",
      entity: "Marketing Team",
      details: "Нова група з 3 учасниками",
    },
  ];

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      "Додано ресурс": "bg-blue-50 text-blue-700 border-blue-200",
      "Запрошено користувача": "bg-green-50 text-green-700 border-green-200",
      "Підключено інтеграцію": "bg-purple-50 text-purple-700 border-purple-200",
      "Створено групу": "bg-orange-50 text-orange-700 border-orange-200",
    };
    return (
      <Badge variant="outline" className={colors[action] || ""}>
        {action}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display">Аудит-лог</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Повна історія дій в організації
        </p>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Пошук по користувачу, дії або сутності..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Всі дії" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі дії</SelectItem>
                <SelectItem value="resources">Ресурси</SelectItem>
                <SelectItem value="users">Користувачі</SelectItem>
                <SelectItem value="integrations">Інтеграції</SelectItem>
                <SelectItem value="groups">Групи</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Історія подій</CardTitle>
          <CardDescription>
            Хронологічний список всіх дій в системі
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Час</TableHead>
                <TableHead>Користувач</TableHead>
                <TableHead>Дія</TableHead>
                <TableHead>Сутність</TableHead>
                <TableHead>Деталі</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {event.timestamp}
                  </TableCell>
                  <TableCell className="font-medium">{event.actor}</TableCell>
                  <TableCell>{getActionBadge(event.action)}</TableCell>
                  <TableCell>{event.entity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {event.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
