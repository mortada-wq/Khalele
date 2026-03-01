import { NextRequest, NextResponse } from "next/server";
import { listTrainingSessions } from "@/lib/aws/dynamodb";

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
    const status = searchParams.get("status") as "pending" | "approved" | "rejected" | null;
    const sessions = await listTrainingSessions(status ?? undefined);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Admin training sessions list error:", error);
    return NextResponse.json(
      { error: "Failed to list sessions", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
