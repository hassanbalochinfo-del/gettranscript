import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";

export const runtime = "nodejs";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "",
});

/**
 * This endpoint attempts to transcribe YouTube videos using AssemblyAI
 * Note: AssemblyAI requires a direct audio URL, so we need to extract audio from YouTube first
 * For now, this is a placeholder - you'd need yt-dlp or similar to extract audio
 */
export async function POST(req: Request) {
  try {
    if (!process.env.ASSEMBLYAI_API_KEY) {
      return NextResponse.json(
        { error: "AssemblyAI API key not configured. Please add ASSEMBLYAI_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const youtubeUrl = (formData.get("youtubeUrl") as string || "").trim();

    if (!youtubeUrl) {
      return NextResponse.json({ error: "Missing youtubeUrl parameter" }, { status: 400 });
    }

    // Extract video ID
    const videoIdMatch = youtubeUrl.match(/(?:v=|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const videoId = videoIdMatch[1];

    // For now, return an error explaining that YouTube audio extraction is needed
    // In a full implementation, you would:
    // 1. Use yt-dlp or similar to download/extract audio from YouTube
    // 2. Upload the audio to a temporary storage (S3, etc.)
    // 3. Get the public URL
    // 4. Submit to AssemblyAI

    return NextResponse.json(
      {
        error: "YouTube audio extraction not yet implemented. Please upload the video file directly instead.",
        suggestion: "Download the video and upload it as a file to use AI transcription.",
        videoId,
      },
      { status: 501 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
