# GetTranscript - Free YouTube Transcript Tool

A simple, public tool to get transcripts from YouTube videos. No sign-up required!

## Features

- 🎥 **YouTube URL Support** - Works with regular videos and YouTube Shorts
- 📁 **File Upload** - Upload audio/video files for transcription
- 📋 **Copy & Download** - Easy transcript export (TXT, JSON)
- 🚫 **No Login Required** - Completely public and free
- 🛡️ **Rate Limiting** - 5 requests per session to prevent abuse
- 💰 **AdSense Ready** - Built-in Google AdSense integration

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
# Optional: Google AdSense
NEXT_PUBLIC_ADSENSE_ID=your-adsense-publisher-id

# Optional: AssemblyAI for videos without captions
ASSEMBLYAI_API_KEY=your-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How It Works

1. User pastes a YouTube URL or uploads a file
2. System extracts captions using multiple methods:
   - `youtube-transcript` package (primary)
   - Manual extraction from YouTube page (fallback)
   - AssemblyAI (optional, for videos without captions)
3. Transcript is displayed with copy/download options
4. Rate limiting prevents abuse (5 requests per session)

## Rate Limiting

- **5 requests per session** (stored in sessionStorage)
- Resets after 1 hour or page refresh
- Both client-side and server-side validation

## AdSense Integration

Ads are automatically placed:
- Top banner (below navbar)
- In-article (between transcript sections)
- Bottom banner (above footer)

Add your AdSense Publisher ID to `NEXT_PUBLIC_ADSENSE_ID` to enable.

## API Endpoints

- `POST /api/transcribe` - Transcribe YouTube video
- `POST /api/upload` - Upload and transcribe file
- `POST /api/transcribe/assemblyai` - AI transcription (optional)

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- YouTube Transcript extraction
- AssemblyAI (optional)

## License

MIT
