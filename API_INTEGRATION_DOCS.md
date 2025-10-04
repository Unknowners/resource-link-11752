# DocuMinds API Integration Documentation

## Огляд системи

DocuMinds - це платформа для управління доступом до ресурсів організації через інтеграції з різними сервісами (Notion, Jira, Confluence, Google Drive тощо).

### Архітектура

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth (email/password)
- **Real-time**: Supabase Realtime subscriptions

---

## Підключення до Supabase

### Креденшали

```typescript
// Отримайте з Supabase Dashboard -> Settings -> API
const SUPABASE_URL = 'https://[your-project-ref].supabase.co'
const SUPABASE_ANON_KEY = '[your-anon-key]'
const SUPABASE_SERVICE_KEY = '[your-service-role-key]' // Для backend операцій
```

### Підключення (TypeScript/Node.js)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
```

### Підключення (Python)

```python
from supabase import create_client, Client

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
```

---

## Структура бази даних

### 1. **organizations** - Організації

Зберігає інформацію про організації (компанії).

| Поле | Тип | Опис |
|------|-----|------|
| `id` | uuid | Унікальний ідентифікатор |
| `name` | text | Назва організації |
| `created_at` | timestamp | Дата створення |

**Бізнес-логіка**: Кожна організація ізольована, дані не перетинаються між організаціями.

---

### 2. **profiles** - Профілі користувачів

Розширена інформація про користувачів (синхронізується з auth.users).

| Поле | Тип | Опис |
|------|-----|------|
| `id` | uuid | FK до auth.users |
| `email` | text | Email користувача |
| `full_name` | text | Повне ім'я |
| `avatar_url` | text | URL аватара |
| `organization_id` | uuid | FK до organizations |
| `created_at` | timestamp | Дата створення |

**Бізнес-логіка**: 
- Автоматично створюється через тригер при реєстрації
- Один користувач = одна організація

---

### 3. **user_roles** - Ролі користувачів

Система ролей для контролю доступу.

| Поле | Тип | Опис |
|------|-----|------|
| `id` | uuid | Унікальний ідентифікатор |
| `user_id` | uuid | FK до auth.users |
| `role` | app_role | Enum: 'admin', 'moderator', 'user' |

**Бізнес-логіка**:
- `admin`: Повний доступ до організації
- `moderator`: Управління користувачами та групами
- `user`: Базовий доступ до ресурсів

**Перевірка ролі** (використовуйте функцію):
```sql
SELECT has_role(auth.uid(), 'admin'::app_role)
```

---

### 4. **organization_members** - Члени організації

Зв'язок користувачів з організаціями.

| Поле | Тип | Опис |
|------|-----|------|
| `id` | uuid | Унікальний ідентифікатор |
| `organization_id` | uuid | FK до organizations |
| `user_id` | uuid | FK до auth.users |
| `joined_at` | timestamp | Дата приєднання |

---

### 5. **invitations** - Запрошення

Запрошення нових користувачів до організації.

| Поле | Тип | Опис |
|------|-----|------|
| `id` | uuid | Унікальний ідентифікатор |
| `organization_id` | uuid | FK до organizations |
| `email` | text | Email запрошеного |
| `token` | text | Унікальний токен запрошення |
| `invited_by` | uuid | FK до auth.users (хто запросив) |
| `expires_at` | timestamp | Дата закінчення |
| `used_at` | timestamp | Дата використання (null якщо не використане) |
| `created_at` | timestamp | Дата створення |

**Бізнес-логіка**:
- Запрошення дійсне 7 днів
- Після реєстрації `used_at` встановлюється
- Email надсилається через Edge Function `send-invitation`

---

### 6. **integrations** - Інтеграції

Підключені сервіси (Notion, Jira, Confluence тощо).

| Поле | Тип | Опис |
|------|-----|------|
| `id` | uuid | Унікальний ідентифікатор |
| `organization_id` | uuid | FK до organizations |
| `name` | text | Назва інтеграції (Notion, Jira, etc.) |
| `status` | text | 'connected', 'disconnected', 'error' |
| `connected_at` | timestamp | Дата підключення |
| `last_synced_at` | timestamp | Остання синхронізація |
| `created_at` | timestamp | Дата створення |

**Бізнес-логіка**:
- При видаленні інтеграції автоматично видаляються всі пов'язані ресурси та credentials (CASCADE)

---

### 7. **integration_credentials** - Креденшали інтеграцій

Зашифровані OAuth токени та API ключі.

| Поле | Тип | Опис |
|------|-----|------|
| `id` | uuid | Унікальний ідентифікатор |
| `integration_id` | uuid | FK до integrations (ON DELETE CASCADE) |
| `access_token` | text | Зашифрований access token |
| `refresh_token` | text | Зашифрований refresh token |
| `expires_at` | timestamp | Коли токен закінчується |
| `created_at` | timestamp | Дата створення |

**⚠️ БЕЗПЕКА**: 
- Токени зашифровані
- Доступ тільки через Edge Functions
- Ніколи не витягуйте напряму з клієнта

---

### 8. **resources** - Ресурси з інтеграцій

Документи, сторінки, задачі з підключених сервісів.

| Поле | Тип | Опис |
|------|-----|------|
| `id` | uuid | Унікальний ідентифікатор |
| `organization_id` | uuid | FK до organizations |
| `integration` | text | Назва інтеграції (deprecated) |
| `integration_id` | uuid | FK до integrations (ON DELETE CASCADE) |
| `name` | text | Назва ресурсу |
| `type` | text | Тип ('page', 'database', 'issue', etc.) |
| `url` | text | Посилання на ресурс |
| `external_id` | text | ID в зовнішній системі |
| `created_at` | timestamp | Дата створення |
| `last_synced_at` | timestamp | Остання синхронізація |

**Бізнес-логіка**:
- Синхронізуються через Edge Functions (sync-notion-resources, etc.)
- При видаленні інтеграції автоматично видаляються

---

### 9. **groups** - Групи доступу

Групи для організації користувачів (відділи, проекти).

| Поле | Тип | Опис |
|------|-----|------|
| `id` | uuid | Унікальний ідентифікатор |
| `organization_id` | uuid | FK до organizations |
| `name` | text | Назва групи |
| `description` | text | Опис групи |
| `created_at` | timestamp | Дата створення |

---

### 10. **group_members** - Члени груп

Зв'язок користувачів з групами.

| Поле | Тип | Опис |
|------|-----|------|
| `id` | uuid | Унікальний ідентифікатор |
| `group_id` | uuid | FK до groups |
| `user_id` | uuid | FK до auth.users |
| `role` | text | Роль в групі ('member', 'lead') |
| `joined_at` | timestamp | Дата приєднання |

---

### 11. **resource_permissions** - Дозволи на ресурси

Матриця доступу: хто має доступ до яких ресурсів.

| Поле | Тип | Опис |
|------|-----|------|
| `id` | uuid | Унікальний ідентифікатор |
| `resource_id` | uuid | FK до resources |
| `group_id` | uuid | FK до groups (nullable) |
| `user_id` | uuid | FK до auth.users (nullable) |
| `permission` | text | 'view', 'edit', 'admin' |
| `granted_at` | timestamp | Дата надання доступу |

**Бізнес-логіка**:
- Доступ може бути наданий групі АБО користувачу
- Пріоритет: user_id > group_id

---

### 12. **audit_logs** - Журнал аудиту

Логи всіх дій користувачів для безпеки та compliance.

| Поле | Тип | Опис |
|------|-----|------|
| `id` | uuid | Унікальний ідентифікатор |
| `organization_id` | uuid | FK до organizations |
| `user_id` | uuid | FK до auth.users |
| `action` | text | Тип дії ('login', 'grant_access', etc.) |
| `resource_type` | text | Тип ресурсу |
| `resource_id` | uuid | ID ресурсу |
| `details` | jsonb | Додаткова інформація |
| `ip_address` | text | IP адреса |
| `created_at` | timestamp | Дата події |

**Бізнес-логіка**:
- Автоматично логуються критичні дії
- Незмінювані записи (тільки INSERT)

---

## Edge Functions API

### 1. **send-invitation**

Надсилає запрошення користувачу через email.

**Endpoint**: `POST /functions/v1/send-invitation`

**Body**:
```json
{
  "email": "user@example.com",
  "organizationName": "Acme Corp",
  "inviterName": "John Doe"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Запрошення надіслано успішно",
  "emailId": "re_123456"
}
```

---

### 2. **sync-notion-resources**

Синхронізує ресурси з Notion.

**Endpoint**: `POST /functions/v1/sync-notion-resources`

**Body**:
```json
{
  "integrationId": "uuid-here"
}
```

**Response**:
```json
{
  "success": true,
  "syncedCount": 42
}
```

---

### 3. **oauth-callback**

Обробляє OAuth callback від інтеграцій.

**Endpoint**: `GET /functions/v1/oauth-callback?code=xxx&state=yyy`

---

### 4. **oauth-refresh**

Оновлює OAuth токени перед закінченням.

**Endpoint**: `POST /functions/v1/oauth-refresh`

**Body**:
```json
{
  "integrationId": "uuid-here"
}
```

---

## Приклади використання

### Отримати всі ресурси організації

```javascript
const { data: resources, error } = await supabase
  .from('resources')
  .select('*, integrations(*)')
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false })
```

### Витягнути дані Notion для обробки

```python
# Отримати активні Notion інтеграції
response = supabase.table('integrations')\
  .select('id, organization_id, integration_credentials(access_token)')\
  .eq('name', 'Notion')\
  .eq('status', 'connected')\
  .execute()

