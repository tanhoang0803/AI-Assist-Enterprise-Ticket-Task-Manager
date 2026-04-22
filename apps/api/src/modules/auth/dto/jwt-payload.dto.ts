export interface JwtPayload {
  sub: string;           // Auth0 user ID (e.g. "auth0|abc123")
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
  aud: string | string[];
  iss: string;
  iat: number;
  exp: number;
}
