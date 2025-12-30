# Paddle Integration Setup Guide

## ✅ What's Already Implemented

- ✅ Paddle webhook handler at `/api/paddle/webhook`
- ✅ Credit granting logic (idempotent, prevents double-charging)
- ✅ Account page auto-refreshes credits after checkout
- ✅ Paddle checkout buttons on pricing pages
- ✅ Subscription management (create, update, cancel)

## 📋 Step-by-Step Setup

### 1. Create Products in Paddle

1. Go to **Paddle Dashboard** → **Catalog** → **Products**
2. Create 3 subscription products:
   - **Starter**: $5/month → 100 credits
   - **Pro**: $10/month → 200 credits
   - **Plus**: $15/month → 500 credits
3. For each product, copy the **Price ID** (you'll need this)

### 2. Get Price IDs

For each product you created:
1. Go to **Paddle Dashboard** → **Catalog** → **Products**
2. Click on the product
3. Copy the **Price ID** (looks like `pri_01...`)
4. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_PADDLE_PRICE_STARTER_ID=pri_01...
   NEXT_PUBLIC_PADDLE_PRICE_PRO_ID=pri_01...
   NEXT_PUBLIC_PADDLE_PRICE_PLUS_ID=pri_01...
   ```

### 3. Set Up Webhook

1. Go to **Paddle Dashboard** → **Developer Tools** → **Notifications** (or **Webhooks**)
2. Click **"Add endpoint"** or **"Create webhook"**
3. **Webhook URL**: `https://YOUR_DOMAIN.com/api/paddle/webhook`
   - Replace `YOUR_DOMAIN` with your actual domain
   - Example: `https://gettranscript.vercel.app/api/paddle/webhook`
4. **Events to subscribe to** (check all):
   - ✅ `transaction.completed`
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.canceled`
5. Click **"Create"** or **"Save"**
6. **Copy the webhook signing secret** (shown after creation)
7. Add to Vercel:
   - **Key**: `PADDLE_WEBHOOK_SECRET`
   - **Value**: (paste the secret)
   - **Environment**: All environments

### 4. Configure Checkout Success URL

In Paddle, configure your checkout to redirect to:
- **Success URL**: `https://YOUR_DOMAIN.com/account?payment=success`
- **Cancel URL**: `https://YOUR_DOMAIN.com/pricing`

This can usually be set in:
- **Paddle Dashboard** → **Settings** → **Checkout**
- Or via Paddle API when creating checkout links

### 5. Run Database Migration

The schema has been updated to add Paddle fields. Run:

```bash
npx prisma migrate dev --name add_paddle_fields
```

Or if deploying to production:

```bash
npx prisma migrate deploy
```

### 6. Test It!

1. **Enable Test Mode** in Paddle (if available)
2. Go to your website → **Pricing** page
3. Click **"Get Started"** on any plan
4. Complete checkout with test card
5. Should redirect to `/account?payment=success`
6. Credits should appear within a few seconds!

## 🔍 How It Works

1. **User clicks "Get Started"** → Redirects to Paddle checkout
2. **User completes payment** → Paddle processes payment
3. **Paddle sends webhook** → Your `/api/paddle/webhook` receives `transaction.completed` event
4. **Webhook handler**:
   - Verifies signature
   - Finds user by email from webhook payload
   - Grants credits (idempotent - won't double-charge)
   - Updates subscription status
5. **User redirected to** `/account?payment=success`
6. **Account page polls** `/api/me` for ~30 seconds to show credits immediately

## 🧪 Testing Checklist

- [ ] Price IDs added to Vercel env vars
- [ ] Webhook created and secret added to Vercel
- [ ] Success/Cancel URLs configured in Paddle
- [ ] Database migration run
- [ ] Test purchase with test card
- [ ] Verify credits appear in account page
- [ ] Verify credits don't increase on page refresh
- [ ] Check webhook logs in Vercel (Functions → `/api/paddle/webhook`)

## 🚨 Troubleshooting

### Credits not appearing?
1. Check Vercel function logs: **Deployments** → **Functions** → `/api/paddle/webhook`
2. Verify webhook secret matches in both places
3. Ensure user email in Paddle matches user email in your app
4. Check that webhook events are being received (Paddle Dashboard → Webhooks → View logs)

### "User not found" errors?
- User must sign up in your app **first** (with the same email they use in Paddle checkout)
- Webhook matches users by email address

### Double credits?
- Shouldn't happen (idempotency uses transaction ID)
- If it does, check that `externalId` in `credit_ledger` table is unique

## 📝 Environment Variables Summary

Add these to **Vercel** → **Settings** → **Environment Variables**:

```
# Paddle Price IDs (required)
NEXT_PUBLIC_PADDLE_PRICE_STARTER_ID=pri_01...
NEXT_PUBLIC_PADDLE_PRICE_PRO_ID=pri_01...
NEXT_PUBLIC_PADDLE_PRICE_PLUS_ID=pri_01...

# Webhook secret (required)
PADDLE_WEBHOOK_SECRET=your_secret_here
```

## 🎯 Next Steps After Setup

1. **Test in Test Mode** first (if Paddle supports it)
2. **Monitor webhook logs** in Vercel for any errors
3. **Go live** when ready!
