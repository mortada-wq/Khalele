import { NextRequest, NextResponse } from "next/server";
import {
  listConversationsByUser,
  saveConversation,
  type ConversationRecord,
} from "@/lib/aws/dynamodb";

const USER_ID_HEADER = "x-user-id";
const DEFAULT_USER_ID = "anon_anonymous";

function getUserId(req: NextRequest): string {
  return req.headers.get(USER_ID_HEADER) || DEFAULT_USER_ID;
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "50", 10), 100);

    const conversations = await listConversationsByUser(userId, limit);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversations list error:", error);
    return NextResponse.json(
      { error: "Failed to list conversations", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const { conversationId, title = "محادثة جديدة", messages = [] } = body;

    const id = conversationId || crypto.randomUUID();
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
  } catch (error) {
    console.error("Conversations create error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
