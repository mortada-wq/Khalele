import { NextRequest, NextResponse } from "next/server";
import {
  listNotebooksByUser,
  saveNotebook,
  type NotebookRecord,
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

    const notebooks = await listNotebooksByUser(userId, limit);
    return NextResponse.json({ notebooks });
  } catch (error) {
    console.error("Notebooks list error:", error);
    const msg = error instanceof Error ? error.message : "Unknown";
    if (msg.includes("ResourceNotFoundException") || msg.includes("Cannot do operations on a non-existent table")) {
      return NextResponse.json({ notebooks: [] });
    }
    return NextResponse.json(
      { error: "Failed to list notebooks", details: msg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const { id, title = "دفتر جديد", content = "" } = body;

    const notebookId = id ?? crypto.randomUUID();
    const now = new Date().toISOString();

    const notebook: NotebookRecord = {
      id: notebookId,
      userId,
      title,
      content: typeof content === "string" ? content : "",
      createdAt: now,
      updatedAt: now,
    };

    try {
      await saveNotebook(notebook);
    } catch (saveErr) {
      const saveMsg = saveErr instanceof Error ? saveErr.message : "Unknown";
      if (saveMsg === "NOTEBOOK_TOO_LARGE") {
        return NextResponse.json({ error: "Notebook exceeds 20MB limit" }, { status: 400 });
      }
      if (saveMsg.includes("ResourceNotFoundException") || saveMsg.includes("Cannot do operations on a non-existent table")) {
        return NextResponse.json({ notebook });
      }
      throw saveErr;
    }
    return NextResponse.json({ notebook });
  } catch (error) {
    console.error("Notebooks create error:", error);
    return NextResponse.json(
      { error: "Failed to create notebook", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
