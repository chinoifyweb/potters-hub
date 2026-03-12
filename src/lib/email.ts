const RESEND_API_KEY = process.env.RESEND_API_KEY!
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@yourdomain.com"
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Church App"

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

interface ResendResponse {
  id: string
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
  replyTo,
}: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from || `${APP_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: replyTo,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Resend API error:", error)
      return { success: false, error: error.message || "Failed to send email" }
    }

    const data: ResendResponse = await response.json()
    return { success: true, id: data.id }
  } catch (error) {
    console.error("Email send error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// ---- Email template helpers ----

export function welcomeEmail(name: string) {
  return {
    subject: `Welcome to ${APP_NAME}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Welcome to ${APP_NAME}, ${name}!</h1>
        <p>We're excited to have you join our community. Here are some things you can do:</p>
        <ul>
          <li>Watch and listen to sermons</li>
          <li>Join groups and connect with others</li>
          <li>Stay updated with church events</li>
          <li>Read daily devotionals</li>
          <li>Give and support the church</li>
        </ul>
        <p>If you have any questions, feel free to reach out to us.</p>
        <p>Blessings,<br/>The ${APP_NAME} Team</p>
      </div>
    `,
  }
}

export function passwordResetEmail(name: string, resetUrl: string) {
  return {
    subject: `Reset your ${APP_NAME} password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <p>Blessings,<br/>The ${APP_NAME} Team</p>
      </div>
    `,
  }
}

export function verifyEmailTemplate(name: string, verifyUrl: string) {
  return {
    subject: `Verify your ${APP_NAME} email`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Verify Your Email</h1>
        <p>Hi ${name},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p>This link will expire in 24 hours.</p>
        <p>Blessings,<br/>The ${APP_NAME} Team</p>
      </div>
    `,
  }
}

export function donationReceiptEmail(
  name: string,
  amount: string,
  category: string,
  reference: string,
  date: string
) {
  return {
    subject: `Donation Receipt - ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Thank You for Your Donation!</h1>
        <p>Hi ${name},</p>
        <p>Your donation has been successfully processed. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Amount</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Category</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Reference</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${reference}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Date</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${date}</td>
          </tr>
        </table>
        <p>God bless you for your generosity.</p>
        <p>Blessings,<br/>The ${APP_NAME} Team</p>
      </div>
    `,
  }
}

export function eventReminderEmail(
  name: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string
) {
  return {
    subject: `Reminder: ${eventTitle} - ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Event Reminder</h1>
        <p>Hi ${name},</p>
        <p>This is a reminder about an upcoming event you RSVP'd to:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${eventTitle}</h2>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
        </div>
        <p>We look forward to seeing you there!</p>
        <p>Blessings,<br/>The ${APP_NAME} Team</p>
      </div>
    `,
  }
}
