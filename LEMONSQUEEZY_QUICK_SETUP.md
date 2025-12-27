# 🚀 Lemon Squeezy Quick Setup (Step-by-Step)

## ✅ Step 1: Add Starter Checkout URL to Vercel

**You already have this:**
```
https://gettranscript.lemonsqueezy.com/checkout/buy/b6ff88c6-8788-49f0-a283-490297038d2a
```

**Now add it to Vercel:**
1. Go to: https://vercel.com/dashboard
2. Select your project (`gettranscript` or your project name)
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `NEXT_PUBLIC_LS_STARTER_URL`
   - **Value**: `https://gettranscript.lemonsqueezy.com/checkout/buy/b6ff88c6-8788-49f0-a283-490297038d2a`
   - **Environment**: Select **Production**, **Preview**, and **Development**
6. Click **Save**

---

## 📋 Step 2: Get Pro and Plus Checkout URLs

**For Pro Plan:**
1. Go to Lemon Squeezy → **Products**
2. Click on **"GetTranscript Pro"**
3. Click the **"Share"** button (or find checkout URL in product settings)
4. Copy the checkout URL
5. Add to Vercel:
   - **Key**: `NEXT_PUBLIC_LS_PRO_URL`
   - **Value**: (paste Pro checkout URL)
   - **Environment**: All environments

**For Plus Plan:**
1. Click on **"GetTranscript Plus"**
2. Click the **"Share"** button
3. Copy the checkout URL
4. Add to Vercel:
   - **Key**: `NEXT_PUBLIC_LS_PLUS_URL`
   - **Value**: (paste Plus checkout URL)
   - **Environment**: All environments

---

## 🔗 Step 3: Set Up Webhook

**First, find your Vercel domain:**
- Go to Vercel → Your Project → **Settings** → **Domains**
- Your domain will be something like:
  - `gettranscript.vercel.app` (default)
  - OR your custom domain like `gettranscript.com`

**Then create webhook in Lemon Squeezy:**
1. Go to Lemon Squeezy → **Settings** → **Webhooks**
2. Click **"Create webhook"**
3. **Webhook URL**: `https://YOUR_DOMAIN.com/api/lemonsqueezy/webhook`
   - Replace `YOUR_DOMAIN` with your actual Vercel domain
   - Example: `https://gettranscript.vercel.app/api/lemonsqueezy/webhook`
4. **Events to subscribe to** (check all):
   - ✅ `subscription_created`
   - ✅ `subscription_updated`
   - ✅ `subscription_payment_success`
   - ✅ `subscription_payment_failed`
   - ✅ `subscription_cancelled`
5. Click **"Create webhook"**
6. **Copy the webhook signing secret** (shown after creation)
7. Add to Vercel:
   - **Key**: `LEMONSQUEEZY_WEBHOOK_SECRET`
   - **Value**: (paste the secret)
   - **Environment**: All environments

---

## ⚙️ Step 4: Configure Success/Cancel URLs

**For each product (Starter, Pro, Plus):**
1. Go to Lemon Squeezy → **Products** → Click on the product
2. Go to **Variants** tab
3. Click **Edit** on the variant
4. Find **"Redirect URLs"** or **"Success/Cancel URLs"** section
5. Set:
   - **Success URL**: `https://YOUR_DOMAIN.com/account?payment=success`
     - Example: `https://gettranscript.vercel.app/account?payment=success`
   - **Cancel URL**: `https://YOUR_DOMAIN.com/pricing`
     - Example: `https://gettranscript.vercel.app/pricing`
6. Click **Save**

---

## 🧪 Step 5: Test It!

1. **Enable Test Mode** in Lemon Squeezy (bottom left toggle)
2. Go to your website → **Pricing** page
3. Click **"Get Started"** on any plan
4. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)
5. Complete checkout
6. Should redirect to `/account?payment=success`
7. Credits should appear within a few seconds!

---

## 📝 Summary: All Environment Variables Needed

Add these to **Vercel** → **Settings** → **Environment Variables**:

```
✅ NEXT_PUBLIC_LS_STARTER_URL=https://gettranscript.lemonsqueezy.com/checkout/buy/b6ff88c6-8788-49f0-a283-490297038d2a
⏳ NEXT_PUBLIC_LS_PRO_URL=(get from Lemon Squeezy)
⏳ NEXT_PUBLIC_LS_PLUS_URL=(get from Lemon Squeezy)
⏳ LEMONSQUEEZY_WEBHOOK_SECRET=(get from Lemon Squeezy webhook)
```

---

## 🆘 Need Help?

**What's your Vercel domain?** 
- Check: Vercel → Your Project → Settings → Domains
- Tell me the domain and I'll give you the exact webhook URL to use!
