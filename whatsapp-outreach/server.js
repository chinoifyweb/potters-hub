// ============================================================
// THE POTTER'S HUB — WhatsApp + SMS Outreach Server
// ============================================================
// Run with: node server.js
// ============================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const axios = require("axios");

// ============================================================
// CONFIG
// ============================================================
const PORT = process.env.PORT || 3001;
const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL || "http://192.168.1.100:8080";
const SMS_GATEWAY_USER = process.env.SMS_GATEWAY_USER || "sms";
const SMS_GATEWAY_PASS = process.env.SMS_GATEWAY_PASS || "sms";
const CHURCH_NAME = "The Potter's Hub";

// ============================================================
// EXPRESS + SOCKET.IO SETUP
// ============================================================
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ============================================================
// STATE
// ============================================================
let whatsappStatus = {
  ready: false,
  qr: null, // base64 QR
  state: "INITIALIZING",
  info: null,
};

let smsStatus = {
  available: false,
  lastChecked: null,
  gatewayUrl: SMS_GATEWAY_URL,
};

const sendLog = []; // last 100 entries

function pushLog(entry) {
  const item = { ...entry, time: new Date().toISOString() };
  sendLog.unshift(item);
  if (sendLog.length > 100) sendLog.pop();
  io.emit("log", item);
}

// ============================================================
// MESSAGE TEMPLATES (Nigerian English)
// ============================================================
const templates = {
  welcome: (name) =>
    `Praise the Lord ${name}! 🙏\n\nWelcome to ${CHURCH_NAME} family! We are so excited that you have joined us. May the Lord richly bless you as we walk this journey of faith together.\n\nKindly note our service times:\n• Sunday Service: 8:00 AM\n• Tuesday Bible Study: 5:30 PM\n• Friday Prayer: 6:00 PM\n\nIf you need anything, please don't hesitate to reach out. God bless you!\n\n— ${CHURCH_NAME}`,

  absence: (name) =>
    `Hello ${name}, 🌟\n\nWe noticed you were not in church recently and we just want you to know that you were truly missed. The Potter's Hub family is not complete without you!\n\nWe are praying for you and your family. Whatever you may be going through, please know that God is with you and we are here for you too.\n\nWe look forward to seeing you this coming Sunday by God's grace. Stay blessed!\n\n— ${CHURCH_NAME}`,

  birthday: (name) =>
    `🎉 Happy Birthday ${name}! 🎂\n\nOn behalf of the entire ${CHURCH_NAME} family, we wish you a glorious new age filled with God's favor, peace, and abundance. May this new year of your life bring fresh anointing, divine breakthroughs, and unspeakable joy.\n\n"The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you." — Numbers 6:24-25\n\nEnjoy your special day! 🙏❤️\n\n— ${CHURCH_NAME}`,

  broadcast: (name) =>
    `Hello ${name},\n\nGreetings from ${CHURCH_NAME}! 🙏\n\nWe have an important announcement to share with our church family. Please stay tuned for further details and kindly share with other members.\n\nGod bless you abundantly!\n\n— ${CHURCH_NAME}`,

  custom: (name) => `Hello ${name},\n\n[Your custom message here]\n\n— ${CHURCH_NAME}`,
};

function renderTemplate(type, name, customMessage) {
  const safeName = name || "Beloved";
  // ALWAYS prefer a provided message — the calling Next.js app already rendered
  // the template, so this field IS the final admin-edited text. The internal
  // templates below are only a fallback when no message is supplied.
  if (customMessage && String(customMessage).trim()) {
    return String(customMessage).replace(/\{name\}/gi, safeName).replace(/\{\{\s*name\s*\}\}/gi, safeName);
  }
  const fn = templates[type] || templates.broadcast;
  return fn(safeName);
}

// ============================================================
// PHONE NORMALIZATION (Nigerian format)
// ============================================================
function normalizePhone(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.substring(2);
  if (digits.startsWith("0")) digits = "234" + digits.substring(1);
  if (digits.length === 10) digits = "234" + digits; // 10-digit no leading 0
  if (!digits.startsWith("234")) {
    if (digits.length >= 10 && digits.length <= 13) {
      // assume it's already international without +
    } else {
      return null;
    }
  }
  return digits;
}

function toWhatsAppId(raw) {
  const digits = normalizePhone(raw);
  if (!digits) return null;
  return `${digits}@c.us`;
}

function toSmsNumber(raw) {
  const digits = normalizePhone(raw);
  if (!digits) return null;
  return `+${digits}`;
}

// ============================================================
// WHATSAPP CLIENT (whatsapp-web.js)
// ============================================================
const waClient = new Client({
  authStrategy: new LocalAuth({ dataPath: "./.wa-session" }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  },
});

waClient.on("qr", async (qr) => {
  console.log("[WA] QR received — scan with your phone");
  try {
    const dataUrl = await qrcode.toDataURL(qr);
    whatsappStatus.qr = dataUrl;
    whatsappStatus.state = "QR_READY";
    whatsappStatus.ready = false;
    io.emit("status", whatsappStatus);
  } catch (err) {
    console.error("[WA] QR encode error:", err.message);
  }
});

