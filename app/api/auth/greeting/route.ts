import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAppSettings, getAuthUserByEmail, updateAuthUser } from "@/lib/aws/dynamodb";

// GET - Check if user needs greeting and return it
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getAuthUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has already received greeting
    if (user.hasReceivedGreeting) {
      return NextResponse.json({ needsGreeting: false });
    }

    // Get the greeting message
    const settings = await getAppSettings();
    
    return NextResponse.json({ 
      needsGreeting: true,
      greetingMessage: settings.greetingMessage 
    });
  } catch (error) {
    console.error("Error checking greeting:", error);
    return NextResponse.json(
      { error: "حدث خطأ" },
      { status: 500 }
    );
  }
}

// POST - Mark greeting as received
export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await updateAuthUser(session.user.email, { hasReceivedGreeting: true });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking greeting as received:", error);
    return NextResponse.json(
      { error: "حدث خطأ" },
      { status: 500 }
    );
  }
}
