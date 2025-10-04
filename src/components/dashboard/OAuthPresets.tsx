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
  return `${window.location.origin}/app/integrations`;
};

export const OAUTH_PRESETS: OAuthPreset[] = [
  {
    name: "Atlassian (Jira, Confluence)",
    type: "atlassian",
    auth_type: "api_token",
    instructions: `1. Перейдіть на https://id.atlassian.com/manage-profile/security
2. Натисніть "Create and manage API tokens"
3. "Create API token" → Вкажіть назву → "Create"
4. Скопіюйте токен (показується лише раз!)
5. Вам знадобиться:
   • Atlassian Site URL (наприклад: yourcompany.atlassian.net)
   • Email вашого Atlassian акаунту
   • API Token який ви щойно створили

Дає доступ до всіх Jira + Confluence ресурсів вашого акаунту.`
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
  {
    name: "Notion",
    type: "notion",
    auth_type: "oauth",
    oauth_authorize_url: "https://api.notion.com/v1/oauth/authorize",
    oauth_token_url: "https://api.notion.com/v1/oauth/token",
    oauth_scopes: "",
    instructions: `1. Створіть Notion Integration на https://www.notion.so/my-integrations
2. New integration → Дайте назву → Submit
3. Integration type → Public
4. Заповніть обов'язкові поля:
   • Company name: Documinds (або ваша назва)
   • Website: https://documinds.online
   • Tagline: Resource access management system
   • Privacy Policy URL: https://documinds.online/privacy
   • Terms of Use URL: https://documinds.online/terms
   • Email: ваш email
   • Logo: використайте логотип https://documinds.online/documinds-logo.png
5. Redirect URIs → Add URI: https://documinds.online/app/integrations
6. Authorization URL: https://api.notion.com/v1/oauth/authorize
7. Capabilities → Read content, Read user, Read comments
8. Distribution → Make public
9. Скопіюйте OAuth client ID та OAuth client secret

Після підключення ви зможете працювати з усіма Notion workspaces автоматично.`
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