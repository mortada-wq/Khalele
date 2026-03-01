import { NextRequest, NextResponse } from "next/server";
import {
  getTaglineConfig,
  setTaglineConfig,
  addTagline,
  updateTagline,
  deleteTagline,
  reorderTaglines,
} from "@/lib/taglines";

export async function GET() {
  try {
    const config = getTaglineConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Taglines fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "add") {
      const { text } = body;
      if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });
      const tagline = addTagline(text.trim());
      return NextResponse.json({ tagline });
    }

    if (action === "update") {
      const { id, ...updates } = body;
      if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
      const tagline = updateTagline(id, updates);
      if (!tagline) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ tagline });
    }

    if (action === "delete") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
      const ok = deleteTagline(id);
      if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    if (action === "reorder") {
      const { orderedIds } = body;
      if (!Array.isArray(orderedIds)) return NextResponse.json({ error: "orderedIds required" }, { status: 400 });
      reorderTaglines(orderedIds);
      return NextResponse.json({ success: true });
    }

    if (action === "config") {
      const { rotationEnabled, rotationIntervalMinutes, activeTaglineId } = body;
      setTaglineConfig({
        ...(typeof rotationEnabled === "boolean" && { rotationEnabled }),
        ...(typeof rotationIntervalMinutes === "number" && { rotationIntervalMinutes }),
        ...(activeTaglineId !== undefined && { activeTaglineId }),
      });
      return NextResponse.json({ success: true, config: getTaglineConfig() });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Taglines update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
