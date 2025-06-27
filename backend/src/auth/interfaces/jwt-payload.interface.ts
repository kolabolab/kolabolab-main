export interface JwtPayload {
  sub: string;
  email: string;
  roles?: string[];
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
}