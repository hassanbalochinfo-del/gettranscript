# Lemon Squeezy Integration Setup Guide

## ✅ What's Already Implemented

- ✅ Lemon Squeezy webhook handler at `/api/lemonsqueezy/webhook`
- ✅ Credit granting logic (idempotent, prevents double-charging)
- ✅ Account page auto-refreshes credits after checkout
- ✅ API-based checkout with redirect URLs
- ✅ Subscription management (create, update, cancel)

## 📋 Step-by-Step Setup

### 1. Create Products in Lemon Squeezy

1. Go to **Lemon Squeezy Dashboard** → **Products**
2. Create 3 subscription products:
   - **Starter**: $5/month → 100 credits
   - **Pro**: $10/month → 200 credits
   - **Plus**: $15/month → 500 credits
3. For each product, copy the **Variant ID** (you'll need this)

### 2. Get Variant IDs

For each product:
1. Go to **Products** → Click on the product
2. Go to **Variants** tab
3. Copy the **Variant ID** (numeric, e.g., `12345`)
4. Add to Vercel environment variables:
   ```
   LEMONSQUEEZY_VARIANT_STARTER_ID=12345
   LEMONSQUEEZY_VARIANT_PRO_ID=12346
   LEMONSQUEEZY_VARIANT_PLUS_ID=12347
   ```

### 3. Get API Key and Store ID

1. Go to **Lemon Squeezy Dashboard** → **Settings** → **API**
2. Create an **API Key** (if you don't have one)
3. Copy the **API Key**
4. Find your **Store ID** (usually in the URL or Settings)
5. Add to Vercel:
   ```
   LEMONSQUEEZY_API_KEY=your_api_key_here
   LEMONSQUEEZY_STORE_ID=260798
   ```

### 4. Configure Webhooks

1. Go to **Lemon Squeezy Dashboard** → **Settings** → **Webhooks**
2. Click **"Create webhook"**
3. **Webhook URL**: `https://www.gettranscript.co/api/lemonsqueezy/webhook`
4. **Events to subscribe to** (check all):
   - ✅ `subscription_created`
   - ✅ `subscription_updated`
   - ✅ `subscription_payment_success`
   - ✅ `subscription_payment_failed`
   - ✅ `subscription_cancelled`
5. Click **"Create webhook"**
6. **Copy the webhook signing secret** (shown after creation)
7. Add to Vercel:
   ```
   LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

### 5. Configure Checkout Success URLs

For each product variant:
1. Go to **Products** → Click product → **Variants** tab
2. Edit the variant
3. Find **"Purchase confirmation modal"** section
4. Set **Button link** to: `https://www.gettranscript.co/account?payment=success`
5. In **"Email receipt"** section, set **Button link** to: `https://www.gettranscript.co/account?payment=success`
6. Save

**Note:** The actual redirect happens via the API checkout's `redirect_url`, but these button links are also useful.

## 🔍 How It Works

1. **User clicks "Get Started"** → Calls `/api/lemonsqueezy/checkout` API
2. **API creates checkout** → Lemon Squeezy returns checkout URL with `redirect_url` set
3. **User completes payment** → Lemon Squeezy processes payment
4. **Lemon Squeezy sends webhook** → Your `/api/lemonsqueezy/webhook` receives `subscription_payment_success` event
5. **Webhook handler**:
   - Verifies signature
   - Finds user by email from webhook payload
   - Grants credits (idempotent - won't double-charge)
   - Updates subscription status
6. **User redirected to** `/account?payment=success`
7. **Account page polls** `/api/me` for ~30 seconds to show credits immediately

## 🧪 Testing Checklist

- [ ] Products created in Lemon Squeezy
- [ ] Variant IDs added to Vercel env vars
- [ ] API key and Store ID added to Vercel
- [ ] Webhook created and secret added to Vercel
- [ ] Success URLs configured in Lemon Squeezy
- [ ] Test purchase with test card
- [ ] Verify credits appear in account page
- [ ] Verify credits don't increase on page refresh
- [ ] Check webhook logs in Vercel (Functions → `/api/lemonsqueezy/webhook`)

## 🚨 Troubleshooting

### Credits not appearing?
1. Check Vercel function logs: **Deployments** → **Functions** → `/api/lemonsqueezy/webhook`
2. Verify webhook secret matches in both places
3. Ensure user email in Lemon Squeezy matches user email in your app
4. Check that webhook events are being received (Lemon Squeezy → Settings → Webhooks → View logs)

### "User not found" errors?
- User must sign up in your app **first** (with the same email they use in Lemon Squeezy checkout)
- Webhook matches users by email address

### Double credits?
- Shouldn't happen (idempotency uses invoice ID)
- If it does, check that `externalId` in `credit_ledger` table is unique

### Checkout not working?
- Verify `LEMONSQUEEZY_API_KEY` and `LEMONSQUEEZY_STORE_ID` are set
- Check that variant IDs are correct
- Ensure user is logged in (checkout requires authentication)

## 📝 Environment Variables Summary

Add these to **Vercel** → **Settings** → **Environment Variables**:

```
# API Configuration (required)
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_STORE_ID=260798

# Variant IDs (required)
LEMONSQUEEZY_VARIANT_STARTER_ID=12345
LEMONSQUEEZY_VARIANT_PRO_ID=12346
LEMONSQUEEZY_VARIANT_PLUS_ID=12347

# Webhook secret (required)
LEMONSQUEEZY_WEBHOOK_SECRET=your_secret_here
```

## 🎯 Next Steps After Setup

1. **Test in Test Mode** first (if available)
2. **Monitor webhook logs** in Vercel for any errors
3. **Go live** when ready!
