import { NextRequest, NextResponse } from "next/server";
import { saveCorrection } from "@/lib/aws/dynamodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = "anonymous", originalResponse, correctedResponse, correctionType = "dialect_authenticity", region } = body;

    if (!originalResponse || !correctedResponse) {
      return NextResponse.json(
        { error: "originalResponse and correctedResponse required" },
        { status: 400 }
      );
    }

    const correction = {
      id: crypto.randomUUID(),
      userId,
      originalResponse,
      correctedResponse,
      correctionType,
      region,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };

    await saveCorrection(correction);
    return NextResponse.json({ success: true, id: correction.id });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Failed to save correction" },
      { status: 500 }
    );
  }
}
