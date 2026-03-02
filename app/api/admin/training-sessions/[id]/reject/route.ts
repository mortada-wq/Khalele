import { NextRequest, NextResponse } from "next/server";
import { updateTrainingSessionStatus } from "@/lib/aws/dynamodb";
import { requireAdminResponse } from "@/lib/admin-auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  try {
    const { id } = await params;
    const session = await updateTrainingSessionStatus(id, "rejected");
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    return NextResponse.json({ session });
  } catch (error) {
    console.error("Admin reject error:", error);
    return NextResponse.json(
      { error: "Failed to reject", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
