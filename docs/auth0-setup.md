# Auth0 Setup Guide

Manual steps required before the app can authenticate users.

---

## 1. Create an Auth0 Tenant

1. Sign up at https://auth0.com (free tier is fine)
2. Create a new tenant (e.g. `ai-assist-dev`)

---

## 2. Create a Regular Web Application (Frontend)

1. Applications → Create Application
2. Name: `AI-Assist Web`
3. Type: **Regular Web Applications**
4. Go to Settings tab:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
5. Copy **Domain**, **Client ID**, **Client Secret**

---

## 3. Create an API (Backend)

1. Applications → APIs → Create API
2. Name: `AI-Assist API`
3. Identifier (audience): `https://api.ai-assist.dev` (you choose this)
4. Signing Algorithm: **RS256** (default)

---

## 4. Fill in `.env.local`

```bash
# From your Auth0 Web Application settings:
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=<your-client-id>
AUTH0_CLIENT_SECRET=<your-client-secret>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_SECRET=<random-32+-char-string>  # run: openssl rand -hex 32

# From your Auth0 API settings:
AUTH0_AUDIENCE=https://api.ai-assist.dev
```

---

## 5. Verify the Flow

```
User visits /dashboard
      ↓ (middleware.ts blocks — not authenticated)
Redirect to /api/auth/login
      ↓ (Auth0 SDK)
Auth0 Universal Login page
      ↓ (user signs in)
Callback to /api/auth/callback
      ↓ (Auth0 SDK exchanges code for tokens)
Session cookie set (httpOnly)
      ↓
Redirect to /dashboard
      ↓
Protected layout calls getSession() → session.user available
      ↓
API calls: frontend fetches /api/auth/token → gets access token
           → sends as Authorization: Bearer <token>
           → NestJS JwtStrategy validates RS256 signature via JWKS
           → User upserted in DB on first login (role = MEMBER)
```

---

## 6. Assign Admin Role (Manual)

After first login, run this in Prisma Studio to promote yourself to ADMIN:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Or via Prisma Studio: `pnpm db:studio`

---

## Production Checklist

- [ ] Add production callback/logout URLs in Auth0 app settings
- [ ] Set `AUTH0_BASE_URL` to your Vercel URL
- [ ] Set `AUTH0_SECRET` to a new random value (not the dev one)
- [ ] Enable "Refresh Token Rotation" in Auth0 for long sessions
