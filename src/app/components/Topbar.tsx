import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

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

// ── slide panel ───────────────────────────────────────────────────────────────

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

// ── settings / hamburger sidebar (right) ──────────────────────────────────────

function SettingsSidebar({
  open,
  onClose,
  session,
  streak,
  difficulty,
  onDifficultyChange,
  onOpenLearn,
  onBackToMenu,
  hasPlayedToday,
  onStartPlay,
  onPlaySandbox,
}: {
  open: boolean;
  onClose: () => void;
  session: Session | null;
  streak: number;
  difficulty: string;
  onDifficultyChange: (d: string) => void;
  onOpenLearn: () => void;
  onBackToMenu?: () => void;
  hasPlayedToday?: boolean;
  onStartPlay?: () => void;
  onPlaySandbox?: () => void;
}) {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0B1610",
    border: `1px solid ${C.border}`,
    borderRadius: "8px",
    padding: "12px 14px",
    color: C.primary,
    fontSize: "14px",
    fontFamily: C.font,
    boxSizing: "border-box",
    outline: "none",
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (authMode === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setAuthLoading(true);
    if (authMode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else onClose();
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(err.message);
      else setInfo("Check your email to confirm your account.");
    }
    setAuthLoading(false);
  };

  return (
    <SlidePanel open={open} onClose={onClose} from="right" width={300}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "16px", fontWeight: 600, color: C.primary }}>Settings</div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: C.secondary, fontSize: "24px", cursor: "pointer", lineHeight: 1, padding: "4px" }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "12px", color: C.secondary, fontFamily: C.mono, marginBottom: "4px" }}>
          {session ? session.user.email : "Guest"}
        </div>
        {streak > 0 && (
          <div style={{ fontSize: "20px", fontWeight: 700, color: C.primary }}>
            🔥 {streak} day streak
          </div>
        )}
      </div>

      <div style={{ height: "1px", background: C.divider, marginBottom: "24px" }} />

      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", color: C.secondary, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: C.mono }}>
          Difficulty
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {(["BEGINNER", "PRO", "EXPERT"] as const).map((d) => (
            <button
              key={d}
              onClick={() => onDifficultyChange(d)}
              style={{
                flex: 1,
                height: "34px",
                background: difficulty === d ? C.mint : "transparent",
                color: difficulty === d ? "#0B1610" : C.secondary,
                border: `1px solid ${difficulty === d ? C.mint : C.border}`,
                borderRadius: "20px",
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: C.font,
                letterSpacing: "0.05em",
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: "1px", background: C.divider, marginBottom: "24px" }} />

      <button
        onClick={() => { onClose(); onOpenLearn(); }}
        style={{ background: "none", border: "none", color: C.primary, fontSize: "14px", cursor: "pointer", padding: "10px 0", display: "block", width: "100%", textAlign: "left", fontFamily: C.font }}
      >
        Prompt Engineering 101 ›
      </button>

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

      {onBackToMenu && (
        <button
          onClick={() => { onClose(); onBackToMenu(); }}
          style={{ background: "none", border: "none", color: C.primary, fontSize: "14px", cursor: "pointer", padding: "10px 0", display: "block", width: "100%", textAlign: "left", fontFamily: C.font }}
        >
          Back to Home Menu ›
        </button>
      )}

      <div style={{ height: "1px", background: C.divider, marginBottom: "24px", marginTop: "8px" }} />

      {session ? (
        <button
          onClick={() => { supabase.auth.signOut(); onClose(); }}
          style={{
            width: "100%", height: "42px", background: "transparent",
            border: `1px solid ${C.border}`, color: C.primary, borderRadius: "8px",
            fontSize: "14px", cursor: "pointer", fontFamily: C.font,
          }}
        >
          Sign out
        </button>
      ) : (
        <>
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.primary, marginBottom: "14px", fontFamily: C.font }}>
            {authMode === "signin" ? "Sign in to save progress" : "Create account"}
          </div>
          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            {authMode === "signup" && (
              <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={inputStyle} />
            )}
            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: "100%", height: "42px", background: C.mint, color: "#0B1610",
                border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700,
                cursor: authLoading ? "not-allowed" : "pointer", marginTop: "4px", fontFamily: C.font,
              }}
            >
              {authLoading ? "…" : authMode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          {error && <div style={{ color: C.red, fontSize: "12px", marginTop: "8px", fontFamily: C.mono }}>{error}</div>}
          {info && <div style={{ color: C.mint, fontSize: "12px", marginTop: "8px", fontFamily: C.mono }}>{info}</div>}
          <button
            onClick={() => { setAuthMode(authMode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
            style={{ background: "none", border: "none", color: C.secondary, fontSize: "12px", cursor: "pointer", padding: 0, marginTop: "14px", display: "block", fontFamily: C.font }}
          >
            {authMode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </>
      )}
    </SlidePanel>
  );
}

// ── main Topbar ───────────────────────────────────────────────────────────────

export interface TopbarProps {
  session: Session | null;
  streak: number;
  difficulty: string;
  onDifficultyChange: (d: string) => void;
  onOpenLearn: () => void;
  showHint?: boolean;
  onToggleHint?: () => void;
  onBackToMenu?: () => void;
  hasPlayedToday?: boolean;
  onStartPlay?: () => void;
  onPlaySandbox?: () => void;
}

export function Topbar({
  session,
  streak,
  difficulty,
  onDifficultyChange,
  onOpenLearn,
  onBackToMenu,
  hasPlayedToday,
  onStartPlay,
  onPlaySandbox,
}: TopbarProps) {
  const [showSettings, setShowSettings] = useState(false);

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
        <button
          onClick={onOpenLearn}
          aria-label="Help / Learn"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.secondary,
            fontSize: "18px",
            fontWeight: 600,
            fontFamily: C.font,
            width: "56px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.secondary)}
        >
          ?
        </button>

        <div
          style={{
            textAlign: "center",
            fontSize: "18px",
            fontWeight: 700,
            color: C.primary,
            fontFamily: C.font,
            letterSpacing: "-0.01em",
          }}
        >
          PromptShot 🎯
        </div>

        <button
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.secondary,
            fontSize: "20px",
            fontFamily: C.font,
            width: "56px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.secondary)}
        >
          ≡
        </button>
      </div>

      <SettingsSidebar
        open={showSettings}
        onClose={() => setShowSettings(false)}
        session={session}
        streak={streak}
        difficulty={difficulty}
        onDifficultyChange={onDifficultyChange}
        onOpenLearn={onOpenLearn}
        onBackToMenu={onBackToMenu}
        hasPlayedToday={hasPlayedToday}
        onStartPlay={onStartPlay}
        onPlaySandbox={onPlaySandbox}
      />
    </>
  );
}