for integration in response.data:
    # Декодувати токен та отримати дані через Notion API
    org_id = integration['organization_id']
    access_token = integration['integration_credentials']['access_token']
    
    # Витягнути ресурси
    resources = supabase.table('resources')\
      .select('*')\
      .eq('integration_id', integration['id'])\
      .execute()
```

### Перевірити роль користувача

```sql
-- Через SQL функцію
SELECT has_role('user-uuid-here'::uuid, 'admin'::app_role);
```

```javascript
// Через RPC
const { data: isAdmin } = await supabase
  .rpc('has_role', { 
    _user_id: userId, 
    _role: 'admin' 
  })
```

---

## Row Level Security (RLS)

Всі таблиці захищені RLS політиками:

- **Ізоляція організацій**: Користувачі бачать тільки дані своєї організації
- **Ролі**: Адміни мають повний доступ, user - обмежений
- **Інвайти**: Тільки адміни можуть запрошувати
- **Audit logs**: Read-only для всіх, write - через тригери

---

## Безпека

### ⚠️ Критично важливо

1. **Ніколи не використовуйте ANON_KEY для адмін операцій**
2. **Токени інтеграцій зашифровані** - доступ тільки через Edge Functions
3. **Перевірка ролей через has_role()** - не через прямі запити до user_roles
4. **Audit logs** для compliance - всі чутливі операції логуються

### Рекомендації для MSP інтеграції

- Використовуйте `SERVICE_ROLE_KEY` тільки на backend
- Шифруйте дані в транзиті (HTTPS/TLS)
- Валідуйте всі вхідні дані
- Логуйте всі операції витягування даних
- Використовуйте rate limiting

---

## Контакти та підтримка

- **Документація**: https://docs.lovable.dev
- **API Reference**: Supabase Auto-generated Docs
- **Support**: admin@documinds.com
