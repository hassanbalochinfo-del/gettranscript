# Implementation Guide: Authentication, Subscriptions & Credits

## Quick Start

### 1. Database Setup

```bash
# Install dependencies (already done)
npm install

# Set up Prisma
npx prisma generate
npx prisma migrate dev --name init
```

### 2. Environment Variables

Add to `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gettranscript?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Lemon Squeezy
LEMONSQUEEZY_WEBHOOK_SECRET="your-webhook-secret-from-lemon-squeezy"
NEXT_PUBLIC_LS_STARTER_URL="https://your-store.lemonsqueezy.com/checkout/buy/variant-id-1"
NEXT_PUBLIC_LS_PRO_URL="https://your-store.lemonsqueezy.com/checkout/buy/variant-id-2"
NEXT_PUBLIC_LS_PLUS_URL="https://your-store.lemonsqueezy.com/checkout/buy/variant-id-3"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Lemon Squeezy Setup

#### Getting Checkout URLs:
1. Go to Lemon Squeezy Dashboard → Products
2. Click on each product (Starter, Pro, Plus)
3. Copy the "Checkout URL" for each variant
4. Paste into `.env.local` as shown above

#### Setting Up Webhook:
1. Go to Lemon Squeezy Dashboard → Settings → Webhooks
2. Create new webhook
3. URL: `https://your-domain.com/api/lemonsqueezy/webhook`
4. Events to subscribe:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_payment_success`
   - `subscription_payment_failed`
   - `subscription_cancelled`
5. Copy the "Signing Secret" → paste as `LEMONSQUEEZY_WEBHOOK_SECRET`

#### Mapping Plan Variants:
Update `lib/lemonsqueezy.ts` → `mapLemonSqueezyPlanToPlanType()`:
```typescript
const variantIdMap: Record<string, PlanType> = {
  "12345": "starter",  // Replace with actual variant IDs
  "12346": "pro",
  "12347": "plus",
}
```

### 4. Database Migration

```bash
# Create migration
npx prisma migrate dev --name add-auth-subscriptions

# Generate Prisma Client
npx prisma generate
```

### 5. Link Customers to Users

**Important**: The webhook needs to link Lemon Squeezy customers to your users.

**Option A: Store customer_id during signup** (if you collect email in checkout)
- Add `lemonsqueezyCustomerId` field to User model
- Update signup to store it

**Option B: Use email matching** (simpler)
- Update webhook to find user by email from Lemon Squeezy customer data
- Add email lookup in `handleSubscriptionCreated`

**Option C: Custom checkout fields** (recommended)
- Add custom field in Lemon Squeezy checkout: `user_id`
- Pass user ID in checkout URL parameter
- Store mapping in database

### 6. Testing

#### Test Signup/Login:
1. Go to `/signup`
2. Create account
3. Go to `/login`
4. Log in

#### Test Webhook (Local):
Use ngrok or similar:
```bash
ngrok http 3000
# Use ngrok URL in Lemon Squeezy webhook settings
```

#### Test Credit Gating:
1. Create user with 0 credits
2. Try to export transcript → should see error
3. Add credits via database:
```sql
UPDATE users SET "creditsBalance" = 10 WHERE email = 'test@example.com';
```
4. Try export again → should work

## File Structure

```
app/
  api/
    auth/
      [...nextauth]/route.ts    # NextAuth handler
      signup/route.ts            # Signup endpoint
    lemonsqueezy/
      webhook/route.ts           # Webhook handler
    me/route.ts                  # User data endpoint
    transcript/
      export/route.ts            # Credit-gated export
  account/
    page.tsx                     # Account dashboard
  login/
    page.tsx                     # Login page
  signup/
    page.tsx                     # Signup page
  pricing/
    page.tsx                     # Pricing with checkout links

lib/
  auth.ts                        # NextAuth config
  db.ts                          # Prisma client
  constants.ts                   # UI copy & plan config
  lemonsqueezy.ts                # Webhook utilities

prisma/
  schema.prisma                  # Database schema

components/
  providers.tsx                  # SessionProvider wrapper
  upgrade-banner.tsx             # Upgrade prompts
  upgrade-modal.tsx              # Upgrade modals

middleware.ts                    # Route protection
```

## Key Features Implemented

✅ **Authentication**
- Email/password signup & login
- NextAuth with JWT sessions
- Protected routes middleware

✅ **Subscriptions**
- Lemon Squeezy webhook integration
- Subscription status tracking
- Plan management (starter/pro/plus)

✅ **Credits System**
- Credit balance on user
- Credit ledger for auditing
- Monthly credit allocation on subscription
- Credits roll over (never expire)

✅ **Credit Gating**
- Export requires active subscription
- Export requires credits > 0
- Automatic credit deduction
- Clear error messages

✅ **UI Components**
- Account page with subscription & credits
- Pricing page with checkout links
- Upgrade banners & modals
- Professional copy

## Common Issues

### "User not found for customer ID" in webhook
- **Fix**: Implement customer-to-user linking (see step 5 above)

### Credits not adding on subscription
- **Check**: Webhook signature verification
- **Check**: Event names match Lemon Squeezy payload
- **Check**: Database transaction success

### Export still works without subscription
- **Check**: `/api/transcript/export` is being called (not client-side download)
- **Check**: Middleware is protecting `/app/result`

### NextAuth session not persisting
- **Check**: `NEXTAUTH_SECRET` is set
- **Check**: `NEXTAUTH_URL` matches your domain
- **Check**: SessionProvider wraps app in layout

## Next Steps

1. **Test webhook locally** with ngrok
2. **Deploy to Vercel** with environment variables
3. **Test full flow**: Signup → Subscribe → Export
4. **Monitor webhook logs** in Vercel dashboard
5. **Set up error alerts** for webhook failures

## Support

For issues:
- Check webhook logs in Vercel
- Check Prisma migrations
- Verify environment variables
- Test with Postman/curl
