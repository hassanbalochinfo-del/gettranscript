import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const transcribe = formData.get("transcribe") === "true"; // Option to transcribe immediately

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["audio/", "video/", "application/octet-stream"];
    const isValidType = allowedTypes.some((type) => file.type.startsWith(type));

    if (!isValidType) {
      return NextResponse.json({ error: "Invalid file type. Please upload audio or video files." }, { status: 400 });
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 100MB limit" }, { status: 400 });
    }

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

    const fileUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/uploads/${filename}`;

    // If transcribe is requested and AssemblyAI is configured, start transcription
    let transcript = null;
    if (transcribe && process.env.ASSEMBLYAI_API_KEY) {
      try {
        const { AssemblyAI } = await import("assemblyai");
        const client = new AssemblyAI({
          apiKey: process.env.ASSEMBLYAI_API_KEY,
        });

        const transcriptResponse = await client.transcripts.transcribe({
          audio: fileUrl,
        });

        // Return immediately with transcript ID for polling, or wait for completion
        transcript = {
          id: transcriptResponse.id,
          status: transcriptResponse.status,
          text: transcriptResponse.text || null,
        };
      } catch (transcribeError: any) {
        // ignore
        // Don't fail the upload if transcription fails
      }
    }

    // Return file info
    return NextResponse.json({
      success: true,
      file: {
        filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/${filename}`,
        fullUrl: fileUrl,
      },
      transcript, // Include transcript info if available
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
