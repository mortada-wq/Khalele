import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAuthUser, getAuthUserByEmail } from "@/lib/aws/dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

const docClient = DynamoDBDocumentClient.from(client);
const ADMINS_TABLE = process.env.DYNAMODB_ADMINS_TABLE || "kheleel-admins";

// GET - List all admins
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Try to get from admins table first
    const result = await docClient.send(
      new ScanCommand({
        TableName: ADMINS_TABLE,
      })
    );

    const admins = (result.Items || []).map((item) => ({
      email: item.email,
      name: item.name,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({ admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    // Return empty array if table doesn't exist
    return NextResponse.json({ admins: [] });
  }
}

// POST - Add new admin
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await getAuthUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل بالفعل" },
        { status: 400 }
      );
    }

    // Create auth user
    const hashedPassword = await bcrypt.hash(password, 10);
    await createAuthUser({
      email: email.toLowerCase().trim(),
      name,
      passwordHash: hashedPassword,
      authProvider: "credentials",
      createdAt: new Date().toISOString(),
    });

    // Add to admins table
    await docClient.send(
      new PutCommand({
        TableName: ADMINS_TABLE,
        Item: {
          email: email.toLowerCase().trim(),
          name,
          createdAt: new Date().toISOString(),
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إضافة المدير" },
      { status: 500 }
    );
  }
}
