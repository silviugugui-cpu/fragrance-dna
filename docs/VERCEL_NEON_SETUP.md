# Vercel + Neon Setup

The Next.js application and its API routes run on Vercel. Neon provides the persistent PostgreSQL database; Studio and the application continue to own all user/profile workflows.

## Accounts and project setup

1. Create or use the Vercel account/team that owns this project.
2. In Vercel Marketplace, install Neon and choose **Create New Neon Account** or link an existing Neon account.
3. Create a Neon project in a region close to the Vercel deployment region. Use the pooled connection string for serverless requests.
4. Add the environment variables below to Vercel. Use the same values for Production and Preview only if those deployments should share users; otherwise create separate Neon branches/databases and secrets.
5. Add the same values to `.env.local` for local development. Never commit `.env.local` or real credentials.

## Required environment variables

```env
DATABASE_URL=postgresql://.../?sslmode=require
AUTH_SESSION_SECRET=<at least 32 random bytes>
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<unique password of at least 12 characters>
```

Generate a session secret locally with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

The `AUTH_SESSION_SECRET` must remain stable across deployments or existing sessions become invalid. Rotate it deliberately to sign out all users.

## Existing accounts

After adding `DATABASE_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` to `.env.local`, run:

```powershell
npm.cmd run db:auth:migrate
```

The command imports accounts from `data/generated/auth-users.json` using their existing password hashes, skips IDs/emails already present, and seeds the configured Studio administrator. It does not delete or rewrite the source JSON file. Neon schema tables are also created automatically on the first authenticated request.

Existing DNA, Grounding, test, and Collection data that was only in browser storage cannot be imported from the server-side account JSON. On a browser where that data still exists, sign in as the matching account; profile data in that account's scoped cache is uploaded on first successful session hydration. Legacy unscoped browser data is intentionally not assigned to an account automatically because its owner cannot be verified.

## Runtime behavior

- Sign-in and sign-up set a signed, `HttpOnly`, `SameSite=Lax` cookie. The server resolves its user ID against Neon on each request.
- User profile writes derive ownership from that cookie; clients cannot choose another `userId`.
- Studio routes, Server Actions, and master-database mutations require the configured admin account.
- Local JSON account storage is available only in development and only when `DATABASE_URL` is absent. Production auth fails closed if Neon is not configured.
- Google and Apple sign-in remain development simulations and are rejected in production until real OAuth callback flows and provider credentials are implemented.
- The fragrance master SQLite file remains the bundled read-only recommendation/catalog source; Neon stores accounts and per-user data.