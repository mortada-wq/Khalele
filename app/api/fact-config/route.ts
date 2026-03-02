import { NextRequest, NextResponse } from "next/server";
import { getFactCheckConfig, setFactCheckConfig, type FactCheckMode } from "@/lib/factcheck-config";
import { requireAdminResponse } from "@/lib/admin-auth";

export async function GET() {
  try {
    const cfg = await getFactCheckConfig();
    return NextResponse.json(cfg);
  } catch (error) {
    console.error("Fact config get error:", error);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  try {
    const body = (await req.json()) as { defaultMode?: FactCheckMode; forceOn?: boolean };
    const cfg = await setFactCheckConfig({
      ...(body.defaultMode ? { defaultMode: body.defaultMode } : {}),
      ...(typeof body.forceOn === "boolean" ? { forceOn: body.forceOn } : {}),
    });
    return NextResponse.json(cfg);
  } catch (error) {
    console.error("Fact config update error:", error);
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}

