import type { IntegrationKey } from "@/lib/storage/integration-store";

export type SocialOAuthProvider = "youtube" | "tiktok" | "instagram" | "facebook" | "x" | "linkedin";

export interface SocialOAuthConfig {
  provider: SocialOAuthProvider;
  integrationKey: IntegrationKey;
  name: string;
  clientId: string | undefined;
  clientSecret: string | undefined;
  authUrl: string;
  tokenUrl: string;
  profileUrl?: string;
  scopes: string[];
  setupUrl: string;
  tokenAuth: "body" | "basic";
  extraAuthParams?: Record<string, string>;
}

export const SOCIAL_OAUTH_PROVIDERS: SocialOAuthProvider[] = [
  "youtube",
  "tiktok",
  "instagram",
  "facebook",
  "x",
  "linkedin",
];

export function getSocialOAuthConfig(provider: string): SocialOAuthConfig | null {
  const metaClientId = process.env.META_CLIENT_ID ?? process.env.FACEBOOK_CLIENT_ID;
  const metaClientSecret = process.env.META_CLIENT_SECRET ?? process.env.FACEBOOK_CLIENT_SECRET;

  const configs: Record<SocialOAuthProvider, SocialOAuthConfig> = {
    youtube: {
      provider: "youtube",
      integrationKey: "youtube",
      name: "YouTube",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      profileUrl: "https://openidconnect.googleapis.com/v1/userinfo",
      scopes: (process.env.YOUTUBE_OAUTH_SCOPES ?? "openid email profile https://www.googleapis.com/auth/youtube.readonly")
        .split(/[,\s]+/)
        .filter(Boolean),
      setupUrl: "https://console.cloud.google.com/apis/credentials",
      tokenAuth: "body",
      extraAuthParams: { access_type: "offline", prompt: "consent", include_granted_scopes: "true" },
    },
    tiktok: {
      provider: "tiktok",
      integrationKey: "tiktok",
      name: "TikTok",
      clientId: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      authUrl: "https://www.tiktok.com/v2/auth/authorize/",
      tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
      profileUrl: "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name",
      scopes: (process.env.TIKTOK_OAUTH_SCOPES ?? "user.info.basic").split(/[,\s]+/).filter(Boolean),
      setupUrl: "https://developers.tiktok.com/",
      tokenAuth: "body",
    },
    instagram: {
      provider: "instagram",
      integrationKey: "instagram",
      name: "Instagram",
      clientId: metaClientId,
      clientSecret: metaClientSecret,
      authUrl: "https://www.facebook.com/v20.0/dialog/oauth",
      tokenUrl: "https://graph.facebook.com/v20.0/oauth/access_token",
      profileUrl: "https://graph.facebook.com/v20.0/me?fields=id,name",
      scopes: (process.env.INSTAGRAM_OAUTH_SCOPES ?? "instagram_basic,pages_show_list,business_management")
        .split(/[,\s]+/)
        .filter(Boolean),
      setupUrl: "https://developers.facebook.com/apps/",
      tokenAuth: "body",
    },
    facebook: {
      provider: "facebook",
      integrationKey: "facebook",
      name: "Facebook",
      clientId: metaClientId,
      clientSecret: metaClientSecret,
      authUrl: "https://www.facebook.com/v20.0/dialog/oauth",
      tokenUrl: "https://graph.facebook.com/v20.0/oauth/access_token",
      profileUrl: "https://graph.facebook.com/v20.0/me?fields=id,name",
      scopes: (process.env.FACEBOOK_OAUTH_SCOPES ?? "pages_show_list,pages_read_engagement")
        .split(/[,\s]+/)
        .filter(Boolean),
      setupUrl: "https://developers.facebook.com/apps/",
      tokenAuth: "body",
    },
    x: {
      provider: "x",
      integrationKey: "x",
      name: "X / Twitter",
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
      authUrl: "https://twitter.com/i/oauth2/authorize",
      tokenUrl: "https://api.twitter.com/2/oauth2/token",
      profileUrl: "https://api.twitter.com/2/users/me?user.fields=username,name,profile_image_url",
      scopes: (process.env.X_OAUTH_SCOPES ?? "tweet.read users.read offline.access").split(/[,\s]+/).filter(Boolean),
      setupUrl: "https://developer.x.com/en/portal/dashboard",
      tokenAuth: "basic",
    },
    linkedin: {
      provider: "linkedin",
      integrationKey: "linkedin",
      name: "LinkedIn",
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authUrl: "https://www.linkedin.com/oauth/v2/authorization",
      tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
      profileUrl: "https://api.linkedin.com/v2/userinfo",
      scopes: (process.env.LINKEDIN_OAUTH_SCOPES ?? "openid profile email w_member_social").split(/[,\s]+/).filter(Boolean),
      setupUrl: "https://www.linkedin.com/developers/apps",
      tokenAuth: "body",
    },
  };

  return SOCIAL_OAUTH_PROVIDERS.includes(provider as SocialOAuthProvider)
    ? configs[provider as SocialOAuthProvider]
    : null;
}

export function isSocialOAuthConfigured(config: SocialOAuthConfig): boolean {
  return Boolean(config.clientId && config.clientSecret);
}
