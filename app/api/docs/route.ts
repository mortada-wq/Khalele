import { NextRequest, NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { getKhaleelDocsConfig, setKhaleelDocsTopics } from "@/lib/khaleel-docs";

export async function GET(req: NextRequest) {
  try {
    const includeAll = req.nextUrl.searchParams.get("all") === "1";
    if (includeAll) {
      const authError = await requireAdminResponse();
      if (authError) return authError;
    }

    const config = await getKhaleelDocsConfig(includeAll);
    return NextResponse.json(config);
  } catch (error) {
    console.error("Docs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch docs", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  try {
    const body = (await req.json()) as { topics?: unknown };
    if (!Array.isArray(body.topics)) {
      return NextResponse.json({ error: "topics array is required" }, { status: 400 });
    }

    const config = await setKhaleelDocsTopics(body.topics);
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Docs update error:", error);
    return NextResponse.json(
      { error: "Failed to update docs", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

