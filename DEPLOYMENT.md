# Vercel Deployment Guide

This app is ready for deployment on Vercel. Follow these steps:

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A GitHub/GitLab/Bitbucket repository (optional, but recommended)

## Environment Variables

Set these environment variables in your Vercel project settings:

### Required
- `TRANSCRIPTAPI_KEY` - Your TranscriptAPI.com API key (server-only, never exposed to client)

### Optional
- `OPENAI_API_KEY` - For translation feature (server-only)
- `ASSEMBLYAI_API_KEY` - For file upload transcription (server-only)
- `NEXT_PUBLIC_ADSENSE_CLIENT` - Your Google AdSense client ID (public)
- `NEXT_PUBLIC_ADSENSE_SLOT_HOME` - AdSense slot ID for homepage (public)
- `NEXT_PUBLIC_ADSENSE_SLOT_RESULT` - AdSense slot ID for result page (public)
- `NEXT_PUBLIC_APP_URL` - Your app URL (e.g., `https://your-domain.vercel.app`) - used for file uploads

## Deployment Steps

1. **Push your code to a Git repository** (if not already done)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Vercel will auto-detect Next.js settings

3. **Add environment variables**
   - In your Vercel project dashboard, go to Settings → Environment Variables
   - Add all required variables listed above
   - Make sure `TRANSCRIPTAPI_KEY` is set (required for the app to work)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app automatically

## Build Verification

The app builds successfully with:
```bash
npm run build
```

All API routes are configured with `export const runtime = "nodejs"` where needed.

## Security Checklist

✅ All API keys are server-only (no `NEXT_PUBLIC_` prefix for secrets)
✅ `.env` files are in `.gitignore`
✅ No hardcoded secrets in code
✅ No debug logs in production code
✅ All server routes use Node.js runtime

## Notes

- The file upload feature (`/api/upload`) writes to the filesystem, which may have limitations on Vercel's serverless functions. Consider using Vercel Blob Storage or similar for production file storage if needed.
- The app uses in-memory caching and rate limiting, which resets on each serverless function invocation. For production at scale, consider using Redis or similar.

## Support

If you encounter issues:
1. Check Vercel build logs
2. Verify all environment variables are set correctly
3. Ensure `TRANSCRIPTAPI_KEY` is valid and active
