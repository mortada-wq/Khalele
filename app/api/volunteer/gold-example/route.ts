import { NextRequest, NextResponse } from "next/server";
import { saveCorrection } from "@/lib/aws/dynamodb";

const RATE_LIMIT_PER_HOUR = 20;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientId(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const entry = rateLimitMap.get(clientId);
  if (!entry) {
    rateLimitMap.set(clientId, { count: 1, resetAt: now + hour });
    return true;
  }
  if (now > entry.resetAt) {
    rateLimitMap.set(clientId, { count: 1, resetAt: now + hour });
    return true;
  }
  if (entry.count >= RATE_LIMIT_PER_HOUR) return false;
  entry.count++;
  return true;
}

/** Submit a gold example from the volunteer correction UI */
export async function POST(req: NextRequest) {
  try {
    const clientId = getClientId(req);
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: "تم تجاوز الحد المسموح. حاول لاحقاً." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      inputPrompt,
      originalResponse,
      correctedResponse,
      languageStyle = "easy_arabic",
      verdict,
    } = body;

    if (!inputPrompt?.trim() || !originalResponse?.trim()) {
      return NextResponse.json(
        { error: "inputPrompt and originalResponse are required" },
        { status: 400 }
      );
    }

    const langStyle: "easy_arabic" | "formal_msa" = languageStyle === "formal_msa" ? "formal_msa" : "easy_arabic";
    const correction = {
      id: crypto.randomUUID(),
      userId: "volunteer",
      originalResponse: originalResponse.slice(0, 2000),
      correctedResponse:
        verdict === "perfect"
          ? originalResponse.slice(0, 2000)
          : (correctedResponse || originalResponse).trim().slice(0, 2000),
      correctionType: (verdict as string) || "needs_tweak",
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      inputPrompt: inputPrompt.trim().slice(0, 500),
      languageStyle: langStyle,
      verdict: (verdict as "perfect" | "needs_tweak" | "wrong_level") || "needs_tweak",
    };

    await saveCorrection(correction);
    return NextResponse.json({ success: true, id: correction.id });
  } catch (error) {
    console.error("[Volunteer Gold Example]", error);
    return NextResponse.json(
      { error: "Failed to save correction" },
      { status: 500 }
    );
  }
}