waClient.on("authenticated", () => {
  console.log("[WA] Authenticated");
  whatsappStatus.state = "AUTHENTICATED";
  whatsappStatus.qr = null;
  io.emit("status", whatsappStatus);
});

waClient.on("ready", () => {
  console.log("[WA] Client is READY");
  whatsappStatus.ready = true;
  whatsappStatus.state = "READY";
  whatsappStatus.qr = null;
  whatsappStatus.info = waClient.info
    ? {
        pushname: waClient.info.pushname,
        wid: waClient.info.wid?._serialized,
      }
    : null;
  io.emit("status", whatsappStatus);
});

waClient.on("auth_failure", (msg) => {
  console.error("[WA] Auth failure:", msg);
  whatsappStatus.state = "AUTH_FAILURE";
  whatsappStatus.ready = false;
  io.emit("status", whatsappStatus);
});

waClient.on("disconnected", (reason) => {
  console.log("[WA] Disconnected:", reason);
  whatsappStatus.state = "DISCONNECTED";
  whatsappStatus.ready = false;
  whatsappStatus.qr = null;
  io.emit("status", whatsappStatus);
});

waClient.initialize().catch((err) => {
  console.error("[WA] Initialize error:", err.message);
});

// ============================================================
// SMS GATEWAY (Android SMS Gateway API)
// https://github.com/capcom6/android-sms-gateway
// ============================================================
async function checkSmsGateway() {
  try {
    const res = await axios.get(`${SMS_GATEWAY_URL}/health`, {
      timeout: 3000,
      auth: { username: SMS_GATEWAY_USER, password: SMS_GATEWAY_PASS },
    });
    smsStatus.available = res.status === 200;
  } catch {
    smsStatus.available = false;
  }
  smsStatus.lastChecked = new Date().toISOString();
  return smsStatus.available;
}

async function sendSmsViaGateway(phoneNumber, message) {
  const url = `${SMS_GATEWAY_URL}/message`;
  const payload = {
    message: message,
    phoneNumbers: [phoneNumber],
  };
  const res = await axios.post(url, payload, {
    timeout: 10000,
    auth: { username: SMS_GATEWAY_USER, password: SMS_GATEWAY_PASS },
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Initial check + periodic refresh
checkSmsGateway();
setInterval(checkSmsGateway, 30000);

// ============================================================
// HELPERS
// ============================================================
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => 2000 + Math.floor(Math.random() * 2000); // 2000-4000ms

// ============================================================
// ROUTES
// ============================================================

// Health / status
app.get("/api/status", async (req, res) => {
  res.json({
    whatsapp: whatsappStatus,
    sms: smsStatus,
    church: CHURCH_NAME,
    serverTime: new Date().toISOString(),
  });
});

// Preview a rendered template
app.post("/api/preview", (req, res) => {
  const { type, name, message } = req.body || {};
  const text = renderTemplate(type || "welcome", name || "Beloved", message);
  res.json({ text });
});

// Single WhatsApp message
app.post("/api/send", async (req, res) => {
  const { phone, name, type, message, files } = req.body || {};
  if (!phone) {
    return res.status(400).json({ error: "Phone is required" });
  }
  if (!whatsappStatus.ready) {
    return res
      .status(503)
      .json({ error: "WhatsApp not ready. Please scan the QR code." });
  }
  const waId = toWhatsAppId(phone);
  if (!waId) {
    return res.status(400).json({ error: "Invalid phone number" });
  }
  const text = renderTemplate(type || "custom", name, message);
  try {
    await waClient.sendMessage(waId, text);
    // Send attachments if any
    let filesSent = 0;
    let filesFailed = 0;
    if (Array.isArray(files) && files.length > 0) {
      for (const fp of files) {
        try {
          const media = MessageMedia.fromFilePath(fp);
          await waClient.sendMessage(waId, media);
          filesSent++;
        } catch (e) {
          filesFailed++;
          console.error("[WA] media send failed:", fp, e.message);
        }
      }
    }
    pushLog({
      channel: "whatsapp",
      status: "success",
      to: waId,
      name: name || "",
      type: type || "custom",
      files: Array.isArray(files) ? files.length : 0,
      filesSent,
      filesFailed,
    });
    res.json({ success: true, to: waId, filesSent, filesFailed });
  } catch (err) {
    pushLog({
      channel: "whatsapp",
      status: "failed",
      to: waId,
      name: name || "",
      error: err.message,
    });
    res.status(500).json({ error: err.message });
  }
});

// Single SMS message
app.post("/api/sms", async (req, res) => {
  const { phone, name, type, message } = req.body || {};
  if (!phone) {
    return res.status(400).json({ error: "Phone is required" });
  }
  const number = toSmsNumber(phone);
  if (!number) {
    return res.status(400).json({ error: "Invalid phone number" });
  }
  const text = renderTemplate(type || "custom", name, message);
  try {
    const result = await sendSmsViaGateway(number, text);
    pushLog({
      channel: "sms",
      status: "success",
      to: number,
      name: name || "",
      type: type || "custom",
    });
    res.json({ success: true, to: number, result });
  } catch (err) {
    pushLog({
      channel: "sms",
      status: "failed",
      to: number,
      name: name || "",
      error: err.message,
    });
    res.status(500).json({ error: err.message });
  }
});

// Bulk WhatsApp broadcast
app.post("/api/broadcast", async (req, res) => {
  const { recipients, type, message, files } = req.body || {};
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "recipients array required" });
  }
  if (!whatsappStatus.ready) {
    return res
      .status(503)
      .json({ error: "WhatsApp not ready. Please scan the QR code." });
  }

  // Respond immediately, process async
  res.json({
    success: true,
    queued: recipients.length,
    message: "Broadcast started — watch the live log",
  });

  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    const waId = toWhatsAppId(r.phone);
    if (!waId) {
      failed++;
      pushLog({
        channel: "whatsapp",
        status: "failed",
        to: r.phone,
        name: r.name || "",
        error: "Invalid phone",
      });
      continue;
    }
    const text = renderTemplate(type || "broadcast", r.name, message);
    try {
      await waClient.sendMessage(waId, text);
      // Send attachments per recipient
      if (Array.isArray(files) && files.length > 0) {
        for (const fp of files) {
          try {
            const media = MessageMedia.fromFilePath(fp);
            await waClient.sendMessage(waId, media);
          } catch (e) {
            console.error("[WA] media send failed:", fp, e.message);
          }
        }
      }
      sent++;
      pushLog({
        channel: "whatsapp",
        status: "success",
        to: waId,
        name: r.name || "",
        type: type || "broadcast",
        files: Array.isArray(files) ? files.length : 0,
      });
    } catch (err) {
      failed++;
      pushLog({
        channel: "whatsapp",
        status: "failed",
        to: waId,
        name: r.name || "",
        error: err.message,
      });
    }
    await sleep(randomDelay());
  }
  io.emit("broadcast-done", {
    channel: "whatsapp",
    sent,
    failed,
    total: recipients.length,
  });
});

