# Database Setup Guide

## Quick Setup Options

### Option 1: Vercel Postgres (Recommended - Easiest)

1. Go to your Vercel project dashboard
2. Click **Storage** → **Create Database** → **Postgres**
3. Vercel will automatically:
   - Create the database
   - Add `POSTGRES_URL` environment variable
   - Set up connection pooling

4. **Update your code** to use `POSTGRES_URL`:
   - In Vercel, the connection string is available as `POSTGRES_URL`
   - Update `prisma/schema.prisma` or use `POSTGRES_URL` directly

5. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```
   Or add to Vercel build command:
   ```bash
   prisma generate && prisma migrate deploy && next build
   ```

### Option 2: Supabase (Free Tier Available)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection string** (URI format)
5. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
6. Paste this as `DATABASE_URL` in Vercel environment variables

### Option 3: Neon (Serverless Postgres)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from dashboard
4. Format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
5. Add as `DATABASE_URL` in Vercel

### Option 4: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the connection string from the service
4. Add as `DATABASE_URL` in Vercel

## Setting Up Environment Variable in Vercel

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add:
   - **Name**: `DATABASE_URL`
   - **Value**: Your full PostgreSQL connection string
   - **Environment**: Production (and Preview if needed)
4. Click **Save**

## Connection String Format

The connection string must be in this format:

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**Example:**
```
postgresql://myuser:Sd7PspB1bhmWeXBj@db.example.com:5432/gettranscript?schema=public
```

**Breaking it down:**
- `postgresql://` - Protocol (required)
- `myuser` - Database username
- `Sd7PspB1bhmWeXBj` - Password (your password)
- `@db.example.com` - Database host
- `:5432` - Port (default is 5432)
- `/gettranscript` - Database name
- `?schema=public` - Schema (usually `public`)

## Running Migrations

After setting up the database:

### Option A: Via Vercel Build Command
Update your Vercel project settings:
- **Build Command**: `prisma generate && prisma migrate deploy && next build`

### Option B: Via CLI (After Deployment)
```bash
# Set DATABASE_URL locally
export DATABASE_URL="your-connection-string"

# Run migrations
npx prisma migrate deploy
```

### Option C: Via Vercel CLI
```bash
vercel env pull  # Get environment variables
npx prisma migrate deploy
```

## Verifying Connection

Test your connection string locally:
```bash
# Set the variable
export DATABASE_URL="your-full-connection-string"

# Test with Prisma
npx prisma db pull
```

If this works, your connection string is correct!

## Common Issues

### "URL must start with postgresql://"
- **Fix**: Make sure your connection string starts with `postgresql://` or `postgres://`
- Don't use just the password - you need the full URL

### "Connection refused"
- **Fix**: Check that your database host allows connections from Vercel's IPs
- Some databases require IP whitelisting

### "Authentication failed"
- **Fix**: Double-check username and password
- Make sure special characters in password are URL-encoded

### "Database does not exist"
- **Fix**: Create the database first, or use the default `postgres` database

## Next Steps

1. Choose a database provider (Vercel Postgres is easiest)
2. Get the full connection string
3. Add it to Vercel as `DATABASE_URL`
4. Run migrations
5. Test the deployment
