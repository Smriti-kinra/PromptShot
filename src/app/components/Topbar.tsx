import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";

const C = {
  bg: "#0B1610",
  surface: "#121C14",
  surface2: "#1A2E1C",
  primary: "#D4E8D4",
  secondary: "#4A6B4A",
  mint: "#6EE09B",
  amber: "var(--ps-amber)",
  red: "#FF5F5F",
  border: "#243B27",
  divider: "#1A2E1C",
  font: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// ── slide panel (used by the nav menu) ────────────────────────────────────────

function SlidePanel({
  open,
  onClose,
  from,
  width,
  children,
}: {
  open: boolean;
  onClose: () => void;
  from: "left" | "right";
  width: number;
  children: React.ReactNode;
}) {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setRendered(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!rendered) return null;

  const translateOut = from === "left" ? "-100%" : "100%";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        justifyContent: from === "left" ? "flex-start" : "flex-end",
        fontFamily: C.font,
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          opacity: visible ? 1 : 0,
          transition: "opacity 300ms ease",
        }}
      />
      <div
        style={{
          position: "relative",
          width: `${width}px`,
          maxWidth: "100vw",
          height: "100%",
          background: C.surface,
          overflowY: "auto",
          transform: visible ? "translateX(0)" : `translateX(${translateOut})`,
          transition: visible ? "transform 300ms ease-out" : "transform 250ms ease-in",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── nav menu (left) — PromptShot 101 + play/sandbox links ─────────────────────

function NavMenu({
  open,
  onClose,
  session,
  streak,
  onOpenLearn,
  hasPlayedToday,
  onStartPlay,
}: {
  open: boolean;
  onClose: () => void;
  session: Session | null;
  streak: number;
  onOpenLearn: () => void;
  hasPlayedToday?: boolean;
  onStartPlay?: () => void;
}) {
  return (
    <SlidePanel open={open} onClose={onClose} from="left" width={300}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <span style={{ fontFamily: C.font, fontSize: "16px", fontWeight: 850, color: C.primary, letterSpacing: "-0.04em" }}>Prompt</span>
          <span style={{ fontFamily: C.font, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.mint, paddingRight: "2px", letterSpacing: "-0.03em" }}>Shot</span>
          <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: C.amber, marginRight: "4px", alignSelf: "center", marginTop: "2px" }} />
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: C.secondary, fontSize: "22px", cursor: "pointer", lineHeight: 1, padding: "4px" }}
        >
          ×
        </button>
      </div>

      {/* User info */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", color: C.secondary, fontFamily: C.mono, marginBottom: "4px" }}>
          {session ? (
            <span>
              {(session.user.user_metadata?.display_name as string | undefined) ?? session.user.email}
            </span>
          ) : (
            "Playing as guest"
          )}
        </div>
        {streak > 0 && (
          <div style={{ fontSize: "20px", fontWeight: 700, color: C.primary }}>
            🔥 {streak} day streak
          </div>
        )}
      </div>

      <div style={{ height: "1px", background: C.divider, marginBottom: "20px" }} />

      {/* PromptShot 101 link */}
      <button
        onClick={() => { onClose(); onOpenLearn(); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "10px 0",
          display: "flex",
          alignItems: "center",
          width: "100%",
          textAlign: "left",
        }}
      >
        <span style={{ fontFamily: C.font, fontSize: "14px", fontWeight: 850, color: "var(--ps-text-primary)", letterSpacing: "-0.04em" }}>Prompt</span>
        <span style={{ fontFamily: C.font, fontSize: "14px", fontWeight: 300, fontStyle: "italic", color: "var(--ps-teal)", paddingRight: "2px", letterSpacing: "-0.03em" }}>Shot</span>
        <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--ps-amber)", marginRight: "5px", alignSelf: "center", marginTop: "3px" }} />
        <span style={{ fontFamily: C.font, fontSize: "14px", fontWeight: 700, color: "var(--ps-text-primary)", marginRight: "4px" }}>101</span>
        <span style={{ fontFamily: C.font, fontSize: "14px", color: "var(--ps-text-secondary)" }}>›</span>
      </button>

      {/* Play link */}
      {!hasPlayedToday && onStartPlay && (
        <button
          onClick={() => { onClose(); onStartPlay(); }}
          style={{ background: "none", border: "none", color: C.mint, fontSize: "14px", cursor: "pointer", padding: "10px 0", display: "block", width: "100%", textAlign: "left", fontFamily: C.font, fontWeight: 600 }}
        >
          Play Today's Challenge ›
        </button>
      )}
    </SlidePanel>
  );
}

// ── main Topbar ───────────────────────────────────────────────────────────────

export interface TopbarProps {
  session: Session | null;
  streak: number;
  onOpenLearn: () => void;
  onOpenLeaderboard: () => void;
  showHint?: boolean;
  onToggleHint?: () => void;
  hasPlayedToday?: boolean;
  onStartPlay?: () => void;
}

export function Topbar({
  session,
  streak,
  onOpenLearn,
  onOpenLeaderboard,
  hasPlayedToday,
  onStartPlay,
}: TopbarProps) {
  const [showNav, setShowNav] = useState(false);

  return (
    <>
      {/* Help Icon (Top-Left Corner) */}
      <button
        onClick={onOpenLearn}
        aria-label="Help / Learn"
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 50,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: C.secondary,
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.15s, transform 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = C.primary;
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = C.secondary;
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      {/* Leaderboard Icon (Top-Right Corner) */}
      <button
        onClick={onOpenLeaderboard}
        aria-label="Leaderboard"
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 50,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: C.secondary,
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.15s, transform 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = C.primary;
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = C.secondary;
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="10" width="5" height="10" rx="0.5" />
          <rect x="9.5" y="4" width="5" height="16" rx="0.5" />
          <rect x="16" y="13" width="5" height="7" rx="0.5" />
        </svg>
      </button>

      <NavMenu
        open={showNav}
        onClose={() => setShowNav(false)}
        session={session}
        streak={streak}
        onOpenLearn={onOpenLearn}
        hasPlayedToday={hasPlayedToday}
        onStartPlay={onStartPlay}
      />
    </>
  );
}
