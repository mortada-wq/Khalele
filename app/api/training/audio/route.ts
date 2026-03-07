import { NextRequest, NextResponse } from "next/server";
import { getObjectAsBuffer } from "@/lib/aws/s3";
import { requireAdminResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const uri = searchParams.get("uri");
    if (!uri || !uri.startsWith("s3://")) {
      return NextResponse.json({ error: "Invalid S3 URI" }, { status: 400 });
    }
    const match = uri.replace("s3://", "").split("/");
    const bucket = match[0];
    const key = match.slice(1).join("/");
    const allowedBucket = process.env.S3_TRAINING_BUCKET || "kheleel-training-data";
    if (!bucket || !key || bucket !== allowedBucket || !key.startsWith("training-sessions/")) {
      return NextResponse.json({ error: "Invalid or disallowed S3 URI" }, { status: 400 });
    }
    const { body, contentType } = await getObjectAsBuffer(bucket, key);
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": contentType || "audio/webm",
        "Content-Length": body.length.toString(),
      },
    });
  } catch (error) {
    console.error("Training audio fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audio", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
