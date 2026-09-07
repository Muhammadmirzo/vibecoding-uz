import {
  sendEmailSchema,
  welcomeEmailSchema,
  dripUnlockEmailSchema,
  SendEmailInput,
  WelcomeEmailInput,
  DripUnlockEmailInput,
} from "@/lib/validations/email";

export interface SendEmailResult {
  success: boolean;
  id?: string;
  mock?: boolean;
  error?: string;
}

/**
 * Sends an email using Resend API or mock fallback.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const validated = sendEmailSchema.parse(input);

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = validated.from || process.env.RESEND_FROM_EMAIL || "Mirzo Academy <no-reply@academy.mirzo.uz>";
  const toList = Array.isArray(validated.to) ? validated.to : [validated.to];

  if (!apiKey) {
    console.warn(
      `[Email Mock] To: ${toList.join(", ")} | From: ${fromEmail} | Subject: "${validated.subject}"`
    );
    return {
      success: true,
      id: `mock-email-${Date.now()}`,
      mock: true,
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toList,
        subject: validated.subject,
        html: validated.html,
        text: validated.text,
        reply_to: validated.replyTo,
      }),
    });

    const data = (await res.json()) as { id?: string; message?: string; name?: string };

    if (res.ok && data?.id) {
      return {
        success: true,
        id: data.id,
      };
    }

    return {
      success: false,
      error: data?.message || `Resend API returned error code ${res.status}`,
    };
  } catch (err) {
    console.error("Failed to send email via Resend:", err);
    return {
      success: false,
      error: String(err),
    };
  }
}

/**
 * Sends welcome email to newly registered students or leads.
 */
export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<SendEmailResult> {
  const validated = welcomeEmailSchema.parse(input);
  const courseName = validated.courseTitle || "Vibe Coding Express";

  const html = `
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F9F8F6; color: #111111; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; padding: 32px; border: 1px solid #E5E2DC; }
        .header { text-align: center; margin-bottom: 24px; }
        .brand { font-size: 24px; font-weight: 800; color: #FF5722; text-decoration: none; }
        .title { font-size: 20px; font-weight: 700; margin-top: 16px; margin-bottom: 12px; }
        .btn { display: inline-block; background-color: #FF5722; color: #FFFFFF !important; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; margin-top: 16px; }
        .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #777777; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <a href="https://academy.mirzo.uz" class="brand">Mirzo Academy</a>
        </div>
        <div class="title">Xush kelibsiz, ${validated.fullName}! 🎉</div>
        <p>Siz <strong>${courseName}</strong> platformasida muvaffaqiyatli ro'yxatdan o'tdingiz.</p>
        <p>AI yordamida dasturlashsiz real mahsulotlar qurish va amaliy ko'nikmalarni egallash safaringiz boshlandi!</p>
        <div style="text-align: center;">
          <a href="https://academy.mirzo.uz/kabinet" class="btn">Shaxsiy kabinetga o'tish</a>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Mirzo Academy. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: validated.to,
    subject: `Mirzo Academy'ga xush kelibsiz, ${validated.fullName}!`,
    html,
  });
}

/**
 * Sends notification email when a new lesson is unlocked via Drip.
 */
export async function sendDripUnlockEmail(input: DripUnlockEmailInput): Promise<SendEmailResult> {
  const validated = dripUnlockEmailSchema.parse(input);

  const html = `
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F9F8F6; color: #111111; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; padding: 32px; border: 1px solid #E5E2DC; }
        .brand { font-size: 22px; font-weight: 800; color: #FF5722; text-decoration: none; }
        .title { font-size: 18px; font-weight: 700; margin-top: 16px; margin-bottom: 12px; color: #111111; }
        .lesson-box { background: #F4F1EA; border-left: 4px solid #FF5722; padding: 16px; margin: 16px 0; border-radius: 4px; }
        .btn { display: inline-block; background-color: #FF5722; color: #FFFFFF !important; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="card">
        <a href="https://academy.mirzo.uz" class="brand">Mirzo Academy</a>
        <div class="title">Yangi darsingiz ochildi! 🚀</div>
        <p>Salom, ${validated.fullName}. Kursingizdagi navbatdagi dars tayyor:</p>
        <div class="lesson-box">
          <strong style="font-size: 16px;">📚 ${validated.lessonTitle}</strong>
        </div>
        <p>Darsni tomosha qilish va amaliy topshiriqlarni bajarish uchun quyidagi tugmani bosing:</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${validated.lessonUrl}" class="btn">Darsni tomosha qilish</a>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: validated.to,
    subject: `🚀 Yangi dars ochildi: ${validated.lessonTitle}`,
    html,
  });
}
