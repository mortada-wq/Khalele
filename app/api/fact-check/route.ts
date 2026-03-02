import { NextRequest, NextResponse } from "next/server";
import { factCheck } from "@/lib/factcheck";
import { getFactCheckConfig } from "@/lib/factcheck-config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text?: string };
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const cfg = await getFactCheckConfig();
    const result = factCheck(text);
    return NextResponse.json({ config: cfg, result });
  } catch (error) {
    console.error("Fact-check error:", error);
    return NextResponse.json({ error: "Failed to fact check" }, { status: 500 });
  }
}

