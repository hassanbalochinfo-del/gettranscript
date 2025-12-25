# Supabase Database Setup

## Connection Strings

You have two connection strings from Supabase:

### 1. Direct Connection (Port 5432)
**Use for:** Local development
```
postgresql://postgres:<YOUR_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require
```

### 2. Pooled Connection (Port 6543)
**Use for:** Production/Vercel (better for serverless)
```
postgresql://postgres.<PROJECT_REF>:<YOUR_PASSWORD>@aws-1-<REGION>.pooler.supabase.com:6543/postgres?sslmode=require
```

## Local Setup (.env.local)

✅ **Already configured** with direct connection

Your `.env.local` now has:
```env
DATABASE_URL="postgresql://postgres:<YOUR_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require"
```

## Vercel Setup

### Step 1: Add Environment Variable

1. Go to: https://vercel.com/dashboard
2. Select your `gettranscript` project
3. **Settings** → **Environment Variables**
4. Click **Add New**
5. Add **two** variables:
   - **Key**: `DATABASE_URL` (runtime / serverless)
   - **Value**: Use the **pooled connection**:
     ```
     postgresql://postgres.<PROJECT_REF>:<YOUR_PASSWORD>@aws-1-<REGION>.pooler.supabase.com:6543/postgres?sslmode=require
     ```
   - **Key**: `DIRECT_URL` (migrations / DDL)
   - **Value**: Use the **direct connection** (recommended with SSL):
     ```
     postgresql://postgres:<YOUR_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require
     ```
   - **Environment**: Select **Production**, **Preview**, and **Development**
6. Click **Save**

### Step 2: Run Migrations

After adding `DATABASE_URL` to Vercel, you need to run migrations.

**Option A: Via Vercel Build Command (Recommended)**
1. Go to **Settings** → **General**
2. Find **Build & Development Settings**
3. Update **Build Command** to:
   ```bash
   prisma generate && prisma migrate deploy && next build
   ```
4. Save

**Option B: Via CLI (After Deployment)**
```bash
# Set DATABASE_URL (runtime) + DIRECT_URL (migrations)
export DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<YOUR_PASSWORD>@aws-1-<REGION>.pooler.supabase.com:6543/postgres?sslmode=require"
export DIRECT_URL="postgresql://postgres:<YOUR_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require"

# Run migrations
npx prisma migrate deploy
```

## Local Development

### Run Migrations Locally

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### Start Dev Server

```bash
npm run dev
```

## Why Two Connection Strings?

- **Pooled (6543)** (`DATABASE_URL`): Best for production/serverless (prevents “too many connections”)
- **Direct (5432)** (`DIRECT_URL`): Required for Prisma migrations / table creation (DDL)

## Security Notes

⚠️ **Important**: These connection strings contain your database password. Keep them secure:
- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Only add to Vercel Environment Variables (not in code)
- ✅ Don't share these publicly

If you ever shared a real password publicly, rotate it in Supabase immediately.

## Next Steps

1. ✅ Local `.env.local` is configured
2. ⏳ **Add `DATABASE_URL` to Vercel** (use pooled connection)
3. ⏳ **Update Vercel Build Command** to include migrations
4. ⏳ **Redeploy** on Vercel
5. ✅ Test locally: `npm run dev`

## Troubleshooting

### "Connection refused" in Vercel
- **Fix**: Make sure you're using the **pooled connection** (port 6543) in Vercel
- Direct connection may not work from Vercel's IPs

### "SSL required"
- **Fix**: The pooled connection already has `?sslmode=require`
- If using direct connection, add `?sslmode=require` to the end

### "Too many connections"
- **Fix**: Use the pooled connection (port 6543) for production
- Pooled connections handle this automatically
