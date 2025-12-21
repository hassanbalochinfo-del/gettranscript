import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const runtime = "nodejs";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    if (!process.env.ASSEMBLYAI_API_KEY) {
      return NextResponse.json(
        { error: "AssemblyAI API key not configured. Please add ASSEMBLYAI_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const audioUrl = formData.get("audioUrl") as string;
    const file = formData.get("file") as File;

    let audioSource: string;

    // If file is provided, save it and use the public URL
    if (file) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${timestamp}_${sanitizedName}`;
      const filepath = join(uploadsDir, filename);

      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Use the public URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      audioSource = `${baseUrl}/uploads/${filename}`;
    } else if (audioUrl) {
      audioSource = audioUrl;
    } else {
      return NextResponse.json(
        { error: "Either audioUrl or file is required" },
        { status: 400 }
      );
    }

    // Start transcription
    const transcript = await client.transcripts.transcribe({
      audio: audioSource,
      language_code: "en", // Can be made configurable
    });

    if (transcript.status === "error") {
      return NextResponse.json(
        { error: transcript.error || "Transcription failed" },
        { status: 500 }
      );
    }

    // Wait for transcription to complete if it's still processing
    let finalTranscript = transcript;
    while (finalTranscript.status === "processing" || finalTranscript.status === "queued") {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
      finalTranscript = await client.transcripts.get(finalTranscript.id);
    }

    if (finalTranscript.status === "error") {
      return NextResponse.json(
        { error: finalTranscript.error || "Transcription failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transcript: finalTranscript.text || "",
      words: finalTranscript.words || [],
      source: "assemblyai",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
