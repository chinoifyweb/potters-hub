/**
 * In-memory ring buffer for outreach send logs.
 *
 * Capped at 200 entries. Uses a global singleton so entries survive Next.js
 * hot-reload in development. Not durable across process restarts — this is
 * only for quick inspection/debugging of recent outreach activity.
 */

export interface OutreachLogEntry {
  /** ISO timestamp of when the entry was pushed */
  time: string;
  channel: "whatsapp" | "sms";
  status: "success" | "failed" | "queued";
  /** recipient phone number */
  to: string;
  name?: string;
  /** template key, e.g. "welcome", "event_reminder" */
  type?: string;
  error?: string;
}

const MAX_ENTRIES = 200;

const globalForLog = globalThis as unknown as {
  __outreachLog?: OutreachLogEntry[];
};
const buffer: OutreachLogEntry[] =
  globalForLog.__outreachLog ?? (globalForLog.__outreachLog = []);

/**
 * Append a new entry to the log. Automatically stamps `time` with the current
 * ISO timestamp. Oldest entries are evicted when the buffer exceeds 200.
 * Returns the stored entry (including the `time` field).
 */
export function pushLog(
  entry: Omit<OutreachLogEntry, "time">
): OutreachLogEntry {
  const stored: OutreachLogEntry = {
    time: new Date().toISOString(),
    ...entry,
  };
  buffer.push(stored);
  while (buffer.length > MAX_ENTRIES) {
    buffer.shift();
  }
  return stored;
}

/**
 * Return a snapshot copy of the log, newest first. Callers may safely mutate
 * the returned array — it does not affect the underlying buffer.
 */
export function getLog(): OutreachLogEntry[] {
  return buffer.slice().reverse();
}

/** Remove all entries from the log. */
export function clearLog(): void {
  buffer.length = 0;
}
