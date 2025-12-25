# Vercel Environment Variables Setup

## Required Environment Variables

You **MUST** add these in Vercel before the build will succeed:

### 1. DATABASE_URL (Required for Build)

**Format:**
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**How to add in Vercel:**
1. Go to: https://vercel.com/dashboard
2. Select your project: `gettranscript`
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `DATABASE_URL`
   - **Value**: Your full PostgreSQL connection string
   - **Environment**: Select **Production**, **Preview**, and **Development**
6. Click **Save**

**Example values:**
```
# Vercel Postgres
postgresql://default:password@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require

# Supabase
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# Neon
postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 2. NEXTAUTH_SECRET (Required)

Generate a random secret:
```bash
openssl rand -base64 32
```

Add to Vercel:
- **Key**: `NEXTAUTH_SECRET`
- **Value**: (paste the generated secret)
- **Environment**: All environments

### 3. NEXTAUTH_URL (Required)

- **Key**: `NEXTAUTH_URL`
- **Value**: `https://your-domain.com` (your actual domain)
- **Environment**: Production

For Preview/Development, use:
- Preview: `https://your-project.vercel.app`
- Development: `http://localhost:3000`

### 4. Lemon Squeezy (Optional for now)

- `LEMONSQUEEZY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_LS_STARTER_URL`
- `NEXT_PUBLIC_LS_PRO_URL`
- `NEXT_PUBLIC_LS_PLUS_URL`

## Quick Setup: Vercel Postgres (Easiest)

1. In Vercel Dashboard → Your Project
2. Click **Storage** tab
3. Click **Create Database** → **Postgres**
4. Vercel will automatically:
   - Create the database
   - Add `POSTGRES_URL` environment variable
   - Set up connection pooling

5. **Then update your code** to use `POSTGRES_URL`:
   - Option A: Rename `POSTGRES_URL` to `DATABASE_URL` in Vercel
   - Option B: Update `prisma/schema.prisma` to use `POSTGRES_URL`

## After Adding Variables

1. **Redeploy** (or wait for auto-deploy)
2. The build should now succeed
3. **Run migrations** after first successful build:
   - Add to Vercel Build Command: `prisma generate && prisma migrate deploy && next build`
   - OR run manually: `npx prisma migrate deploy`

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- **Fix**: Make sure you added `DATABASE_URL` in Vercel Environment Variables
- Make sure you selected the correct environment (Production/Preview)

### "URL must start with postgresql://"
- **Fix**: Your connection string must start with `postgresql://` or `postgres://`
- Don't use just the password - you need the full URL

### "Connection refused" or "Authentication failed"
- **Fix**: Check your connection string is correct
- Make sure database allows connections from Vercel IPs
- Some databases require SSL: add `?sslmode=require` to the end

## Current Status

✅ Code is ready
✅ Build script includes `prisma generate`
⏳ **Waiting for**: `DATABASE_URL` environment variable in Vercel

Once you add `DATABASE_URL`, the build will succeed!
