/**
 * Termii SMS provider for outreach messages.
 *
 * Termii is a popular Nigerian SMS gateway. Docs: https://developer.termii.com/
 *
 * Environment variables:
 *   TERMII_API_KEY   - Your Termii API key (required). Without it SMS is disabled.
 *   TERMII_SENDER_ID - Registered sender ID (default: "PottersHub").
 */

const TERMII_ENDPOINT = "https://api.ng.termii.com/api/sms/send";
const DEFAULT_SENDER = "PottersHub";
const REQUEST_TIMEOUT_MS = 15_000;

export interface SmsResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

export interface SmsStatus {
  /** true if TERMII_API_KEY env var is set */
  available: boolean;
  /** "Termii" when configured, "Not configured" otherwise */
  provider: string;
  /** the sender ID that will be used */
  sender: string;
  /** ISO timestamp of when the status was checked */
  lastChecked: string;
}

/**
 * Normalize an E.164 phone number into Termii's expected format (digits only,
 * no leading `+`). Termii expects numbers like `2348012345678`.
 */
function normalizePhone(phoneE164: string): string {
  const trimmed = (phoneE164 || "").trim();
  // Strip leading "+" if present, keep only digits.
  const noPlus = trimmed.startsWith("+") ? trimmed.slice(1) : trimmed;
  return noPlus.replace(/\D/g, "");
}

/**
 * Get the current SMS configuration status. Safe to call from anywhere — no
 * network activity; simply inspects env vars.
 */
export function getSmsStatus(): SmsStatus {
  const apiKey = process.env.TERMII_API_KEY;
  const sender = process.env.TERMII_SENDER_ID || DEFAULT_SENDER;
  const available = Boolean(apiKey && apiKey.length > 0);
  return {
    available,
    provider: available ? "Termii" : "Not configured",
    sender,
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Send an SMS via Termii. Never throws — errors are returned as
 * `{ ok: false, error }`.
 *
 * @param phoneE164 Recipient phone in E.164 format (e.g. "+2348012345678").
 *                  The leading "+" is stripped automatically.
 * @param message   The SMS body text.
 */
export async function sendSms(
  phoneE164: string,
  message: string
): Promise<SmsResult> {
  const apiKey = process.env.TERMII_API_KEY;
  const sender = process.env.TERMII_SENDER_ID || DEFAULT_SENDER;

  if (!apiKey) {
    return {
      ok: false,
      error: "SMS not configured. Set TERMII_API_KEY in env.",
    };
  }

  const to = normalizePhone(phoneE164);
  if (!to) {
    return { ok: false, error: "Invalid recipient phone number." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(TERMII_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        from: sender,
        sms: message,
        type: "plain",
        channel: "generic",
        api_key: apiKey,
      }),
      signal: controller.signal,
    });

    let data: {
      code?: string;
      message_id?: string;
      message?: string;
    } = {};
    try {
      data = (await res.json()) as typeof data;
    } catch {
      // Non-JSON response body — fall through to status-based handling.
    }

    const success =
      res.ok && (data.code === "ok" || Boolean(data.message_id));

    if (success) {
      return { ok: true, messageId: data.message_id };
    }

    return {
      ok: false,
      error: data.message || `SMS send failed (HTTP ${res.status})`,
    };
  } catch (err) {
    const isAbort =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.includes("aborted"));
    return {
      ok: false,
      error: isAbort
        ? "SMS send timed out after 15s."
        : err instanceof Error
        ? err.message
        : "Unknown error sending SMS.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
