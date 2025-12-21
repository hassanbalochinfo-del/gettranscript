# Google OAuth Setup Guide for Supabase

Follow these steps to enable Google OAuth sign-in in your Supabase project:

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in the required information (App name, User support email, Developer contact)
   - Add your email to test users (for development)
   - Save and continue through the scopes and test users steps
6. Back in Credentials, create OAuth client ID:
   - Application type: **Web application**
   - Name: `GetTranscript` (or any name)
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - Authorized redirect URIs:
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     - Replace `YOUR_PROJECT_REF` with your actual Supabase project reference
   - Click **Create**
7. Copy the **Client ID** and **Client Secret**

## Step 2: Enable Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Click to enable it
6. Enter your Google OAuth credentials:
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
7. Click **Save**

## Step 3: Verify Redirect URI

Make sure the redirect URI in Google Console matches:
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

You can find your project reference in:
- Supabase Dashboard → Settings → API → Project URL
- It's the part after `https://` and before `.supabase.co`

## Step 4: Test

1. Go to your app's login page
2. Click "Continue with Google"
3. You should be redirected to Google sign-in
4. After signing in, you'll be redirected back to your app

## Troubleshooting

### "Unsupported provider" error
- Make sure Google provider is **enabled** in Supabase
- Check that you saved the credentials correctly
- Refresh the page and try again

### Redirect URI mismatch
- Verify the redirect URI in Google Console exactly matches:
  `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes or typos

### OAuth consent screen issues
- Make sure you've configured the OAuth consent screen
- Add your email to test users if the app is in testing mode
- Publish the app if you want it available to all users

### Still not working?
1. Check Supabase logs: **Logs** → **Auth Logs**
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Make sure you're using the correct Supabase project

## Quick Reference

**Google Console:**
- [APIs & Services](https://console.cloud.google.com/apis/credentials)
- [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)

**Supabase:**
- Authentication → Providers → Google

**Redirect URI Format:**
```
https://[PROJECT_REF].supabase.co/auth/v1/callback
```
