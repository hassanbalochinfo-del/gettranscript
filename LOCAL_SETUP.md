# Local Development Setup

## Quick Start

### 1. Set Up Database

You need a PostgreSQL database. Options:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb gettranscript
```

Then update `.env.local`:
```
DATABASE_URL="postgresql://$(whoami):@localhost:5432/gettranscript?schema=public"
```

**Option B: Use a Cloud Database (Easiest)**
- Vercel Postgres (free tier)
- Supabase (free tier)
- Neon (free tier)
- Railway (free tier)

Get the connection string and paste into `.env.local`

### 2. Update .env.local

Your `.env.local` should have:

```env
# Database - REQUIRED
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth - REQUIRED
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Existing
TRANSCRIPTAPI_KEY="your-key"
```

### 3. Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output and paste as `NEXTAUTH_SECRET` in `.env.local`

### 4. Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### 5. Start Development Server

```bash
npm run dev
```

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- **Fix**: Make sure `.env.local` exists and has `DATABASE_URL`
- Check the file is in the project root
- Restart your dev server after adding variables

### "URL must start with postgresql://"
- **Fix**: Your `DATABASE_URL` must start with `postgresql://` or `postgres://`
- Don't use just the password - you need the full connection string

### "Connection refused"
- **Fix**: Make sure PostgreSQL is running locally
- Check the host/port in your connection string
- For cloud databases, check firewall/network settings

### "Database does not exist"
- **Fix**: Create the database first
- Or use an existing database name in your connection string

## Next Steps

1. ✅ Set up database (local or cloud)
2. ✅ Update `.env.local` with `DATABASE_URL`
3. ✅ Generate `NEXTAUTH_SECRET`
4. ✅ Run `npx prisma migrate dev`
5. ✅ Start dev server: `npm run dev`

## For Vercel Deployment

Remember to also add these environment variables in Vercel:
- Settings → Environment Variables
- Add `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- See `VERCEL_ENV_SETUP.md` for details
