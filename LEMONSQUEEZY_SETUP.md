# Lemon Squeezy Integration Setup Guide

## ✅ What's Already Done
- Webhook handler implemented at `/api/lemonsqueezy/webhook`
- Credit granting logic (idempotent, prevents double-charging)
- Account page auto-refreshes credits after checkout
- Products created in Lemon Squeezy (Starter $5, Pro $10, Plus $15)

## 📋 Step-by-Step Setup

### 1. Get Checkout URLs

For each product (Starter, Pro, Plus):
1. Go to **Products** → Click on the product
2. Click the **"Share"** button (or find "Checkout URL" in product settings)
3. Copy the checkout URL
4. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_LS_STARTER_URL=https://YOUR_STORE.lemonsqueezy.com/checkout/buy/...
   NEXT_PUBLIC_LS_PRO_URL=https://YOUR_STORE.lemonsqueezy.com/checkout/buy/...
   NEXT_PUBLIC_LS_PLUS_URL=https://YOUR_STORE.lemonsqueezy.com/checkout/buy/...
   ```

### 2. Get Variant IDs (Recommended)

For each product:
1. Open the product → Go to **Variants** tab
2. Copy the **Variant ID** (numeric, e.g., `12345`)
3. Add to Vercel:
   ```
   LEMONSQUEEZY_VARIANT_STARTER_ID=12345
   LEMONSQUEEZY_VARIANT_PRO_ID=12346
   LEMONSQUEEZY_VARIANT_PLUS_ID=12347
   ```

### 3. Configure Webhooks

1. Go to **Settings** → **Webhooks**
2. Click **"Create webhook"**
3. **Webhook URL**: `https://YOUR_DOMAIN.com/api/lemonsqueezy/webhook`
   - Replace `YOUR_DOMAIN` with your actual domain (e.g., `get-transcript.vercel.app`)
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

### 4. Set Checkout Success/Cancel URLs

For each product variant:
1. Go to **Products** → Click product → **Variants** tab
2. Edit the variant
3. Find **"Redirect URLs"** or **"Success/Cancel URLs"** section
4. Set:
   - **Success URL**: `https://YOUR_DOMAIN.com/account?payment=success`
   - **Cancel URL**: `https://YOUR_DOMAIN.com/pricing`
5. Save

### 5. Enable Test Mode (For Testing)

1. Toggle **"Test mode"** ON (bottom left of Lemon Squeezy dashboard)
2. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)
3. Test the full flow:
   - Click "Get Started" on pricing page
   - Complete checkout with test card
   - Should redirect to `/account?payment=success`
   - Credits should appear within a few seconds

## 🔍 How It Works

1. **User clicks "Get Started"** → Redirects to Lemon Squeezy checkout
2. **User completes payment** → Lemon Squeezy processes payment
3. **Lemon Squeezy sends webhook** → Your `/api/lemonsqueezy/webhook` receives event
4. **Webhook handler**:
   - Verifies signature
   - Finds user by email from webhook payload
   - Grants credits (idempotent - won't double-charge)
   - Updates subscription status
5. **User redirected to** `/account?payment=success`
6. **Account page polls** `/api/me` for ~30 seconds to show credits immediately

## 🧪 Testing Checklist

- [ ] Checkout URLs added to Vercel env vars
- [ ] Variant IDs added to Vercel env vars (optional)
- [ ] Webhook created and secret added to Vercel
- [ ] Success/Cancel URLs configured in Lemon Squeezy
- [ ] Test mode enabled
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

## 📝 Environment Variables Summary

Add these to **Vercel** → **Settings** → **Environment Variables**:

```
# Checkout URLs (required)
NEXT_PUBLIC_LS_STARTER_URL=https://...
NEXT_PUBLIC_LS_PRO_URL=https://...
NEXT_PUBLIC_LS_PLUS_URL=https://...

# Variant IDs (optional, but recommended)
LEMONSQUEEZY_VARIANT_STARTER_ID=12345
LEMONSQUEEZY_VARIANT_PRO_ID=12346
LEMONSQUEEZY_VARIANT_PLUS_ID=12347

# Webhook secret (required)
LEMONSQUEEZY_WEBHOOK_SECRET=your_secret_here
```

## 🎯 Next Steps After Setup

1. **Test in Test Mode** first
2. **Wait for Lemon Squeezy application approval** (if still pending)
3. **Disable Test Mode** when ready for production
4. **Monitor webhook logs** in Vercel for any errors
