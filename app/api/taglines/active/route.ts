import { NextResponse } from "next/server";
import { getCurrentTagline } from "@/lib/taglines";

/**
 * Returns the current tagline to display on the home page.
 * Rotation happens server-side every hour using last 5 taglines.
 */
export async function GET() {
  try {
    const tagline = await getCurrentTagline();
    return NextResponse.json({ tagline });
  } catch (error) {
    console.error("Active tagline fetch error:", error);
    return NextResponse.json({
      tagline: "خليلي — ذكاء اصطناعي عربي",
    });
  }
}
