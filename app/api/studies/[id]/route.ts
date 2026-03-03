import { NextRequest, NextResponse } from "next/server";
import {
  getStudy,
  saveStudy,
  type StudyRecord,
} from "@/lib/aws/dynamodb";

export const dynamic = "force-dynamic";

const USER_ID_HEADER = "x-user-id";
const DEFAULT_USER_ID = "anon_anonymous";

function getUserId(req: NextRequest): string {
  return req.headers.get(USER_ID_HEADER) || DEFAULT_USER_ID;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(req);
    const { id } = await params;
    const body = await req.json();
    const { title } = body;

    const existing = await getStudy(id);
    if (!existing) {
      return NextResponse.json({ error: "Study not found" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated: StudyRecord = {
      ...existing,
      ...(typeof title === "string" && title.trim() !== "" ? { title: title.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };

    await saveStudy(updated);
    return NextResponse.json({ study: updated });
  } catch (error) {
    console.error("Study update error:", error);
    return NextResponse.json(
      { error: "Failed to update study", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
