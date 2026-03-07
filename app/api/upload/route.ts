import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdminResponse } from "@/lib/admin-auth";

  const client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
  });

  const BUCKET = process.env.S3_TRAINING_BUCKET || "kheleel-training-data";

export async function POST(req: NextRequest) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const uploadType = (formData.get("uploadType") as string) || "training";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 50) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    const allowedTraining = ["application/jsonl", "application/json", "text/csv", "text/plain"];
    const allowedMedia = ["audio/", "video/"];
    const allowedHeritage = ["application/pdf", "image/tiff", "image/tif"];

    const contentType =
      uploadType === "training"
        ? (file.type || "application/jsonl")
        : uploadType === "media"
          ? file.type || "audio/mpeg"
          : file.type || "application/pdf";

    if (uploadType === "training" && !allowedTraining.some((t) => contentType.startsWith(t.split("/")[0]) || contentType === t)) {
      return NextResponse.json({ error: "Unsupported training file type" }, { status: 400 });
    }
    if (uploadType === "media" && !allowedMedia.some((p) => contentType.startsWith(p))) {
      return NextResponse.json({ error: "Unsupported media type" }, { status: 400 });
    }
    if (uploadType === "heritage" && !allowedHeritage.some((t) => contentType.includes(t.split("/")[1]))) {
      return NextResponse.json({ error: "Unsupported heritage type" }, { status: 400 });
    }

    const prefix = uploadType === "training" ? "training" : uploadType === "media" ? "media" : "heritage";
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${prefix}/${Date.now()}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    return NextResponse.json({
      success: true,
      key,
      url: `s3://${BUCKET}/${key}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "AWS may not be configured",
      },
      { status: 500 }
    );
  }
}
