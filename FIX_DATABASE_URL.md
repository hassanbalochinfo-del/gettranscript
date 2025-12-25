# ⚠️ FIX REQUIRED: DATABASE_URL Environment Variable

## The Problem

Your Vercel deployment is failing because `DATABASE_URL` is either:
1. **Not set** in Vercel environment variables, OR
2. **Set incorrectly** (doesn't start with `postgresql://`)

## Quick Fix (5 minutes)

### Step 1: Get a Database

**Option A: Vercel Postgres (Easiest - Recommended)**
1. Go to: https://vercel.com/dashboard
2. Select your `gettranscript` project
3. Click **Storage** tab
4. Click **Create Database** → **Postgres**
5. Vercel will automatically add `POSTGRES_URL`
6. **Copy the `POSTGRES_URL` value**

**Option B: Use Existing Database**
- Get your full PostgreSQL connection string from your provider
- It must look like: `postgresql://user:pass@host:port/db?schema=public`

### Step 2: Add to Vercel

1. In Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Key**: `DATABASE_URL`
   - **Value**: Your full connection string (starts with `postgresql://`)
   - **Environment**: Select **Production**, **Preview**, and **Development**
5. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or wait for auto-deploy (if enabled)

## Connection String Format

**Must be exactly:**
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**Examples:**

Vercel Postgres:
```
postgresql://default:xxxxx@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require
```

Supabase:
```
postgresql://postgres:xxxxx@db.xxx.supabase.co:5432/postgres
```

Neon:
```
postgresql://user:xxxxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Common Mistakes

❌ **Wrong**: `<YOUR_PASSWORD>` (just the password)
✅ **Correct**: `postgresql://user:<YOUR_PASSWORD>@host:5432/db?schema=public`

❌ **Wrong**: Missing `postgresql://` prefix
✅ **Correct**: Must start with `postgresql://` or `postgres://`

## After Adding DATABASE_URL

1. ✅ Build will succeed
2. ⚠️ You'll need to run migrations:
   - Update Vercel Build Command to: `prisma generate && prisma migrate deploy && next build`
   - OR run manually after first deployment

## Still Having Issues?

1. **Double-check** the connection string format
2. **Verify** it's added to the correct environment (Production)
3. **Check** database allows connections from Vercel IPs
4. **Test** the connection string locally first

## Need Help?

- Check `DATABASE_SETUP.md` for detailed provider instructions
- Check `VERCEL_ENV_SETUP.md` for all required environment variables
