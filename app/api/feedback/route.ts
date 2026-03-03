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

    // Like feedback
    if (feedbackType === "like") {
      const feedback = {
        id: crypto.randomUUID(),
        userId,
        messageId: messageId || "unknown",
        originalResponse: (originalResponse || "").slice(0, 500),
        correctedResponse: "",
        correctionType: "positive" as const,
        status: "pending" as const,
        createdAt: timestamp || new Date().toISOString(),
      };
      await saveCorrection(feedback);
      return NextResponse.json({ success: true, id: feedback.id });
    }

    // Dislike with "Needs Tweak" (gold-style correction for few-shot)
    if (feedbackType === "dislike" && reason === "needs_tweak" && correctedResponse?.trim()) {
      const correction = {
        id: crypto.randomUUID(),
        userId: userId || "anonymous",
        messageId: messageId || "unknown",
        originalResponse: (originalResponse || "").slice(0, 2000),
        correctedResponse: correctedResponse.trim().slice(0, 2000),
        correctionType: "needs_tweak" as const,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
        inputPrompt: (body.inputPrompt as string)?.trim()?.slice(0, 500),
        languageStyle: (body.languageStyle as "easy_arabic" | "formal_msa") || "easy_arabic",
        verdict: "needs_tweak" as const,
      };
      await saveCorrection(correction);
      return NextResponse.json({ success: true, id: correction.id });
    }

    // Simple dislike (no correction)
    if (feedbackType === "dislike") {
      const feedback = {
        id: crypto.randomUUID(),
        userId,
        messageId: messageId || "unknown",
        originalResponse: (originalResponse || "").slice(0, 500),
        correctedResponse: "",
        correctionType: (reason as string) || "negative",
        status: "pending" as const,
        createdAt: timestamp || new Date().toISOString(),
      };
      await saveCorrection(feedback);
      return NextResponse.json({ success: true, id: feedback.id });
    }

    // Full correction feedback (existing flow)
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
      inputPrompt: (body.inputPrompt as string)?.trim()?.slice(0, 500),
      languageStyle: (body.languageStyle as "easy_arabic" | "formal_msa") || undefined,
      verdict: (body.verdict as "perfect" | "needs_tweak" | "wrong_level") || undefined,
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
