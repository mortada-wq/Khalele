import { NextRequest, NextResponse } from "next/server";
import {
  getNotebook,
  saveNotebook,
  deleteNotebook,
  type NotebookRecord,
} from "@/lib/aws/dynamodb";

export const dynamic = "force-dynamic";

const USER_ID_HEADER = "x-user-id";
const DEFAULT_USER_ID = "anon_anonymous";

function getUserId(req: NextRequest): string {
  return req.headers.get(USER_ID_HEADER) || DEFAULT_USER_ID;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notebook = await getNotebook(id);
    if (!notebook) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 });
    }
    return NextResponse.json({ notebook });
  } catch (error) {
    console.error("Notebook get error:", error);
    return NextResponse.json(
      { error: "Failed to get notebook", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(req);
    const { id } = await params;
    const body = await req.json();
    const { title, content } = body;

    const existing = await getNotebook(id);
    if (!existing) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated: NotebookRecord = {
      ...existing,
      ...(typeof title === "string" && title.trim() !== "" ? { title: title.trim() } : {}),
      ...(typeof content === "string" ? { content } : {}),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveNotebook(updated);
    } catch (saveErr) {
      const saveMsg = saveErr instanceof Error ? saveErr.message : "Unknown";
      if (saveMsg === "NOTEBOOK_TOO_LARGE") {
        return NextResponse.json({ error: "Notebook exceeds 20MB limit" }, { status: 400 });
      }
      throw saveErr;
    }
    return NextResponse.json({ notebook: updated });
  } catch (error) {
    console.error("Notebook update error:", error);
    return NextResponse.json(
      { error: "Failed to update notebook", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(req);
    const { id } = await params;

    const existing = await getNotebook(id);
    if (!existing) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteNotebook(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Notebook delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete notebook", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
