-- Migration: Replace Lemon Squeezy fields with Paddle fields in subscriptions table
-- Run this manually or via Prisma migrate

-- Remove old Lemon Squeezy columns (if they exist)
ALTER TABLE subscriptions 
  DROP COLUMN IF EXISTS "lemonsqueezySubscriptionId",
  DROP COLUMN IF EXISTS "lemonsqueezyCustomerId",
  DROP COLUMN IF EXISTS "lemonsqueezyOrderId";

-- Drop old indexes (if they exist)
DROP INDEX IF EXISTS "subscriptions_lemonsqueezySubscriptionId_key";
DROP INDEX IF EXISTS "subscriptions_lemonsqueezyOrderId_key";
DROP INDEX IF EXISTS "subscriptions_lemonsqueezySubscriptionId_idx";

-- Add new Paddle columns
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS "paddleSubscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "paddleCustomerId" TEXT,
  ADD COLUMN IF NOT EXISTS "paddleTransactionId" TEXT;

-- Create unique index on paddleSubscriptionId
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_paddleSubscriptionId_key" 
  ON subscriptions("paddleSubscriptionId");

-- Create index for lookups
CREATE INDEX IF NOT EXISTS "subscriptions_paddleSubscriptionId_idx" 
  ON subscriptions("paddleSubscriptionId");
