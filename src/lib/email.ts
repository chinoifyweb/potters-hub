/**
 * Email sending via Purelymail SMTP
 * Purelymail's HTTP API is mailbox-management only — outbound mail goes via SMTP.
 *
 * Required env vars:
 *   SMTP_HOST        default: smtp.purelymail.com
 *   SMTP_PORT        default: 465
 *   SMTP_USER        full mailbox address, e.g. noreply@tphc.org.ng
 *   SMTP_PASS        mailbox password (from Purelymail)
 *   FROM_EMAIL       default: SMTP_USER
 *   FROM_NAME        default: The Potter's Hub
 *
 * Also keeps PURELYMAIL_API_TOKEN for mailbox-management elsewhere.
 */

import nodemailer, { type Transporter } from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.purelymail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER || "noreply@tphc.org.ng";
const FROM_NAME = process.env.FROM_NAME || "The Potter's Hub";

let _transporter: Transporter | null = null;
function getTransporter(): Transporter | null {
  if (!SMTP_USER || !SMTP_PASS) return null;
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
  return _transporter;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Send an email via SMTP.
 * Returns both `success` and `ok` for backwards compat with callers.
 */
export async function sendEmail(
  params: SendEmailParams | { to: string; subject: string; html: string }
): Promise<{ success: boolean; ok: boolean; messageId?: string; error?: string }> {
  const p = params as SendEmailParams;
  const toList = Array.isArray(p.to) ? p.to : [p.to];
  const html = p.html || (p.text ? p.text.replace(/\n/g, "<br>") : "");
  const text = p.text || (p.html ? stripHtml(p.html) : "");

  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      "[Email] Skipped (no SMTP_USER/SMTP_PASS): \"" + p.subject + "\" -> " + toList.join(",")
    );
    return { success: false, ok: false, error: "SMTP not configured" };
  }

  try {
    const info = await transporter.sendMail({
      from: p.from
        ? p.from
        : FROM_NAME
        ? FROM_NAME + " <" + FROM_EMAIL + ">"
        : FROM_EMAIL,
      to: toList.join(", "),
      subject: p.subject,
      text,
      html,
      replyTo: p.replyTo,
    });
    console.log("[Email] Sent: \"" + p.subject + "\" -> " + toList.join(",") + " (" + info.messageId + ")");
    return { success: true, ok: true, messageId: info.messageId };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[Email] SMTP send error:", msg);
    return { success: false, ok: false, error: msg };
  }
}

// ============================================================================
// Pre-baked templates
// ============================================================================

const BRAND_FOOTER = `
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
  <p style="color:#6b7280;font-size:12px;line-height:1.5">
    The Potter's Hub Church<br/>
    <a href="https://tphc.org.ng" style="color:#2563eb">tphc.org.ng</a>
  </p>
`;

function wrap(title: string, body: string) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:20px;color:#111827">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
      <h2 style="color:#1e3a8a;margin-top:0">${title}</h2>
      ${body}
      ${BRAND_FOOTER}
    </div>
  </body></html>`;
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Welcome to The Potter's Hub!",
    html: wrap(
      "Welcome, " + name + "!",
      `<p>Praise the Lord! We're excited to have you join <strong>The Potter's Hub</strong> family.</p>
       <p>Your account is ready. You can now access sermons, the Bible, prayer requests, devotionals, and more.</p>
       <p style="margin-top:24px"><a href="https://tphc.org.ng/login" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Sign In</a></p>
       <p style="margin-top:24px">God bless you!<br/>&mdash; Pastor Arthur Ifeanyi</p>`
    ),
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: "Reset your Potter's Hub password",
    html: wrap(
      "Password Reset",
      `<p>We received a request to reset your password. Click the button below (valid for 1 hour):</p>
       <p style="margin:24px 0"><a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Reset Password</a></p>
       <p style="color:#6b7280;font-size:13px">Or copy this link: <br/><a href="${resetUrl}" style="color:#2563eb;word-break:break-all">${resetUrl}</a></p>
       <p>If you did not request this, please ignore this email &mdash; your password will not change.</p>`
    ),
  });
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  return sendEmail({
    to,
    subject: "Verify your Potter's Hub email",
    html: wrap(
      "Verify your email",
      `<p>Click the button below to verify your email and activate your account:</p>
       <p style="margin:24px 0"><a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Verify Email</a></p>
       <p style="color:#6b7280;font-size:13px">Or copy this link: <br/><a href="${verifyUrl}" style="color:#2563eb;word-break:break-all">${verifyUrl}</a></p>`
    ),
  });
}

export async function sendAdminNotification(
  to: string | string[],
  subject: string,
  message: string
) {
  return sendEmail({
    to,
    subject: "[TPHC Admin] " + subject,
    html: wrap(subject, "<p>" + message + "</p>"),
  });
}

export async function sendDonationReceipt(
  to: string,
  opts: { name: string; amount: string; reference: string; purpose?: string }
) {
  return sendEmail({
    to,
    subject: "Thank you for your donation - The Potter's Hub",
    html: wrap(
      "Donation Receipt",
      `<p>Dear ${opts.name},</p>
       <p>Thank you for your generous donation to The Potter's Hub. God bless you!</p>
       <table style="border-collapse:collapse;margin:16px 0">
         <tr><td style="padding:6px 12px;color:#6b7280">Amount:</td><td style="padding:6px 12px;font-weight:600">${opts.amount}</td></tr>
         ${opts.purpose ? `<tr><td style="padding:6px 12px;color:#6b7280">Purpose:</td><td style="padding:6px 12px">${opts.purpose}</td></tr>` : ""}
         <tr><td style="padding:6px 12px;color:#6b7280">Reference:</td><td style="padding:6px 12px;font-family:monospace">${opts.reference}</td></tr>
       </table>
       <p>&ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo; &mdash; 2 Corinthians 9:7</p>`
    ),
  });
}
