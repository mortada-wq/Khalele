import { NextRequest, NextResponse } from "next/server";
import { getObjectAsBuffer } from "@/lib/aws/s3";

function requireAdmin(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  const header = req.headers.get("x-admin-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  return header === secret;
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const uri = searchParams.get("uri");
    if (!uri || !uri.startsWith("s3://")) {
      return NextResponse.json({ error: "Invalid S3 URI" }, { status: 400 });
    }
    const match = uri.replace("s3://", "").split("/");
    const bucket = match[0];
    const key = match.slice(1).join("/");
    if (!bucket || !key) {
      return NextResponse.json({ error: "Invalid S3 URI" }, { status: 400 });
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
