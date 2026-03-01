import { NextRequest, NextResponse } from "next/server";
import { updateTrainingSessionStatus } from "@/lib/aws/dynamodb";

function requireAdmin(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  const header = req.headers.get("x-admin-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  return header === secret;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const session = await updateTrainingSessionStatus(id, "approved");
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    return NextResponse.json({ session });
  } catch (error) {
    console.error("Admin approve error:", error);
    return NextResponse.json(
      { error: "Failed to approve", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
