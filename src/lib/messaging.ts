import prisma from "@/lib/db";

function normalizeNg(phone: string): string {
  let p = String(phone).replace(/[^0-9]/g, "");
  if (p.startsWith("00")) p = p.slice(2);
  if (p.startsWith("0")) p = "234" + p.slice(1);
  if (!p.startsWith("234") && p.length === 10) p = "234" + p;
  return p;
}

const WA_URL = process.env.WA_SERVICE_URL || "http://127.0.0.1:3402/api";

export async function waStatus() {
  try {
    const r = await fetch(`${WA_URL}/status`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("json")) {
      return { ready: false, state: "OFFLINE", error: "WA service returned non-JSON" };
    }
    const data: any = await r.json();
    // Server returns { whatsapp: { ready, qr, state, info }, sms, church, serverTime }
    // Normalize to flat { ready, qr, state, info } for the client.
    if (data && data.whatsapp) {
      return {
        ready: !!data.whatsapp.ready,
        qr: data.whatsapp.qr || null,
        state: data.whatsapp.state || "UNKNOWN",
        info: data.whatsapp.info || null,
        provider: "whatsapp-web.js",
      };
    }
    // Fallback: already flat
    return data;
  } catch (e: any) {
    return { ready: false, state: "OFFLINE", error: "WA service unreachable" };
  }
}

const TERMII_KEY = process.env.TERMII_API_KEY || "";
const TERMII_SENDER = process.env.TERMII_SENDER_ID || "PottersHub";

export async function smsStatus() {
  return {
    available: !!TERMII_KEY,
    provider: TERMII_KEY ? "Termii" : "Not configured",
    sender: TERMII_SENDER,
    note: TERMII_KEY
      ? `Sender ID: ${TERMII_SENDER}`
      : "Set TERMII_API_KEY in .env to enable SMS sending.",
  };
}

