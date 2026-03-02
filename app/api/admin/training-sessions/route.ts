import { NextRequest, NextResponse } from "next/server";
import { listTrainingSessions } from "@/lib/aws/dynamodb";
import { requireAdminResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

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
