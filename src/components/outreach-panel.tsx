"use client";

// ============================================================
// THE POTTER'S HUB — WhatsApp + SMS Outreach Panel
// Drop into any React admin app. No required props.
// ============================================================

import React, { useState, useEffect, useRef, useMemo } from "react";

interface Member { id: number; name: string; phone: string; }
interface LogEntry { time: string; channel?: string; status: string; to?: string; name?: string; error?: string; type?: string; }
interface WaStatus { ready: boolean; state: string; mode?: string; }
interface SmsStat { available: boolean; provider?: string; sender?: string; lastChecked?: string; }
interface TemplateOption { value: string; label: string; group: string; icon: string; }
interface WaQueueItem { name: string; phone: string; link: string; text: string; }

const API_BASE = "/api/outreach";

const COLORS = {
  green: "#1a4731",
  greenLight: "#2d6347",
  greenDark: "#0f2e1f",
  gold: "#d4a843",
  goldLight: "#e5bd5f",
  goldDark: "#a8842f",
  bg: "#f5f1e8",
  card: "#ffffff",
  text: "#1a1a1a",
  textMuted: "#6b6b6b",
  border: "#e5e0d4",
  success: "#2d8f47",
  danger: "#c14040",
};

const STORAGE_KEY = "potters_hub_outreach_members";

