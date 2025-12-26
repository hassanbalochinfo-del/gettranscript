-- Safe SQL: Creates tables and indexes only if they don't exist
-- Run this in Supabase SQL Editor - it won't error if tables already exist

CREATE SCHEMA IF NOT EXISTS "public";

-- Create tables (IF NOT EXISTS handles existing tables)
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,
    "creditsBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3),
    "lemonsqueezySubscriptionId" TEXT,
    "lemonsqueezyCustomerId" TEXT,
    "lemonsqueezyOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "credit_ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "description" TEXT,
    "externalId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "credit_ledger_pkey" PRIMARY KEY ("id")
);

-- Create indexes (PostgreSQL doesn't support IF NOT EXISTS for indexes, so we use DO block)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_email_key') THEN
        CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'accounts_provider_providerAccountId_key') THEN
        CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'sessions_sessionToken_key') THEN
        CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'verification_tokens_token_key') THEN
        CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'verification_tokens_identifier_token_key') THEN
        CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'subscriptions_lemonsqueezySubscriptionId_key') THEN
        CREATE UNIQUE INDEX "subscriptions_lemonsqueezySubscriptionId_key" ON "subscriptions"("lemonsqueezySubscriptionId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'subscriptions_lemonsqueezyOrderId_key') THEN
        CREATE UNIQUE INDEX "subscriptions_lemonsqueezyOrderId_key" ON "subscriptions"("lemonsqueezyOrderId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'subscriptions_userId_idx') THEN
        CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'subscriptions_lemonsqueezySubscriptionId_idx') THEN
        CREATE INDEX "subscriptions_lemonsqueezySubscriptionId_idx" ON "subscriptions"("lemonsqueezySubscriptionId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'credit_ledger_externalId_key') THEN
        CREATE UNIQUE INDEX "credit_ledger_externalId_key" ON "credit_ledger"("externalId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'credit_ledger_userId_idx') THEN
        CREATE INDEX "credit_ledger_userId_idx" ON "credit_ledger"("userId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'credit_ledger_externalId_idx') THEN
        CREATE INDEX "credit_ledger_externalId_idx" ON "credit_ledger"("externalId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'credit_ledger_type_idx') THEN
        CREATE INDEX "credit_ledger_type_idx" ON "credit_ledger"("type");
    END IF;
END $$;

-- Add foreign keys (using DO block to check existence)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_userId_fkey') THEN
        ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_userId_fkey') THEN
        ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_userId_fkey') THEN
        ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'credit_ledger_userId_fkey') THEN
        ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