export async function sendWhatsApp(phone: string, message: string, meta: any = {}, files?: string[]) {
  const normalized = normalizeNg(phone);
  let status: string = "sent";
  let error: string | null = null;
  let fallbackLink: string | null = null;

  try {
    const r = await fetch(`${WA_URL}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: normalized,
        name: meta.name,
        type: meta.type,
        message,
        files,
      }),
      signal: AbortSignal.timeout(120000),
    });
    const data: any = await r.json().catch(() => ({}));
    if (!r.ok || data.error) {
      status = "failed";
      error = data.error || `WA service HTTP ${r.status}`;
      fallbackLink = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
    }
  } catch (e: any) {
    status = "failed";
    error = "WA service unreachable — not running or not ready";
    fallbackLink = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  }

  try {
    await prisma.messageLog.create({
      data: {
        channel: "whatsapp",
        recipient: normalized,
        recipientName: meta.name || null,
        templateType: meta.type || null,
        body: message,
        status,
        error,
        sentById: meta.sentById || null,
        visitorId: meta.visitorId || null,
        userId: meta.userId || null,
      },
    });
  } catch {}

  return status === "sent"
    ? { ok: true, status: "sent", phone: normalized }
    : { ok: false, error, link: fallbackLink, phone: normalized };
}

export async function sendSMS(phone: string, message: string, meta: any = {}) {
  const normalized = normalizeNg(phone);
  if (!TERMII_KEY) {
    try {
      await prisma.messageLog.create({
        data: {
          channel: "sms",
          recipient: normalized,
          recipientName: meta.name || null,
          templateType: meta.type || null,
          body: message,
          status: "failed",
          error: "SMS not configured (TERMII_API_KEY missing)",
          sentById: meta.sentById || null,
          visitorId: meta.visitorId || null,
          userId: meta.userId || null,
        },
      });
    } catch {}
    return { ok: false, error: "SMS not configured" };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const r = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: normalized,
        from: TERMII_SENDER,
        sms: message,
        type: "plain",
        channel: "generic",
        api_key: TERMII_KEY,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data: any = await r.json().catch(() => ({}));
    const ok = r.ok && (data?.code === "ok" || !!data?.message_id);
    const status = ok ? "sent" : "failed";
    const error = ok ? null : (data?.message || `SMS failed (HTTP ${r.status})`);
    try {
      await prisma.messageLog.create({
        data: {
          channel: "sms",
          recipient: normalized,
          recipientName: meta.name || null,
          templateType: meta.type || null,
          body: message,
          status,
          error,
          sentById: meta.sentById || null,
          visitorId: meta.visitorId || null,
          userId: meta.userId || null,
        },
      });
    } catch {}
    return ok
      ? { ok: true, status: "sent", messageId: data?.message_id }
      : { ok: false, error: error || "SMS failed" };
  } catch (e: any) {
    const error = e?.name === "AbortError" ? "SMS timeout" : String(e?.message || e);
    try {
      await prisma.messageLog.create({
        data: {
          channel: "sms",
          recipient: normalized,
          recipientName: meta.name || null,
          templateType: meta.type || null,
          body: message,
          status: "failed",
          error,
          sentById: meta.sentById || null,
          visitorId: meta.visitorId || null,
          userId: meta.userId || null,
        },
      });
    } catch {}
    return { ok: false, error };
  }
}

export function renderTemplate(template: string, vars: Record<string, string> = {}): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, "g"), v);
  }
  // Also support {name} single-brace style
  out = out.replace(/\{name\}/gi, vars.name || "Beloved");
  return out;
}

const CHURCH = "The Potter's House Church";
const PASTOR_SIGN = `— Pastor Arthur Ifeanyi & the ${CHURCH} family`;
const SIGN = `— ${CHURCH} family`;

export const DEFAULT_TEMPLATES: Record<string, string> = {
  welcome: `Praise the Lord {{name}}! 🙏\n\nOn behalf of the entire ${CHURCH} family, I warmly welcome you into the House of God. We are truly grateful the Lord brought you our way.\n\nYou are family here. 💛\n\nService times:\n⛪ Sunday: 8:00 AM\n📖 Tuesday Bible Study: 5:30 PM\n🔥 Friday Prayer: 6:00 PM\n\nIf you need anything — prayer, counsel, or just someone to talk to — please reach out.\n\nWelcome home!\n\n${PASTOR_SIGN}`,
  absence: `Hello {{name}}, 💛\n\nWe noticed you haven't been in service lately, and I just want you to know you have been sorely missed. The ${CHURCH} family is not complete without you.\n\nI am lifting you and your family in prayer today. Whatever the situation — please know that God sees you, and we are here for you.\n\nWe trust to see you this Sunday. Stay blessed and highly favoured!\n\n${PASTOR_SIGN}`,
  birthday: `🎉 Happy Birthday {{name}}! 🎂\n\nOn behalf of the ${CHURCH} family, I wish you a glorious new age filled with God's favour, peace, and unstoppable breakthroughs!\n\n"The Lord bless you and keep you; the Lord make His face shine on you and be gracious to you." — Numbers 6:24-25\n\nFresh anointing. New levels. Supernatural favour. Long life and good health in Jesus' name!\n\nEnjoy your special day. We love you! 🙏❤️\n\n${PASTOR_SIGN}`,
  broadcast: `Hello {{name}}, 📢\n\nGreetings from ${CHURCH}! 🙏\n\n[YOUR ANNOUNCEMENT HERE]\n\nKindly share with other members so no one is left out.\n\nGod bless you!\n\n${SIGN}`,
  first_time_visitor: `Hello {{name}}, 🌟\n\nIt was such a joy having you with us on Sunday! Thank you for honouring us with your presence — it truly meant a lot.\n\nWe are praying for you and everything on your heart this week. We believe you will see God's hand move in wonderful ways.\n\nWe would love to see you again this Sunday by 8:00 AM. Feel free to come as you are.\n\nBe blessed!\n\n${PASTOR_SIGN}`,
  get_well: `Dear {{name}}, 🙏\n\nI heard you are not feeling well — please know you are not going through this alone. The ${CHURCH} family is praying fervently for your complete healing.\n\n"I will restore you to health and heal your wounds." — Jeremiah 30:17\n\nI speak total healing, restoration, and renewed strength over your body in Jesus' name.\n\nGet well soon, beloved. We love you. ❤️\n\n${PASTOR_SIGN}`,
  bereavement: `Dearly beloved {{name}}, 🕊️\n\nPlease accept my deepest condolences on behalf of the ${CHURCH} family.\n\n"Blessed are those who mourn, for they will be comforted." — Matthew 5:4\n\nMay the God of all comfort wrap you in His peace and strengthen your heart. You are not alone — if you need anything at all, please reach out.\n\nWith love and prayers,\n\n${PASTOR_SIGN}`,
  anniversary: `💍 Happy Wedding Anniversary {{name}}! 💒\n\nWhat a milestone! On behalf of the ${CHURCH} family, I celebrate you and your spouse today.\n\n"Therefore what God has joined together, let no one separate." — Mark 10:9\n\nMay your love grow sweeter and your home richer in peace. Many more fruitful years together in Jesus' name!\n\n${PASTOR_SIGN}`,
  new_baby: `👶 Congratulations {{name}}! 🎊\n\nWe join you in thanking God for the beautiful gift of a new baby. "Children are a heritage from the Lord." — Psalm 127:3\n\nMay this little one grow in wisdom, stature, and in favour with God and man. Long life, good health, and divine destiny in Jesus' name!\n\nAlready looking forward to the dedication!\n\n${PASTOR_SIGN}`,
  thanksgiving: `🙌 Hallelujah {{name}}! 🎉\n\nThank you for sharing that testimony! "Oh give thanks to the Lord, for He is good." — Psalm 107:1\n\nBigger testimonies are on the way. Keep shouting His praise!\n\nCelebrating with you,\n\n${PASTOR_SIGN}`,
  sunday_reminder: `Hello {{name}}, ⛪\n\nGentle reminder — we look forward to seeing you tomorrow (Sunday) by 8:00 AM. The Lord has a fresh word for you.\n\n"I was glad when they said unto me, let us go into the house of the Lord." — Psalm 122:1\n\nCome expecting. Bring someone along!\n\n${SIGN}`,
  new_year: `🎊 Happy New Year {{name}}! 🎉\n\nWelcome to a year of divine acceleration and open doors! "See, I am doing a new thing!" — Isaiah 43:19\n\nIt is your year. It is your season. Step into it boldly!\n\n${PASTOR_SIGN}`,
  christmas: `🎄 Merry Christmas {{name}}! ✨\n\nFrom the ${CHURCH} family to yours — a Christmas full of laughter, peace, and the presence of Jesus.\n\n"For unto us a child is born, unto us a son is given…" — Isaiah 9:6\n\nMerry Christmas! 🎁\n\n${PASTOR_SIGN}`,
  easter: `✝️ Happy Easter {{name}}! 🌅\n\nHE IS RISEN! Today we celebrate the greatest victory: Jesus conquered death so we could live forever.\n\n"Because I live, you also will live." — John 14:19\n\nHappy Easter, beloved!\n\n${PASTOR_SIGN}`,
  custom: `Hello {{name}},\n\n[Your custom message here]\n\n${SIGN}`,
};
