import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createInvite, getPendingInviteByInviteeEmail } from "@/lib/aws/dynamodb";
import { sendInviteEmail } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
  }

  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "بريد إلكتروني غير صحيح" }, { status: 400 });
  }

  const inviteeEmail = email.toLowerCase().trim();

  if (inviteeEmail === session.user.email.toLowerCase()) {
    return NextResponse.json({ error: "لا يمكنك دعوة نفسك" }, { status: 400 });
  }

  // Prevent duplicate pending invites to the same email
  const existing = await getPendingInviteByInviteeEmail(inviteeEmail);
  if (existing) {
    return NextResponse.json({ error: "تم إرسال دعوة لهذا البريد مسبقاً" }, { status: 400 });
  }

  const token = crypto.randomUUID();

  const invite = await createInvite({
    token,
    inviterEmail: session.user.email,
    inviterName: session.user.name || session.user.email,
    inviteeEmail,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/signin?invite=${invite.token}`;

  try {
    await sendInviteEmail({
      to: inviteeEmail,
      inviterName: invite.inviterName,
      inviteUrl,
    });
  } catch (emailErr) {
    console.error("Failed to send invite email:", emailErr);
    // Don't fail the request — invite is stored, email delivery is best-effort
  }

  return NextResponse.json({ success: true });
}
