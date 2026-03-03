import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAppSettings, updateAppSettings } from "@/lib/aws/dynamodb";

// GET - Get app settings
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getAppSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحميل الإعدادات" },
      { status: 500 }
    );
  }
}

// PUT - Update app settings
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { greetingMessage } = await req.json();

    if (!greetingMessage) {
      return NextResponse.json(
        { error: "رسالة الترحيب مطلوبة" },
        { status: 400 }
      );
    }

    await updateAppSettings({ greetingMessage });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "حدث خطأ في حفظ الإعدادات" },
      { status: 500 }
    );
  }
}
