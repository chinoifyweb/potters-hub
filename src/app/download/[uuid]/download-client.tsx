"use client";

import { useEffect, useState } from "react";

interface Props {
  uuid: string;
  originalName: string;
  directUrl: string;
  sizeHuman: string;
  icon: string;
  label: string;
  downloadCount: number;
}

export default function DownloadClient({ uuid, originalName, directUrl, sizeHuman, icon, label, downloadCount }: Props) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Auto-trigger download 1.2s after page load
    const timer = setTimeout(() => triggerDownload(), 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function triggerDownload() {
    setStarted(true);
    // Track download count (best-effort, non-blocking)
    fetch(`/api/files/${uuid}/track`, { method: "POST" }).catch(() => {});
    // Use an invisible iframe so the page doesn't navigate away
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = directUrl;
    document.body.appendChild(iframe);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #7f1d1d, #450a0a)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    }}>
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: "40px 32px",
        maxWidth: 480,
        width: "100%",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 14, color: "#991b1b", fontWeight: 600, letterSpacing: 1.5, marginBottom: 8 }}>
          THE POTTER&apos;S HOUSE CHURCH
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 24 }}>
          File Sharing
        </div>

        <div style={{ fontSize: 72, marginBottom: 16 }}>{icon}</div>

        {label && (
          <div style={{ fontSize: 16, color: "#991b1b", fontWeight: 600, marginBottom: 8 }}>
            {label}
          </div>
        )}

        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#111827",
          margin: "0 0 8px",
          wordBreak: "break-word",
          lineHeight: 1.3,
        }}>
          {originalName}
        </h1>

        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 32 }}>
          {sizeHuman} {downloadCount > 0 && `• ${downloadCount} downloads`}
        </div>

        {!started ? (
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#6b7280",
              fontSize: 14,
              marginBottom: 16,
            }}>
              <span style={{
                display: "inline-block",
                width: 16,
                height: 16,
                border: "2px solid #991b1b",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "tphc-spin 0.8s linear infinite",
              }}></span>
              Preparing your download…
            </div>
          </div>
        ) : (
          <div style={{ color: "#059669", fontSize: 14, marginBottom: 16 }}>
            ✓ Download started! Check your Downloads folder.
          </div>
        )}

        <button
          onClick={triggerDownload}
          style={{
            background: "#991b1b",
            color: "white",
            border: "none",
            padding: "14px 32px",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
            marginTop: 8,
            boxShadow: "0 4px 12px rgba(153, 27, 27, 0.3)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#7f1d1d")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#991b1b")}
        >
          {started ? "⬇ Download Again" : "⬇ Download Now"}
        </button>

        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 24, lineHeight: 1.5 }}>
          If the download doesn&apos;t start automatically, click the button above.
          <br />
          For APK files: after download, tap the file and allow installation from unknown sources.
        </p>

        <div style={{
          marginTop: 32,
          paddingTop: 20,
          borderTop: "1px solid #e5e7eb",
          fontSize: 11,
          color: "#9ca3af",
        }}>
          Shared by The Potter&apos;s House Church<br />
          <a href="https://tphc.org.ng" style={{ color: "#991b1b", textDecoration: "none" }}>tphc.org.ng</a>
        </div>
      </div>

      <style>{`
        @keyframes tphc-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
