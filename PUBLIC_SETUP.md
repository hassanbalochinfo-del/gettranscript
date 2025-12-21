# GetTranscript - Public Tool Setup Guide

This is now a **public, free tool** - no authentication required! Anyone can use it to get YouTube video transcripts.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables** (`.env.local`):
   ```env
   # Optional: Google AdSense for monetization
   NEXT_PUBLIC_ADSENSE_ID=your-adsense-publisher-id
   
   # Optional: AssemblyAI for AI transcription (if you want to support videos without captions)
   ASSEMBLYAI_API_KEY=your-assemblyai-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Features

✅ **Public Access** - No login required
✅ **YouTube URL Transcription** - Paste any YouTube video URL (including Shorts)
✅ **File Upload** - Upload audio/video files for transcription
✅ **Rate Limiting** - 5 requests per session to prevent abuse
✅ **Google AdSense** - Monetization ready (add your AdSense ID)
✅ **Copy & Download** - Easy transcript export

## How It Works

1. **User visits the site** → Main page with URL input
2. **Pastes YouTube URL** → System tries multiple methods to extract captions
3. **Gets transcript** → Displays result with copy/download options
4. **Rate limiting** → Prevents abuse (5 requests per session)

## Rate Limiting

- **Limit**: 5 transcript requests per session
- **Reset**: After 1 hour or page refresh
- **Storage**: Client-side (sessionStorage) + Server-side validation
- **Error**: Friendly message when limit reached

## Google AdSense Setup

1. **Get your AdSense Publisher ID:**
   - Go to [Google AdSense](https://www.google.com/adsense/)
   - Get your publisher ID (format: `ca-pub-XXXXXXXXXX`)

2. **Add to environment:**
   ```env
   NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXX
   ```

3. **Ad Placements:**
   - Top banner (below navbar)
   - In-article ads (between transcript sections)
   - Bottom banner (above footer)

4. **AdSense Requirements:**
   - Your site must have original content
   - Must comply with AdSense policies
   - Site must be live (not just localhost)
   - Wait for AdSense approval before ads show

## Error Handling

The tool handles various scenarios:

- **No captions available**: Shows helpful message suggesting to try different videos
- **Rate limit reached**: Clear message with instructions
- **Invalid URL**: Validates YouTube URL format
- **Network errors**: Graceful error messages

## What You'll Need

### For Basic Operation (Free):
- ✅ Nothing! Works out of the box
- ✅ YouTube videos with captions

### For Monetization:
- Google AdSense account (free)
- AdSense Publisher ID

### For Advanced Features (Optional):
- AssemblyAI API key (for videos without captions)
- Costs: ~$0.00025 per minute of audio

## Deployment

1. **Deploy to Vercel/Netlify:**
   ```bash
   npm run build
   ```

2. **Add environment variables** in your hosting platform

3. **Set up AdSense:**
   - Submit your site for AdSense approval
   - Once approved, ads will automatically appear

## Future Enhancements (When Adding Paid Features)

The codebase is structured to easily add:
- User authentication (Supabase ready)
- Database storage (schema file included)
- Paid subscriptions
- User history
- Advanced features

For now, keep it simple and free!

## Troubleshooting

### "No captions found" error
- The video must have captions enabled on YouTube
- Check the video on YouTube first - look for CC button
- Some videos, especially Shorts, may not have accessible captions

### Rate limiting too strict?
- Edit `lib/rate-limit.ts` to change `MAX_REQUESTS` (currently 5)
- Edit `lib/rate-limit-client.ts` to change client-side limit

### AdSense not showing?
- Make sure `NEXT_PUBLIC_ADSENSE_ID` is set
- Wait for AdSense approval (can take days/weeks)
- Check AdSense dashboard for status

### AssemblyAI not working?
- Make sure `ASSEMBLYAI_API_KEY` is set
- Check API key is valid
- Verify you have credits in your AssemblyAI account
