# GetTranscript - Setup Guide

This guide will help you set up the GetTranscript Next.js application with full functionality.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- npm or pnpm package manager

## Step 1: Install Dependencies

```bash
npm install
# or
pnpm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to be ready
3. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon/public key

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: AssemblyAI for AI transcription (works for videos without captions)
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql`
3. Click **Run** to execute the SQL

This will create:
- `transcripts` table for storing user transcripts
- Row Level Security policies
- Indexes for performance

## Step 5: Set Up AssemblyAI (Optional but Recommended)

AssemblyAI provides AI-powered transcription that works for any video with audio, even if captions aren't available.

1. Go to [assemblyai.com](https://www.assemblyai.com) and sign up for a free account
2. Get your API key from the dashboard
3. Add it to your `.env.local` file as `ASSEMBLYAI_API_KEY`
4. Free tier includes 5 hours of transcription per month

**Note:** AssemblyAI works best with uploaded audio/video files. For YouTube videos without accessible captions, you can download the video and upload it as a file.

## Step 6: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (magic link)
3. **IMPORTANT**: Configure SMTP settings for email to work:
   - Go to **Authentication** → **Email Templates** → **SMTP Settings**
   - Configure your SMTP provider (Gmail, SendGrid, Mailgun, etc.)
   - See `SUPABASE_EMAIL_SETUP.md` for detailed instructions
4. **Enable Google OAuth** (Recommended - easier than email setup):
   - See detailed instructions in `GOOGLE_OAUTH_SETUP.md`
   - Quick steps:
     1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
     2. Add redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     3. Enable Google provider in Supabase and add credentials
   - This allows users to sign in with Google (no email configuration needed)

**Note**: Without SMTP configuration, magic link emails won't be sent. Use Google OAuth as an alternative, or configure SMTP following the guide in `SUPABASE_EMAIL_SETUP.md`.

## Step 7: Create Uploads Directory

The app needs a directory for file uploads:

```bash
mkdir -p public/uploads
```

## Step 8: Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Implemented

✅ **Authentication**
- Magic link email authentication
- Google OAuth sign-in
- Protected routes

✅ **Transcript Management**
- Create transcripts from YouTube URLs
- Save transcripts to database
- View transcript history
- Delete transcripts
- Download transcripts (TXT, JSON formats)

✅ **File Upload**
- Drag & drop file upload
- File type validation
- Upload progress

✅ **UI Components**
- Modern, responsive design
- Dark mode support
- Toast notifications
- Loading states

## API Endpoints

- `POST /api/transcribe` - Transcribe YouTube video
- `GET /api/transcripts?userId=...` - Get user transcripts
- `POST /api/transcripts` - Create new transcript
- `GET /api/transcripts/[id]` - Get specific transcript
- `DELETE /api/transcripts/[id]` - Delete transcript
- `GET /api/download?id=...&format=...` - Download transcript
- `POST /api/upload` - Upload audio/video file

## Next Steps (Optional Enhancements)

1. **Audio Transcription**: Integrate with services like:
   - OpenAI Whisper API
   - AssemblyAI
   - Deepgram

2. **Export Formats**: Add support for:
   - SRT subtitle files
   - VTT files
   - DOCX documents
   - PDF files

3. **Real-time Processing**: Add WebSocket support for live transcription status

4. **User Settings**: Persist user preferences in database

5. **Pricing/Subscriptions**: Integrate Stripe for paid plans

## Troubleshooting

### "No captions found" error
- The video must have captions enabled on YouTube
- Some videos don't have captions available

### Authentication not working
- Check your Supabase environment variables
- Verify RLS policies are set up correctly
- Check browser console for errors

### File upload fails
- Ensure `public/uploads` directory exists
- Check file size limits (currently 100MB)
- Verify file type is audio/video

## Support

For issues or questions, check the codebase or create an issue in your repository.
