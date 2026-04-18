import prisma from "@/lib/db";
import { sendWhatsApp } from "@/lib/messaging";

export interface ChildrenNotifyResult {
  recipientCount: number;
  sent: number;
  failed: number;
  errors: string[];
}

export function buildChildrensManualMessage(
  item: {
    title: string;
    teacher?: string | null;
    ageGroup?: string | null;
    date?: Date | string;
    scripture?: string | null;
    memoryVerse?: string | null;
    description?: string | null;
    weekNumber?: number | null;
    quarter?: string | null;
  },
  isUpdate: boolean,
): string {
  const dateStr = item.date
    ? new Date(item.date).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "TBA";
  const parts: (string | null)[] = [
    (isUpdate
      ? "🔄 CHILDREN'S MANUAL UPDATED"
      : "🙏 NEW CHILDREN'S MANUAL ENTRY") +
      " — The Potter's House Church",
    "",
    `📖 ${item.title}`,
    item.weekNumber
      ? `Week ${item.weekNumber}${item.quarter ? " · " + item.quarter : ""}`
      : null,
    item.ageGroup ? `👶 Age group: ${item.ageGroup}` : null,
    item.teacher ? `🧑‍🏫 Teacher: ${item.teacher}` : null,
    `📅 Date: ${dateStr}`,
    item.scripture ? `📜 Scripture: ${item.scripture}` : null,
    item.memoryVerse ? `💡 Memory Verse: ${item.memoryVerse}` : null,
    "",
    item.description
      ? item.description.length > 400
        ? item.description.slice(0, 400) + "…"
        : item.description
      : null,
    "",
    "Please prepare ahead. God bless you for your service! 💛",
    "— The Potter's House Church, Children's Church",
  ].filter(Boolean) as (string | null)[];
  return parts.join("\n");
}

/**
 * Fires WhatsApp notifications to every active worker whose department === "Children".
 * Runs sequentially so the WA service isn't hammered; returns a summary result.
 * Call this from API handlers wrapped in Promise.race with a timeout if you need
 * to bound the response time.
 */
export async function notifyChildrensWorkers(
  item: Parameters<typeof buildChildrensManualMessage>[0],
  isUpdate: boolean,
): Promise<ChildrenNotifyResult> {
  const workers = await prisma.worker.findMany({
    where: {
      isActive: true,
      department: { equals: "Children", mode: "insensitive" },
    },
    select: { id: true, fullName: true, phone: true },
  });
  const message = buildChildrensManualMessage(item, isUpdate);
  const result: ChildrenNotifyResult = {
    recipientCount: workers.length,
    sent: 0,
    failed: 0,
    errors: [],
  };
  for (const w of workers) {
    if (!w.phone) continue;
    try {
      const firstName = (w.fullName || "").split(" ")[0] || "Beloved";
      const personalized = `Hello ${firstName},\n\n${message}`;
      const r = await sendWhatsApp(w.phone, personalized, {
        name: w.fullName,
        type: "children_manual",
      });
      if (r.ok) result.sent++;
      else {
        result.failed++;
        if (r.error) result.errors.push(`${w.phone}: ${r.error}`);
      }
    } catch (e: any) {
      result.failed++;
      result.errors.push(`${w.phone}: ${e.message}`);
    }
  }
  return result;
}

/**
 * Count active workers in the Children department. Useful for admin UI previews
 * ("Will send to N workers...").
 */
export async function countChildrensWorkers(): Promise<number> {
  return prisma.worker.count({
    where: {
      isActive: true,
      department: { equals: "Children", mode: "insensitive" },
    },
  });
}
