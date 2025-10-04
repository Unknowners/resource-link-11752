import { Button } from "@/components/ui/button";

export interface OAuthPreset {
  name: string;
  type: string;
  auth_type: 'oauth' | 'api_token';
  oauth_authorize_url?: string;
  oauth_token_url?: string;
  oauth_scopes?: string;
  instructions: string;
}

const getRedirectUrl = () => {
  return `${window.location.origin}/dashboard/integrations`;
};

export const OAUTH_PRESETS: OAuthPreset[] = [
  {
    name: "Atlassian - API Token (рекомендовано)",
    type: "atlassian",
    auth_type: "api_token",
    instructions: `🔑 Простий спосіб - API Token + Email:

1. Перейдіть на https://id.atlassian.com/manage-profile/security
2. Натисніть "Create and manage API tokens"
3. "Create API token" → Вкажіть назву → "Create"
4. Скопіюйте токен (показується лише раз!)
5. Вам знадобиться:
   • Email вашого Atlassian акаунту
   • API Token який ви щойно створили

Це дає доступ до всіх Jira + Confluence ресурсів вашого акаунту.`
  },
  {
    name: "Atlassian - OAuth 2.0 (для додатків)",
    type: "atlassian",
    auth_type: "oauth",
    oauth_authorize_url: "https://auth.atlassian.com/authorize",
    oauth_token_url: "https://auth.atlassian.com/oauth/token",
    oauth_scopes: "read:jira-work read:jira-user read:servicedesk-request read:servicemanagement-insight-objects read:confluence-space.summary read:confluence-props read:confluence-content.all read:confluence-content.summary search:confluence read:confluence-user read:confluence-groups offline_access",
    instructions: `⚙️ Складний спосіб - OAuth 2.0 (для організаційних додатків):

1. Створіть OAuth 2.0 app на https://developer.atlassian.com/console/myapps
2. "Create" → "OAuth 2.0 integration"
3. Callback URL: ${getRedirectUrl()}
4. Permissions → Configure всі необхідні scopes
5. Client ID та Secret з Settings

Використовуйте тільки якщо вам потрібен app-to-app доступ.`
  },
  {
    name: "Google Drive",
    type: "google_drive",
    auth_type: "oauth",
    oauth_authorize_url: "https://accounts.google.com/o/oauth2/v2/auth",
    oauth_token_url: "https://oauth2.googleapis.com/token",
    oauth_scopes: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email",
    instructions: `1. Створіть проєкт на https://console.cloud.google.com
2. Увімкніть Google Drive API
3. OAuth consent screen → Налаштуйте дані додатку
4. Credentials → Create OAuth 2.0 Client ID → Web application
5. Authorized redirect URIs: ${getRedirectUrl()}
6. Скопіюйте Client ID та Client Secret`
  },
  {
    name: "GitHub",
    type: "github",
    auth_type: "oauth",
    oauth_authorize_url: "https://github.com/login/oauth/authorize",
    oauth_token_url: "https://github.com/login/oauth/access_token",
    oauth_scopes: "repo read:user",
    instructions: `1. Перейдіть на https://github.com/settings/developers
2. OAuth Apps → New OAuth App
3. Authorization callback URL: ${getRedirectUrl()}
4. Скопіюйте Client ID
5. Generate a new client secret → Скопіюйте`
  },
  {
    name: "Microsoft 365",
    type: "microsoft",
    auth_type: "oauth",
    oauth_authorize_url: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    oauth_token_url: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    oauth_scopes: "Files.Read.All User.Read offline_access",
    instructions: `1. Створіть app на https://portal.azure.com
2. Azure Active Directory → App registrations → New registration
3. Redirect URI (Web): ${getRedirectUrl()}
4. API permissions → Add Microsoft Graph permissions
5. Certificates & secrets → New client secret
6. Скопіюйте Application (client) ID та Secret value`
  },
  {
    name: "Slack",
    type: "slack",
    auth_type: "oauth",
    oauth_authorize_url: "https://slack.com/oauth/v2/authorize",
    oauth_token_url: "https://slack.com/api/oauth.v2.access",
    oauth_scopes: "channels:read files:read users:read",
    instructions: `1. Створіть Slack App на https://api.slack.com/apps
2. OAuth & Permissions → Redirect URLs
3. Додайте: ${getRedirectUrl()}
4. Bot Token Scopes → Add scopes
5. Basic Information → App Credentials
6. Скопіюйте Client ID та Client Secret`
  },
];

interface OAuthPresetsProps {
  onSelect: (preset: OAuthPreset) => void;
}

export function OAuthPresets({ onSelect }: OAuthPresetsProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <p className="text-sm text-muted-foreground mb-2">
        Оберіть готовий шаблон або створіть власну інтеграцію:
      </p>
      {OAUTH_PRESETS.map((preset) => (
        <Button
          key={preset.type}
          variant="outline"
          className="justify-start h-auto py-3"
          onClick={() => onSelect(preset)}
        >
          <div className="text-left">
            <div className="font-medium">{preset.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Тип: {preset.type}
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
}