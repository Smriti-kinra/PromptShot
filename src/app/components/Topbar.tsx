import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";

const C = {
  bg: "#0B1610",
  surface: "#121C14",
  surface2: "#1A2E1C",
  primary: "#D4E8D4",
  secondary: "#4A6B4A",
  mint: "#6EE09B",
  amber: "#F5C518",
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
  onPlaySandbox,
}: {
  open: boolean;
  onClose: () => void;
  session: Session | null;
  streak: number;
  onOpenLearn: () => void;
  hasPlayedToday?: boolean;
  onStartPlay?: () => void;
  onPlaySandbox?: () => void;
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

      {/* Play / Sandbox link */}
      {hasPlayedToday ? (
        onPlaySandbox && (
          <button
            onClick={() => { onClose(); onPlaySandbox(); }}
            style={{ background: "none", border: "none", color: C.mint, fontSize: "14px", cursor: "pointer", padding: "10px 0", display: "block", width: "100%", textAlign: "left", fontFamily: C.font, fontWeight: 600 }}
          >
            Practice in Sandbox ›
          </button>
        )
      ) : (
        onStartPlay && (
          <button
            onClick={() => { onClose(); onStartPlay(); }}
            style={{ background: "none", border: "none", color: C.mint, fontSize: "14px", cursor: "pointer", padding: "10px 0", display: "block", width: "100%", textAlign: "left", fontFamily: C.font, fontWeight: 600 }}
          >
            Play Today's Challenge ›
          </button>
        )
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
  onPlaySandbox?: () => void;
}

export function Topbar({
  session,
  streak,
  onOpenLearn,
  onOpenLeaderboard,
  hasPlayedToday,
  onStartPlay,
  onPlaySandbox,
}: TopbarProps) {
  const [showNav, setShowNav] = useState(false);

  const iconBtnStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: C.secondary,
    width: "56px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.15s",
  };

  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: "56px",
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          display: "grid",
          gridTemplateColumns: "56px 1fr 56px",
          alignItems: "center",
        }}
      >
        {/* Left — ? help */}
        <button
          onClick={onOpenLearn}
          aria-label="Help / Learn"
          style={{ ...iconBtnStyle, fontSize: "18px", fontWeight: 600, fontFamily: C.font }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.secondary)}
        >
          ?
        </button>

        {/* Center — empty */}
        <div style={{ textAlign: "center" }} />

        {/* Right — 🏆 leaderboard */}
        <button
          onClick={onOpenLeaderboard}
          aria-label="Leaderboard"
          style={{ ...iconBtnStyle, fontSize: "20px" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.secondary)}
        >
          🏆
        </button>
      </div>

      <NavMenu
        open={showNav}
        onClose={() => setShowNav(false)}
        session={session}
        streak={streak}
        onOpenLearn={onOpenLearn}
        hasPlayedToday={hasPlayedToday}
        onStartPlay={onStartPlay}
        onPlaySandbox={onPlaySandbox}
      />
    </>
  );
}
