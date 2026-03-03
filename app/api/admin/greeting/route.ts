import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGreetingMessage, updateGreetingMessage } from "@/lib/aws/messages";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = await getGreetingMessage();
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error fetching greeting:", error);
    return NextResponse.json({ error: "Failed to fetch greeting" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = await req.json();
    
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    await updateGreetingMessage(content, session.user.email || "admin");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating greeting:", error);
    return NextResponse.json({ error: "Failed to update greeting" }, { status: 500 });
  }
}
