# Fix: "prepared statement already exists" Error

## The Problem

When using Supabase's **pooled connection** (port 6543 / PgBouncer), Prisma tries to use prepared statements which PgBouncer doesn't support, causing:

```
Error: prepared statement "s0" already exists
```

## The Solution

Add `?pgbouncer=true&connection_limit=1` to your **pooled connection URL** in `DATABASE_URL`.

### Updated Connection String Format

**For Vercel Environment Variables:**

```
DATABASE_URL="postgresql://postgres.tzlbxeytvgbiuxsdmzba:IhkqR13SjDcdh6b7@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1"
```

**What these parameters do:**
- `pgbouncer=true` - Tells Prisma to disable prepared statements (required for PgBouncer)
- `connection_limit=1` - Limits to 1 connection per serverless function (prevents connection pool exhaustion)

**DIRECT_URL stays the same** (for migrations):
```
DIRECT_URL="postgresql://postgres:IhkqR13SjDcdh6b7@db.tzlbxeytvgbiuxsdmzba.supabase.co:5432/postgres?sslmode=require"
```

## Steps to Fix

1. **Update Vercel Environment Variables:**
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Edit `DATABASE_URL`
   - Add `&pgbouncer=true&connection_limit=1` to the end
   - Save

2. **Update Local `.env` files:**
   - Already updated in `.env` and `.env.local`

3. **Redeploy:**
   - Vercel will automatically redeploy, or manually trigger a redeploy

## Why This Works

- **PgBouncer** (Supabase's connection pooler) doesn't support prepared statements
- Prisma uses prepared statements by default for performance
- Adding `pgbouncer=true` tells Prisma to use regular queries instead
- `connection_limit=1` ensures each serverless function uses only one connection

## Alternative: Use Direct Connection

If you still have issues, you can use the direct connection (5432) for runtime too:

```
DATABASE_URL="postgresql://postgres:IhkqR13SjDcdh6b7@db.tzlbxeytvgbiuxsdmzba.supabase.co:5432/postgres?sslmode=require"
```

**Note:** Direct connections may hit connection limits in serverless environments, so the pooled connection with `pgbouncer=true` is recommended.