export default function WhatsAppPanel() {
  const [waStatus, setWaStatus] = useState<WaStatus>({
    ready: true,
    state: "CLICK_TO_SEND",
    mode: "wa.me",
  });
  const [smsStatus, setSmsStatus] = useState<SmsStat>({
    available: false,
    provider: "Not configured",
    sender: "PottersHub",
  });
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [type, setType] = useState("welcome");
  const [customMessage, setCustomMessage] = useState("");
  const [previewName, setPreviewName] = useState("Beloved");
  const [previewText, setPreviewText] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [singlePhone, setSinglePhone] = useState("");
  const [singleName, setSingleName] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [waQueue, setWaQueue] = useState<WaQueueItem[]>([]);
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  // -------------- Load members from localStorage --------------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMembers(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch {}
  }, [members]);

  // -------------- Poll status every 4 seconds --------------
  useEffect(() => {
    let cancelled = false;
    async function fetchStatus() {
      try {
        const res = await fetch(`${API_BASE}/status`);
        const data = await res.json();
        if (cancelled) return;
        if (data.whatsapp) setWaStatus(data.whatsapp);
        if (data.sms) setSmsStatus(data.sms);
        if (Array.isArray(data.templates)) setTemplates(data.templates);
      } catch (err) {
        if (cancelled) return;
        setSmsStatus((s) => ({ ...s, available: false }));
      }
    }
    fetchStatus();
    const id = setInterval(fetchStatus, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // -------------- Update preview --------------
  useEffect(() => {
    let cancelled = false;
    async function fetchPreview() {
      try {
        const res = await fetch(`${API_BASE}/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            name: previewName,
            message: customMessage,
          }),
        });
        const data = await res.json();
        if (!cancelled) setPreviewText(data.text || "");
      } catch {}
    }
    fetchPreview();
    return () => {
      cancelled = true;
    };
  }, [type, previewName, customMessage]);

  // -------------- Poll log --------------
  useEffect(() => {
    let cancelled = false;
    async function fetchLog() {
      try {
        const res = await fetch(`${API_BASE}/log`);
        const data = await res.json();
        if (!cancelled) setLog(data.log || []);
      } catch {}
    }
    fetchLog();
    const id = setInterval(fetchLog, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // -------------- Group templates by group --------------
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, TemplateOption[]> = {};
    for (const t of templates) {
      const key = t.group || "General";
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    return groups;
  }, [templates]);

  // -------------- Member management --------------
  function addMember() {
    if (!newName.trim() || !newPhone.trim()) return;
    setMembers((m) => [
      ...m,
      { id: Date.now(), name: newName.trim(), phone: newPhone.trim() },
    ]);
    setNewName("");
    setNewPhone("");
  }

  function removeMember(id: number) {
    setMembers((m) => m.filter((x) => x.id !== id));
  }

  function clearMembers() {
    if (!confirm("Remove all members from the list?")) return;
    setMembers([]);
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String((ev.target as FileReader)?.result || "");
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const parsed: Member[] = [];
      const header = lines[0].toLowerCase();
      const hasHeader = header.includes("name") || header.includes("phone");
      const start = hasHeader ? 1 : 0;
      for (let i = start; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length >= 2 && cols[0] && cols[1]) {
          parsed.push({
            id: Date.now() + i,
            name: cols[0],
            phone: cols[1],
          });
        }
      }
      setMembers((m) => [...m, ...parsed]);
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsText(file);
  }

  // -------------- Send actions --------------
  async function sendSingle(channel: string) {
    if (!singlePhone.trim()) {
      alert("Please enter a phone number");
      return;
    }
    setBusy(true);
    try {
      const endpoint = channel === "sms" ? "sms" : "send";
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: singlePhone,
          name: singleName,
          type,
          message: customMessage,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (channel === "whatsapp" && data.link) {
        window.open(data.link, "_blank");
        alert("WhatsApp opened. Tap Send in WhatsApp to deliver.");
      } else {
        alert(`✓ Sent to ${singlePhone}`);
      }
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function broadcast(channel: string) {
    if (members.length === 0) {
      alert("Please add members to the list first");
      return;
    }
    if (
      !confirm(
        `Send ${channel === "sms" ? "SMS" : "WhatsApp"} to ${members.length} members?`
      )
    )
      return;
    setBusy(true);
    try {
      const endpoint = channel === "sms" ? "sms-broadcast" : "broadcast";
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: members.map((m) => ({ name: m.name, phone: m.phone })),
          type,
          message: customMessage,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (channel === "whatsapp") {
        const items: WaQueueItem[] = Array.isArray(data.items) ? data.items : [];
        setWaQueue(items);
        setOpened(new Set());
        alert(
          `Ready to send ${items.length} WhatsApp messages. Click each "Send" button (or "Open Next 5") below to deliver.`
        );
      } else {
        alert(`Broadcast queued: ${data.queued} recipients${data.failed ? ` (${data.failed} failed)` : ""}`);
      }
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  // -------------- WhatsApp queue handlers --------------
  function openQueueItem(item: WaQueueItem) {
    window.open(item.link, "_blank");
    setOpened((prev) => {
      const next = new Set(prev);
      next.add(item.phone);
      return next;
    });
  }

  function openNextFive() {
    const remaining = waQueue.filter((i) => !opened.has(i.phone)).slice(0, 5);
    remaining.forEach((item, idx) => {
      setTimeout(() => {
        window.open(item.link, "_blank");
        setOpened((prev) => {
          const next = new Set(prev);
          next.add(item.phone);
          return next;
        });
      }, idx * 500);
    });
  }

  function clearQueue() {
    setWaQueue([]);
    setOpened(new Set());
  }

  // ============================================================
  // STYLES
  // ============================================================
  const styles: Record<string, any> = {
    wrap: {
      minHeight: "100vh",
      background: COLORS.bg,
      padding: "24px",
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      color: COLORS.text,
    },
    container: { maxWidth: 1280, margin: "0 auto" },
    header: {
      background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDark})`,
      color: "white",
      padding: "24px 28px",
      borderRadius: 12,
      marginBottom: 24,
      borderLeft: `6px solid ${COLORS.gold}`,
    },
    h1: { margin: 0, fontSize: 26, fontWeight: 700 },
    subtitle: { margin: "6px 0 0", color: COLORS.gold, fontSize: 14 },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
      gap: 20,
      marginBottom: 24,
    },
    card: {
      background: COLORS.card,
      borderRadius: 12,
      padding: 20,
      border: `1px solid ${COLORS.border}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    },
    cardTitle: {
      margin: "0 0 14px",
      fontSize: 14,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      color: COLORS.green,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    statusDot: (ok: boolean): React.CSSProperties => ({
      display: "inline-block",
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: ok ? COLORS.success : COLORS.danger,
      boxShadow: `0 0 0 3px ${ok ? COLORS.success + "33" : COLORS.danger + "33"}`,
    }),
    statusText: { fontSize: 14, color: COLORS.textMuted, marginBottom: 8 },
    label: {
      display: "block",
      fontSize: 12,
      fontWeight: 600,
      color: COLORS.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: `1px solid ${COLORS.border}`,
      fontSize: 14,
      background: "white",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    select: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: `1px solid ${COLORS.border}`,
      fontSize: 14,
      background: "white",
      boxSizing: "border-box",
      cursor: "pointer",
    },
    textarea: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: `1px solid ${COLORS.border}`,
      fontSize: 14,
      fontFamily: "inherit",
      minHeight: 100,
      resize: "vertical",
      boxSizing: "border-box",
    },
    btn: {
      padding: "10px 18px",
      borderRadius: 8,
      border: "none",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.15s",
    },
    btnPrimary: {
      background: COLORS.green,
      color: "white",
    },
    btnGold: {
      background: COLORS.gold,
      color: COLORS.greenDark,
    },
    btnOutline: {
      background: "transparent",
      color: COLORS.green,
      border: `1px solid ${COLORS.green}`,
    },
    btnDanger: {
      background: "transparent",
      color: COLORS.danger,
      border: `1px solid ${COLORS.danger}`,
    },
    btnRow: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" },
    preview: {
      background: COLORS.bg,
      borderRadius: 8,
      padding: 14,
      fontSize: 14,
      whiteSpace: "pre-wrap",
      border: `1px dashed ${COLORS.border}`,
      maxHeight: 280,
      overflowY: "auto",
      lineHeight: 1.5,
    },
    memberList: {
      maxHeight: 300,
      overflowY: "auto",
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      marginTop: 8,
    },
    memberRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 12px",
      borderBottom: `1px solid ${COLORS.border}`,
      fontSize: 14,
    },
    queueList: {
      maxHeight: 360,
      overflowY: "auto",
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      marginTop: 8,
    },
    queueRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 12px",
      borderBottom: `1px solid ${COLORS.border}`,
      fontSize: 14,
      gap: 8,
    },
    logBox: {
      background: COLORS.greenDark,
      color: "#d4f5db",
      borderRadius: 8,
      padding: 12,
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: 12,
      maxHeight: 320,
      overflowY: "auto",
    },
    logEntry: (status: string): React.CSSProperties => ({
      padding: "4px 8px",
      borderLeft: `3px solid ${
        status === "failed" ? COLORS.danger : COLORS.success
      }`,
      marginBottom: 4,
      background: "rgba(255,255,255,0.05)",
      borderRadius: 4,
    }),
    badge: {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 600,
      background: COLORS.gold,
      color: COLORS.greenDark,
      marginLeft: 8,
    },
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={styles.wrap}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.h1}>
            📱 The Potter&apos;s Hub — Outreach Center
          </h1>
          <p style={styles.subtitle}>
            WhatsApp + SMS messaging for the church family
          </p>
        </div>

        {/* Status Cards */}
        <div style={styles.grid}>
          {/* WhatsApp Status */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <span style={styles.statusDot(true)} />
              WhatsApp — Click-to-Send Mode
            </h3>
            <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0 }}>
              Messages open WhatsApp on your device with the text pre-filled. Tap Send to deliver.
            </p>
            <div style={{ ...styles.statusText, marginTop: 12 }}>
              Mode: <strong>{waStatus.mode || "wa.me"}</strong>
              <span style={styles.badge}>READY</span>
            </div>
          </div>

          {/* SMS Gateway Status */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <span style={styles.statusDot(smsStatus.available)} />
              SMS Gateway
            </h3>
            <div style={styles.statusText}>
              Status:{" "}
              <strong>
                {smsStatus.available ? "Connected ✓" : "Offline"}
              </strong>
              {smsStatus.available && <span style={styles.badge}>READY</span>}
            </div>
            <div style={{ ...styles.statusText, fontSize: 12 }}>
              Provider: <code>{smsStatus.provider || "Not configured"}</code>
            </div>
            <div style={{ ...styles.statusText, fontSize: 12 }}>
              Sender: <code>{smsStatus.sender || "PottersHub"}</code>
            </div>
            {!smsStatus.available && (
              <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 8 }}>
                SMS not configured. Ask your developer to set TERMII_API_KEY.
              </p>
            )}
          </div>
        </div>

        {/* Compose Section */}
        <div style={styles.grid}>
          {/* Message Composer */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>✉️ Compose Message</h3>
            <label style={styles.label}>Message Type</label>
            <select
              style={styles.select}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {Object.keys(groupedTemplates).length === 0 ? (
                <option value="welcome">Welcome New Member</option>
              ) : (
                Object.entries(groupedTemplates).map(([groupName, opts]) => (
                  <optgroup key={groupName} label={groupName}>
                    {opts.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.icon ? `${t.icon} ` : ""}
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                ))
              )}
            </select>

            {type === "custom" && (
              <>
                <label style={styles.label}>
                  Custom Message (use {"{name}"} for personalization)
                </label>
                <textarea
                  style={styles.textarea}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Hello {name}, we have something special for you..."
                />
              </>
            )}

            <label style={styles.label}>Preview as Name</label>
            <input
              style={styles.input}
              value={previewName}
              onChange={(e) => setPreviewName(e.target.value)}
              placeholder="Beloved"
            />

            <label style={styles.label}>Preview</label>
            <div style={styles.preview}>{previewText || "Loading..."}</div>
          </div>

          {/* Single Send */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📨 Send to One Person</h3>
            <label style={styles.label}>Recipient Name</label>
            <input
              style={styles.input}
              value={singleName}
              onChange={(e) => setSingleName(e.target.value)}
              placeholder="e.g. Brother Tunde"
            />
            <label style={styles.label}>Phone Number</label>
            <input
              style={styles.input}
              value={singlePhone}
              onChange={(e) => setSinglePhone(e.target.value)}
              placeholder="08012345678 or +2348012345678"
            />
            <div style={styles.btnRow}>
              <button
                style={{ ...styles.btn, ...styles.btnPrimary }}
                onClick={() => sendSingle("whatsapp")}
                disabled={busy}
              >
                💬 Send WhatsApp
              </button>
              <button
                style={{ ...styles.btn, ...styles.btnGold }}
                onClick={() => sendSingle("sms")}
                disabled={busy || !smsStatus.available}
              >
                📩 Send SMS
              </button>
            </div>
            <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 12 }}>
              WhatsApp opens on your device with the message pre-filled. SMS is disabled when the provider is not configured.
            </p>
          </div>
        </div>

        {/* Member List + Broadcast */}
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              👥 Member List ({members.length})
            </h3>

            <label style={styles.label}>Add Member Manually</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...styles.input, flex: 1 }}
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                style={{ ...styles.input, flex: 1 }}
                placeholder="Phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
              <button
                style={{ ...styles.btn, ...styles.btnGold }}
                onClick={addMember}
              >
                + Add
              </button>
            </div>

            <label style={styles.label}>Or Import from CSV (name, phone)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvUpload}
              style={{ fontSize: 13 }}
            />

            {members.length > 0 && (
              <>
                <div style={styles.memberList}>
                  {members.map((m) => (
                    <div key={m.id} style={styles.memberRow}>
                      <div>
                        <strong>{m.name}</strong>
                        <span
                          style={{
                            color: COLORS.textMuted,
                            marginLeft: 8,
                            fontSize: 12,
                          }}
                        >
                          {m.phone}
                        </span>
                      </div>
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          color: COLORS.danger,
                          cursor: "pointer",
                          fontSize: 18,
                        }}
                        onClick={() => removeMember(m.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div style={styles.btnRow}>
                  <button
                    style={{ ...styles.btn, ...styles.btnDanger }}
                    onClick={clearMembers}
                  >
                    Clear All
                  </button>
                </div>
              </>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📢 Broadcast to All Members</h3>
            <p style={{ fontSize: 13, color: COLORS.textMuted }}>
              Sends the selected message type to all <strong>{members.length}</strong> members on your list.
              WhatsApp uses click-to-send (each message opens on your device for you to tap Send). SMS sends automatically via the server.
            </p>
            <div style={styles.btnRow}>
              <button
                style={{
                  ...styles.btn,
                  ...styles.btnPrimary,
                  flex: 1,
                  padding: "14px",
                }}
                onClick={() => broadcast("whatsapp")}
                disabled={busy || members.length === 0}
              >
                💬 Broadcast WhatsApp to {members.length}
              </button>
            </div>
            <div style={styles.btnRow}>
              <button
                style={{
                  ...styles.btn,
                  ...styles.btnGold,
                  flex: 1,
                  padding: "14px",
                }}
                onClick={() => broadcast("sms")}
                disabled={busy || !smsStatus.available || members.length === 0}
              >
                📩 Broadcast SMS to {members.length}
              </button>
            </div>

            {/* WhatsApp send queue */}
            {waQueue.length > 0 && (
              <>
                <h4
                  style={{
                    ...styles.cardTitle,
                    marginTop: 20,
                    fontSize: 13,
                  }}
                >
                  📤 WhatsApp Send Queue ({opened.size}/{waQueue.length} opened)
                </h4>
                <div style={styles.btnRow}>
                  <button
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                    onClick={openNextFive}
                    disabled={opened.size >= waQueue.length}
                  >
                    ⏭ Open Next 5
                  </button>
                  <button
                    style={{ ...styles.btn, ...styles.btnDanger }}
                    onClick={clearQueue}
                  >
                    Clear Queue
                  </button>
                </div>
                <div style={styles.queueList}>
                  {waQueue.map((item) => {
                    const isOpened = opened.has(item.phone);
                    return (
                      <div key={item.phone} style={styles.queueRow}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong>{item.name}</strong>
                          <span
                            style={{
                              color: COLORS.textMuted,
                              marginLeft: 8,
                              fontSize: 12,
                            }}
                          >
                            {item.phone}
                          </span>
                        </div>
                        {isOpened ? (
                          <span
                            style={{
                              color: COLORS.success,
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            ✓ Opened
                          </span>
                        ) : (
                          <button
                            style={{
                              ...styles.btn,
                              ...styles.btnPrimary,
                              padding: "6px 12px",
                              fontSize: 13,
                            }}
                            onClick={() => openQueueItem(item)}
                          >
                            📤 Send
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live Log */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📋 Live Send Log</h3>
          <div style={styles.logBox}>
            {log.length === 0 ? (
              <div style={{ opacity: 0.6 }}>No activity yet...</div>
            ) : (
              log.map((entry, idx) => (
                <div key={idx} style={styles.logEntry(entry.status)}>
                  <strong>
                    [{new Date(entry.time).toLocaleTimeString()}]
                  </strong>{" "}
                  {entry.channel?.toUpperCase()} →{" "}
                  {entry.status === "failed" ? "✗" : "✓"} {entry.to}
                  {entry.name && ` (${entry.name})`}
                  {entry.type && (
                    <span style={{ opacity: 0.7 }}> [{entry.type}]</span>
                  )}
                  {entry.error && (
                    <span style={{ color: "#ffb3b3" }}> — {entry.error}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
