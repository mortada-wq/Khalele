import { NextResponse } from "next/server";
import { createAuthUser, getInviteByToken, markInviteAccepted } from "@/lib/aws/dynamodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name, inviteToken } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedEmail = email.toLowerCase().trim();

    try {
      await createAuthUser({
        email: normalizedEmail,
        name: name || email,
        passwordHash: hashedPassword,
        authProvider: "credentials",
        createdAt: new Date().toISOString(),
      });

      // Consume the invite token if provided and valid
      if (inviteToken) {
        try {
          const invite = await getInviteByToken(inviteToken);
          if (
            invite &&
            invite.status === "pending" &&
            new Date(invite.expiresAt) > new Date() &&
            invite.inviteeEmail === normalizedEmail
          ) {
            await markInviteAccepted(inviteToken);
          }
        } catch {
          // Silently ignore — don't block signup on invite errors
        }
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_EXISTS") {
        return NextResponse.json(
          { error: "هذا البريد الإلكتروني مسجل بالفعل" },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء الحساب" },
      { status: 500 }
    );
  }
}
