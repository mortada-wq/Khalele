import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = "hello@khalele.com";
const ADMIN_EMAIL_BCC = "mortadagzar@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "الرسالة مطلوبة" },
        { status: 400 }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "خدمة البريد غير مهيأة" },
        { status: 500 }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    const subject = category
      ? `[خليلي] ${category}: ${message.slice(0, 50)}${message.length > 50 ? "…" : ""}`
      : `[خليلي] رسالة من المستخدم`;

    const html = `
      <div dir="rtl" style="font-family: sans-serif; padding: 20px;">
        <h2>رسالة جديدة لتحسين خليلي</h2>
        ${category ? `<p><strong>التصنيف:</strong> ${category}</p>` : ""}
        <p><strong>الرسالة:</strong></p>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 8px;">${message.replace(/\n/g, "<br>")}</p>
        <p style="color: #888; font-size: 12px;">تم الإرسال في ${new Date().toISOString()}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "Khalele <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      bcc: [ADMIN_EMAIL_BCC],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "فشل إرسال الرسالة" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Send feedback error:", err);
    return NextResponse.json(
      { error: "حدث خطأ أثناء الإرسال" },
      { status: 500 }
    );
  }
}
