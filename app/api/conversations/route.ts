import { NextRequest, NextResponse } from "next/server";
import {
  listConversationsByUser,
  saveConversation,
  type ConversationRecord,
} from "@/lib/aws/dynamodb";

export const dynamic = "force-dynamic";

const USER_ID_HEADER = "x-user-id";

function getUserId(req: NextRequest): string {
  return req.headers.get(USER_ID_HEADER) || "";
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "50", 10), 100);

    const conversations = await listConversationsByUser(userId, limit);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversations list error:", error);
    const msg = error instanceof Error ? error.message : "Unknown";
    if (msg.includes("ResourceNotFoundException") || msg.includes("Cannot do operations on a non-existent table")) {
      return NextResponse.json({ conversations: [] });
    }
    return NextResponse.json(
      { error: "Failed to list conversations", details: msg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const { conversationId, title = "محادثة جديدة", messages = [], characterId, factCheckMode } = body;

    const id = conversationId || crypto.randomUUID();
    const now = new Date().toISOString();

    const conversation: ConversationRecord = {
      conversationId: id,
      userId,
      title,
      messages: Array.isArray(messages) ? messages : [],
      ...(typeof characterId === "string" && characterId.length > 0 ? { characterId } : {}),
      ...(factCheckMode === "off" || factCheckMode === "notify" || factCheckMode === "notify_with_reason"
        ? { factCheckMode }
        : {}),
      updatedAt: now,
      createdAt: now,
    };

    try {
      await saveConversation(conversation);
    } catch (saveErr) {
      const saveMsg = saveErr instanceof Error ? saveErr.message : "Unknown";
      if (saveMsg.includes("ResourceNotFoundException") || saveMsg.includes("Cannot do operations on a non-existent table")) {
        return NextResponse.json({ conversation });
      }
      throw saveErr;
    }
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Conversations create error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