// Bulk SMS broadcast
app.post("/api/sms-broadcast", async (req, res) => {
  const { recipients, type, message } = req.body || {};
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "recipients array required" });
  }

  res.json({
    success: true,
    queued: recipients.length,
    message: "SMS broadcast started — watch the live log",
  });

  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    const number = toSmsNumber(r.phone);
    if (!number) {
      failed++;
      pushLog({
        channel: "sms",
        status: "failed",
        to: r.phone,
        name: r.name || "",
        error: "Invalid phone",
      });
      continue;
    }
    const text = renderTemplate(type || "broadcast", r.name, message);
    try {
      await sendSmsViaGateway(number, text);
      sent++;
      pushLog({
        channel: "sms",
        status: "success",
        to: number,
        name: r.name || "",
        type: type || "broadcast",
      });
    } catch (err) {
      failed++;
      pushLog({
        channel: "sms",
        status: "failed",
        to: number,
        name: r.name || "",
        error: err.message,
      });
    }
    await sleep(randomDelay());
  }
  io.emit("broadcast-done", {
    channel: "sms",
    sent,
    failed,
    total: recipients.length,
  });
});

// Get recent log
app.get("/api/log", (req, res) => {
  res.json({ log: sendLog });
});

// ============================================================
// SOCKET.IO
// ============================================================
io.on("connection", (socket) => {
  console.log("[SOCKET] Client connected:", socket.id);
  socket.emit("status", whatsappStatus);
  socket.emit("log-init", sendLog);
  socket.on("disconnect", () => {
    console.log("[SOCKET] Client disconnected:", socket.id);
  });
});

// ============================================================
// START
// ============================================================
server.listen(PORT, () => {
  console.log("");
  console.log("============================================================");
  console.log(`  ${CHURCH_NAME} — Outreach Server`);
  console.log("============================================================");
  console.log(`  Server:       http://localhost:${PORT}`);
  console.log(`  WhatsApp:     ${whatsappStatus.state}`);
  console.log(`  SMS Gateway:  ${SMS_GATEWAY_URL}`);
  console.log("============================================================");
  console.log("");
});

// ============================================================
// LOGOUT / DISCONNECT
// ============================================================
app.post('/api/logout', async (req, res) => {
  try {
    whatsappStatus.ready = false;
    whatsappStatus.qr = null;
    whatsappStatus.state = 'LOGGING_OUT';
    whatsappStatus.info = null;
    io.emit('status', whatsappStatus);
    try { await waClient.logout(); } catch (e) { console.log('[WA] logout error:', e.message); }
    try { await waClient.destroy(); } catch (e) { console.log('[WA] destroy error:', e.message); }
    // Wipe session directory so next start requests fresh QR
    const fs = require('fs');
    const path = require('path');
    try { fs.rmSync(path.resolve('./.wa-session'), { recursive: true, force: true }); } catch (e) {}
    res.json({ ok: true, message: 'Logged out — rescan QR to link a different account' });
    // Re-init so a new QR is generated
    setTimeout(() => {
      whatsappStatus.state = 'INITIALIZING';
      waClient.initialize().catch((err) => console.error('[WA] Re-init error:', err.message));
    }, 1500);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
