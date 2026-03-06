import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM || "خليل <onboarding@resend.dev>";

export async function sendInviteEmail({
  to,
  inviterName,
  inviteUrl,
}: {
  to: string;
  inviterName: string;
  inviteUrl: string;
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${inviterName} دعاك للانضمام إلى خليل`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1f1f1f;padding:32px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:bold;color:#ffffff;letter-spacing:1px;">خليل</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <p style="margin:0 0 12px;font-size:20px;font-weight:bold;color:#1f1f1f;">
                مرحباً!
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.8;">
                دعاك <strong style="color:#1f1f1f;">${inviterName}</strong> للانضمام إلى <strong style="color:#1f1f1f;">خليل</strong> — مساعدك الذكي الذي يفهم اللهجات العربية ويتحدث بطريقة طبيعية.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${inviteUrl}"
                   style="display:inline-block;background:#1f1f1f;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:100px;font-size:15px;font-weight:600;">
                  انضم الآن
                </a>
              </div>
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.7;text-align:center;">
                هذه الدعوة صالحة لمدة 7 أيام.<br/>
                إذا لم تطلب هذه الدعوة، يمكنك تجاهل هذا البريد.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
