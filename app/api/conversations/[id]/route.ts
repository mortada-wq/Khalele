import { NextRequest, NextResponse } from "next/server";
import {
  getConversation,
  saveConversation,
  type ConversationRecord,
} from "@/lib/aws/dynamodb";

const USER_ID_HEADER = "x-user-id";
const DEFAULT_USER_ID = "anon_anonymous";

function getUserId(req: NextRequest): string {
  return req.headers.get(USER_ID_HEADER) || DEFAULT_USER_ID;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
    }

    const conversation = await getConversation(id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const userId = getUserId(req);
    if (conversation.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Conversation get error:", error);
    return NextResponse.json(
      { error: "Failed to get conversation", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
    }

    const userId = getUserId(req);
    const existing = await getConversation(id);

    if (!existing) {
      const body = await req.json();
      const { title = "محادثة جديدة", messages = [] } = body;
      const now = new Date().toISOString();
      const conversation: ConversationRecord = {
        conversationId: id,
        userId,
        title,
        messages: Array.isArray(messages) ? messages : [],
        updatedAt: now,
        createdAt: now,
      };
      await saveConversation(conversation);
      return NextResponse.json({ conversation });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, messages } = body;
    const now = new Date().toISOString();

    const updated: ConversationRecord = {
      ...existing,
      ...(title !== undefined && { title }),
      ...(messages !== undefined && { messages: Array.isArray(messages) ? messages : existing.messages }),
      updatedAt: now,
    };

    await saveConversation(updated);
    return NextResponse.json({ conversation: updated });
  } catch (error) {
    console.error("Conversation update error:", error);
    return NextResponse.json(
      { error: "Failed to update conversation", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
