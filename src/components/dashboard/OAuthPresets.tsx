import { Button } from "@/components/ui/button";

export interface OAuthPreset {
  name: string;
  type: string;
  oauth_authorize_url: string;
  oauth_token_url: string;
  oauth_scopes: string;
  instructions: string;
}

export const OAUTH_PRESETS: OAuthPreset[] = [
  {
    name: "Jira Cloud",
    type: "jira",
    oauth_authorize_url: "https://auth.atlassian.com/authorize",
    oauth_token_url: "https://auth.atlassian.com/oauth/token",
    oauth_scopes: "read:jira-work read:jira-user",
    instructions: "1. Створіть OAuth 2.0 app на https://developer.atlassian.com/console/myapps\n2. Додайте Callback URL: [YOUR_DOMAIN]/dashboard/integrations\n3. Скопіюйте Client ID та Secret"
  },
  {
    name: "Google Drive",
    type: "google_drive",
    oauth_authorize_url: "https://accounts.google.com/o/oauth2/v2/auth",
    oauth_token_url: "https://oauth2.googleapis.com/token",
    oauth_scopes: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email",
    instructions: "1. Створіть проєкт на https://console.cloud.google.com\n2. Увімкніть Google Drive API\n3. Створіть OAuth 2.0 Client ID\n4. Додайте Authorized redirect URI: [YOUR_DOMAIN]/dashboard/integrations"
  },
  {
    name: "GitHub",
    type: "github",
    oauth_authorize_url: "https://github.com/login/oauth/authorize",
    oauth_token_url: "https://github.com/login/oauth/access_token",
    oauth_scopes: "repo read:user",
    instructions: "1. Перейдіть на https://github.com/settings/developers\n2. Створіть новий OAuth App\n3. Authorization callback URL: [YOUR_DOMAIN]/dashboard/integrations"
  },
  {
    name: "Microsoft 365",
    type: "microsoft",
    oauth_authorize_url: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    oauth_token_url: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    oauth_scopes: "Files.Read.All User.Read",
    instructions: "1. Створіть app на https://portal.azure.com\n2. Azure Active Directory -> App registrations\n3. Додайте Redirect URI: [YOUR_DOMAIN]/dashboard/integrations"
  },
  {
    name: "Slack",
    type: "slack",
    oauth_authorize_url: "https://slack.com/oauth/v2/authorize",
    oauth_token_url: "https://slack.com/api/oauth.v2.access",
    oauth_scopes: "channels:read files:read users:read",
    instructions: "1. Створіть Slack App на https://api.slack.com/apps\n2. OAuth & Permissions -> Redirect URLs\n3. Додайте: [YOUR_DOMAIN]/dashboard/integrations"
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