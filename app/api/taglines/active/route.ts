import { NextResponse } from "next/server";
import { getCurrentTagline, getTaglineConfig } from "@/lib/taglines";

/**
 * Returns the current tagline to display on the home page.
 * When rotation is enabled, includes interval so client can poll.
 */
export async function GET() {
  try {
    const config = getTaglineConfig();
    const tagline = getCurrentTagline();
    return NextResponse.json({
      tagline,
      rotationEnabled: config.rotationEnabled,
      rotationIntervalMinutes: config.rotationIntervalMinutes,
    });
  } catch (error) {
    console.error("Active tagline fetch error:", error);
    return NextResponse.json({
      tagline: "خليلي — ذكاء اصطناعي عربي",
      rotationEnabled: false,
      rotationIntervalMinutes: 5,
    });
  }
}
