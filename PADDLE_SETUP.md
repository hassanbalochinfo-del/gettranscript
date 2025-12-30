# Paddle Integration Setup Guide

## ✅ What's Implemented

- **Paddle webhook handler** at `/api/paddle/webhook`
- **Credit assignment** on `transaction.completed` events
- **Subscription management** (create, update, cancel)
- **Idempotent credit grants** (prevents double-charging)
- **Subscription status check** before transcription
- **Plan → Credits mapping**: Starter (100), Pro (300), Plus (600)
- **Lemon Squeezy code removed**

## 📋 Required Environment Variables

Add these to **Vercel** → **Settings** → **Environment Variables**:

### Paddle Webhook
```
PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret
```

### Paddle Price IDs (for plan mapping)
```
PADDLE_PRICE_STARTER_ID=pri_xxxxx
PADDLE_PRICE_PRO_ID=pri_xxxxx
PADDLE_PRICE_PLUS_ID=pri_xxxxx
```

### Paddle Checkout URLs (hosted checkout links)
```
NEXT_PUBLIC_PADDLE_STARTER_URL=https://buy.paddle.com/product/xxxxx
NEXT_PUBLIC_PADDLE_PRO_URL=https://buy.paddle.com/product/xxxxx
NEXT_PUBLIC_PADDLE_PLUS_URL=https://buy.paddle.com/product/xxxxx
```

## 🔧 Paddle Dashboard Setup

### 1. Create Products & Prices

In Paddle Dashboard → **Products**:
1. Create 3 products: Starter ($5), Pro ($10), Plus ($15)
2. Copy the **Price IDs** (starts with `pri_`)
3. Add them to Vercel env vars as shown above

### 2. Create Checkout Links

For each product:
1. Go to **Checkout Links** → **Create checkout link**
2. Set **Success URL**: `https://YOUR_DOMAIN.com/account?payment=success`
3. Set **Cancel URL**: `https://YOUR_DOMAIN.com/pricing`
4. Copy the checkout URL
5. Add to Vercel as `NEXT_PUBLIC_PADDLE_STARTER_URL`, etc.

### 3. Configure Webhook

1. Go to **Developer Tools** → **Notifications** → **Webhooks**
2. Click **Add webhook**
3. **Webhook URL**: `https://YOUR_DOMAIN.com/api/paddle/webhook`
4. **Events to subscribe**:
   - ✅ `transaction.completed`
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.canceled`
5. Copy the **Webhook signing secret**
6. Add to Vercel as `PADDLE_WEBHOOK_SECRET`

## 🗄️ Database Migration

The Prisma schema has been updated to use Paddle fields instead of Lemon Squeezy:

**Old fields (removed):**
- `lemonsqueezySubscriptionId`
- `lemonsqueezyCustomerId`
- `lemonsqueezyOrderId`

**New fields (added):**
- `paddleSubscriptionId`
- `paddleCustomerId`
- `paddleTransactionId`

**To apply the migration:**

```bash
# Generate Prisma client with new schema
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_paddle_fields

# Or for production:
npx prisma migrate deploy
```

**Or manually update the database:**

```sql
-- Remove old Lemon Squeezy columns
ALTER TABLE subscriptions 
  DROP COLUMN IF EXISTS "lemonsqueezySubscriptionId",
  DROP COLUMN IF EXISTS "lemonsqueezyCustomerId",
  DROP COLUMN IF EXISTS "lemonsqueezyOrderId";

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
```

## 🔍 How It Works

1. **User clicks "Get Started"** → Redirects to Paddle hosted checkout
2. **User completes payment** → Paddle processes payment
3. **Paddle sends webhook** → Your `/api/paddle/webhook` receives `transaction.completed`
4. **Webhook handler**:
   - Verifies signature
   - Finds user by email from webhook payload
   - Determines plan from `price_id`
   - Grants credits (idempotent - uses `transaction_id` as key)
   - Updates/creates subscription record
5. **User redirected to** `/account?payment=success`
6. **Account page polls** `/api/me` for ~30 seconds to show credits immediately

## 🧪 Testing Checklist

- [ ] Paddle products created and Price IDs copied
- [ ] Checkout URLs created with success/cancel URLs
- [ ] Webhook created and secret added to Vercel
- [ ] All env vars added to Vercel
- [ ] Database migration applied
- [ ] Test purchase with Paddle test card
- [ ] Verify credits appear in account page
- [ ] Verify credits don't increase on page refresh
- [ ] Check webhook logs in Vercel (Functions → `/api/paddle/webhook`)
- [ ] Test subscription status check (block transcription without active subscription)

## 🚨 Troubleshooting

### Credits not appearing?
1. Check Vercel function logs: **Deployments** → **Functions** → `/api/paddle/webhook`
2. Verify webhook secret matches in both places
3. Ensure user email in Paddle matches user email in your app
4. Check that webhook events are being received (Paddle → Developer Tools → Notifications)

### "User not found" errors?
- User must sign up in your app **first** (with the same email they use in Paddle checkout)
- Webhook matches users by email address

### "Could not determine plan" errors?
- Verify `PADDLE_PRICE_STARTER_ID`, `PADDLE_PRICE_PRO_ID`, `PADDLE_PRICE_PLUS_ID` are set correctly
- Check that the `price_id` in the webhook payload matches your configured Price IDs

### Double credits?
- Shouldn't happen (idempotency uses transaction ID)
- If it does, check that `externalId` in `credit_ledger` table is unique

## 📝 Removed Files

The following Lemon Squeezy files have been removed:
- `app/api/lemonsqueezy/checkout/route.ts`
- `app/api/lemonsqueezy/webhook/route.ts`
- `lib/lemonsqueezy.ts`

## 🎯 Next Steps

1. **Set up Paddle products** in Paddle Dashboard
2. **Create checkout links** with success/cancel URLs
3. **Configure webhook** and add secret to Vercel
4. **Add all env vars** to Vercel
5. **Run database migration** (or apply SQL manually)
6. **Test the full flow** with a test purchase
