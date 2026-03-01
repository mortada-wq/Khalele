import { NextRequest, NextResponse } from "next/server";
import { saveCorrection } from "@/lib/aws/dynamodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      feedbackType,
      messageId,
      reason,
      originalResponse,
      correctedResponse,
      correctionType = "dialect_authenticity",
      region,
      userId = "anonymous",
      timestamp,
    } = body;

    // Simple like/dislike feedback
    if (feedbackType === "like" || feedbackType === "dislike") {
      const feedback = {
        id: crypto.randomUUID(),
        userId,
        messageId: messageId || "unknown",
        feedbackType,
        reason: reason || undefined,
        originalResponse: (originalResponse || "").slice(0, 500),
        status: "logged" as const,
        createdAt: timestamp || new Date().toISOString(),
      };

      await saveCorrection({
        ...feedback,
        correctedResponse: "",
        correctionType: feedbackType === "like" ? "positive" : reason || "negative",
        status: "pending",
      });

      return NextResponse.json({ success: true, id: feedback.id });
    }

    // Correction feedback (existing flow)
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
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}
