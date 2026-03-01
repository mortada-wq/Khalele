import { NextResponse } from "next/server";
import { getInMemoryCorrections } from "@/lib/aws/dynamodb";

export async function GET() {
  try {
    const corrections = getInMemoryCorrections();
    return NextResponse.json({ corrections });
  } catch (error) {
    console.error("Corrections fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
