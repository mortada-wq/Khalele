import { NextRequest, NextResponse } from "next/server";
import {
  listStudiesByUser,
  saveStudy,
  type StudyRecord,
} from "@/lib/aws/dynamodb";

export const dynamic = "force-dynamic";

const USER_ID_HEADER = "x-user-id";
const DEFAULT_USER_ID = "anon_anonymous";

function getUserId(req: NextRequest): string {
  return req.headers.get(USER_ID_HEADER) || DEFAULT_USER_ID;
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "50", 10), 100);

    const studies = await listStudiesByUser(userId, limit);
    return NextResponse.json({ studies });
  } catch (error) {
    console.error("Studies list error:", error);
    const msg = error instanceof Error ? error.message : "Unknown";
    if (msg.includes("ResourceNotFoundException") || msg.includes("Cannot do operations on a non-existent table")) {
      return NextResponse.json({ studies: [] });
    }
    return NextResponse.json(
      { error: "Failed to list studies", details: msg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const { id, title = "قضية جديدة", content = "" } = body;

    const studyId = id ?? crypto.randomUUID();
    const now = new Date().toISOString();

    const study: StudyRecord = {
      id: studyId,
      userId,
      title: typeof title === "string" ? title : "قضية جديدة",
      content: typeof content === "string" ? content : "",
      createdAt: now,
      updatedAt: now,
    };

    try {
      await saveStudy(study);
    } catch (saveErr) {
      const saveMsg = saveErr instanceof Error ? saveErr.message : "Unknown";
      if (saveMsg.includes("ResourceNotFoundException") || saveMsg.includes("Cannot do operations on a non-existent table")) {
        return NextResponse.json({ study });
      }
      throw saveErr;
    }
    return NextResponse.json({ study });
  } catch (error) {
    console.error("Studies create error:", error);
    return NextResponse.json(
      { error: "Failed to create study", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
