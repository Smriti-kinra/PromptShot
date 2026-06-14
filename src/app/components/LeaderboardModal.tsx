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
  amber: "var(--ps-amber)",
  red: "#FF5F5F",
  border: "#243B27",
  font: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  total: number;
  accuracy: number;
  format: number;
  brevity: number;
  userPrompt: string | null;
  isCurrentUser: boolean;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  openCount?: number;
}

// ── Gate screen (not signed in) ─────────────────────────────────────────────

function GateScreen({ onClose }: { onClose: () => void }) {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
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
    if (authMode === "signup" && !displayName.trim()) {
      setError("Please enter a display name.");
      return;
    }
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
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() || email.split("@")[0] } },
      });
      if (err) setError(err.message);
      else setInfo("Check your email to confirm your account.");
    }
    setAuthLoading(false);
  };

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Trophy graphic */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "rgba(245, 197, 24, 0.1)",
          border: `2px solid rgba(245, 197, 24, 0.25)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          fontSize: "32px",
        }}>
          🏆
        </div>
        <div style={{
          fontSize: "20px",
          fontWeight: 700,
          color: C.primary,
          fontFamily: C.font,
          marginBottom: "8px",
          lineHeight: 1.2,
        }}>
          See where you rank
        </div>
        <div style={{
          fontSize: "13px",
          color: C.secondary,
          fontFamily: C.font,
          lineHeight: 1.5,
          maxWidth: "260px",
          margin: "0 auto",
        }}>
          Your score is saved locally. Sign in to appear on the leaderboard and compare with others.
        </div>
      </div>

      <div style={{ height: "1px", background: C.border, margin: "20px 0" }} />

      <div style={{ fontSize: "13px", fontWeight: 600, color: C.primary, marginBottom: "14px", fontFamily: C.font }}>
        {authMode === "signin" ? "Sign in to continue" : "Create account"}
      </div>

      <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {authMode === "signup" && (
          <input
            type="text"
            placeholder="Your name (shown on leaderboard)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={32}
            style={inputStyle}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        {authMode === "signup" && (
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={inputStyle}
          />
        )}
        <button
          type="submit"
          disabled={authLoading}
          style={{
            width: "100%",
            height: "44px",
            background: C.mint,
            color: "#0B1610",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: authLoading ? "not-allowed" : "pointer",
            marginTop: "4px",
            fontFamily: C.font,
            transition: "opacity 0.15s",
            opacity: authLoading ? 0.6 : 1,
          }}
        >
          {authLoading ? "…" : authMode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      {error && (
        <div style={{ color: C.red, fontSize: "12px", marginTop: "10px", fontFamily: C.mono }}>
          {error}
        </div>
      )}
      {info && (
        <div style={{ color: C.mint, fontSize: "12px", marginTop: "10px", fontFamily: C.mono }}>
          {info}
        </div>
      )}

      <button
        onClick={() => { setAuthMode(authMode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
        style={{
          background: "none",
          border: "none",
          color: C.secondary,
          fontSize: "12px",
          cursor: "pointer",
          padding: 0,
          marginTop: "16px",
          display: "block",
          fontFamily: C.font,
        }}
      >
        {authMode === "signin" ? "No account? Sign up →" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}

// ── Score bar ───────────────────────────────────────────────────────────────

function ScoreBar({ label, value, max, tooltip }: { label: string; value: number; max: number; tooltip: string }) {
  return (
    <div title={tooltip} style={{ marginBottom: "8px" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "3px",
        fontSize: "11px",
        fontFamily: C.font,
      }}>
        <span style={{ color: C.secondary }}>{label}</span>
        <span style={{ color: C.primary }}>{value}/{max}</span>
      </div>
      <div style={{ height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "9999px", overflow: "hidden" }}>
        <div style={{
          width: `${(value / max) * 100}%`,
          height: "100%",
          background: C.amber,
          transition: "width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)",
        }} />
      </div>
    </div>
  );
}

// ── Leaderboard row ─────────────────────────────────────────────────────────

function LeaderboardRow({
  entry,
  isExpanded,
  onToggle,
}: {
  entry: LeaderboardEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const rankColor = entry.rank === 1 ? "#FFD700" : entry.rank === 2 ? "#C0C0C0" : entry.rank === 3 ? "#CD7F32" : C.secondary;
  const rankLabel = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`;

  return (
    <div style={{
      borderBottom: `1px solid rgba(255,255,255,0.05)`,
      background: entry.isCurrentUser ? "rgba(245, 197, 24, 0.04)" : "transparent",
      borderLeft: entry.isCurrentUser ? `2px solid ${C.amber}` : "2px solid transparent",
      transition: "background 0.2s",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textAlign: "left",
        }}
      >
        {/* Rank */}
        <span style={{
          fontSize: "13px",
          fontWeight: 700,
          color: rankColor,
          fontFamily: C.mono,
          minWidth: "28px",
        }}>
          {rankLabel}
        </span>

        {/* Name */}
        <span style={{
          flex: 1,
          fontSize: "13px",
          color: entry.isCurrentUser ? C.amber : C.primary,
          fontFamily: C.font,
          fontWeight: entry.isCurrentUser ? 600 : 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {entry.displayName}
          {entry.isCurrentUser && (
            <span style={{ fontSize: "10px", color: C.amber, marginLeft: "6px", opacity: 0.7 }}>you</span>
          )}
        </span>

        {/* Total score */}
        <span style={{
          fontSize: "14px",
          fontWeight: 700,
          color: entry.isCurrentUser ? C.amber : C.primary,
          fontFamily: C.mono,
          minWidth: "48px",
          textAlign: "right",
        }}>
          {entry.total}
          <span style={{ fontSize: "10px", color: C.secondary, fontWeight: 400 }}>/100</span>
        </span>

        {/* Expand chevron */}
        <span style={{
          color: C.secondary,
          fontSize: "11px",
          transition: "transform 0.2s",
          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          display: "inline-block",
        }}>
          ▾
        </span>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div style={{
          padding: "0 12px 14px 50px",
          animation: "none",
        }}>
          <ScoreBar label="Accuracy" value={entry.accuracy} max={50} tooltip="Semantic similarity (40 pts) and keyword coverage (10 pts)" />
          <ScoreBar label="Format" value={entry.format} max={20} tooltip="Structural match and output layout (20 pts)" />
          <ScoreBar label="Brevity" value={entry.brevity} max={30} tooltip="Green efficiency: token economy and speed (30 pts)" />

          {entry.isCurrentUser && entry.userPrompt && (
            <div style={{ marginTop: "10px" }}>
              <div style={{ fontSize: "10px", color: C.secondary, fontFamily: C.mono, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                Your prompt
              </div>
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
                padding: "8px 10px",
                fontSize: "12px",
                color: C.primary,
                fontFamily: C.mono,
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}>
                "{entry.userPrompt}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Leaderboard screen (signed in) ──────────────────────────────────────────

function LeaderboardScreen({ session, onClose, openCount }: { session: Session; onClose: () => void; openCount: number }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("scores")
        .select("user_id, accuracy, format, brevity, total, user_prompt")
        .eq("played_at", today)
        .order("total", { ascending: false })
        .limit(20);

      console.debug("[PromptShot] Leaderboard fetch — today:", today, "error:", error, "rows:", data?.length ?? 0, data);

      if (error || !data) {
        setLoading(false);
        return;
      }

      const mapped: LeaderboardEntry[] = data.map((row, i) => {
        const isCurrentUser = row.user_id === session.user.id;
        // Use display_name from user_metadata for the current user
        const currentUserName =
          (session.user.user_metadata?.display_name as string | undefined) ??
          session.user.email?.split("@")[0] ??
          "you";
        const emailPrefix = isCurrentUser
          ? currentUserName
          : `player_${row.user_id.slice(0, 6)}`;

        return {
          rank: i + 1,
          userId: row.user_id,
          displayName: emailPrefix,
          total: row.total,
          accuracy: row.accuracy,
          format: row.format,
          brevity: row.brevity,
          userPrompt: isCurrentUser ? row.user_prompt : null,
          isCurrentUser,
        };
      });

      setEntries(mapped);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [session, openCount]);

  const handleSignOut = async () => {
    setSignOutLoading(true);
    await supabase.auth.signOut();
    setSignOutLoading(false);
    onClose();
  };

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div>
      {/* Date header */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", color: C.secondary, fontFamily: C.mono, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {today}
        </div>
      </div>

      {/* Leaderboard list */}
      {loading ? (
        <div style={{ padding: "24px", textAlign: "center" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{
              height: "40px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "6px",
              marginBottom: "6px",
              animation: `pulse 1.4s ease-in-out ${i * 0.1}s infinite`,
            }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.6} }`}</style>
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 16px", color: C.secondary, fontSize: "14px", fontFamily: C.font }}>
          No scores yet today — be the first!
        </div>
      ) : (
        <div style={{
          border: `1px solid ${C.border}`,
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "16px",
        }}>
          {entries.map((entry) => (
            <LeaderboardRow
              key={entry.userId}
              entry={entry}
              isExpanded={expandedId === entry.userId}
              onToggle={() => setExpandedId(expandedId === entry.userId ? null : entry.userId)}
            />
          ))}
        </div>
      )}

      {/* Signed-in user info + sign-out */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        paddingTop: "14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ fontSize: "11px", color: C.secondary, fontFamily: C.mono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: "8px" }}>
          {session.user.email}
        </div>
        <button
          onClick={handleSignOut}
          disabled={signOutLoading}
          style={{
            background: "none",
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
            padding: "5px 12px",
            color: C.secondary,
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: C.font,
            whiteSpace: "nowrap",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = C.primary; e.currentTarget.style.borderColor = C.primary; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = C.secondary; e.currentTarget.style.borderColor = C.border; }}
        >
          {signOutLoading ? "…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

// ── Main modal ──────────────────────────────────────────────────────────────

export function LeaderboardModal({ isOpen, onClose, session, openCount = 0 }: LeaderboardModalProps) {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setRendered(false), 280);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!rendered) return null;

  const title = session ? "🏆 Today's Leaderboard" : "🏆 Leaderboard";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        opacity: visible ? 1 : 0,
        transition: "opacity 280ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          borderRadius: "16px",
          width: "94%",
          maxWidth: "420px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "transform 280ms ease",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 20px 14px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: "16px",
            fontWeight: 700,
            color: C.primary,
            fontFamily: C.font,
          }}>
            {title}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: C.secondary,
              fontSize: "22px",
              cursor: "pointer",
              lineHeight: 1,
              padding: "2px 4px",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.secondary)}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "18px 20px 20px", flex: 1 }}>
          {session ? (
            <LeaderboardScreen session={session} onClose={onClose} openCount={openCount} />
          ) : (
            <GateScreen onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
