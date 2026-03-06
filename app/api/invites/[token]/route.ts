import { NextResponse } from "next/server";
import { getInviteByToken } from "@/lib/aws/dynamodb";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const invite = await getInviteByToken(params.token);

  if (!invite) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  if (invite.status === "accepted") {
    return NextResponse.json({ valid: false, reason: "used" }, { status: 410 });
  }

  if (new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, reason: "expired" }, { status: 410 });
  }

  return NextResponse.json({
    valid: true,
    inviterName: invite.inviterName,
    inviteeEmail: invite.inviteeEmail,
  });
}
