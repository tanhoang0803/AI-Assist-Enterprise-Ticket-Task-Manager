export interface JwtPayload {
  sub: string;   // user DB id
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
}
