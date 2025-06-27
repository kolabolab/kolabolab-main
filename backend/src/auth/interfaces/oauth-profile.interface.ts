export interface OAuthProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider: string;
  providerId?: string;
}