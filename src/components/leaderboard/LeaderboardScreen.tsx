import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { C, LeaderboardEntry } from "./constants";

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

interface LeaderboardScreenProps {
  session: Session;
  onClose: () => void;
  openCount: number;
}

export function LeaderboardScreen({ session, onClose, openCount }: LeaderboardScreenProps) {
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

      // Fetch display names from profiles table for all players in this batch
      const userIds = [...new Set(data.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      const nameMap = new Map<string, string>();
      (profiles ?? []).forEach((p) => {
        if (p.display_name) nameMap.set(p.id, p.display_name);
      });

      // Fallback: ensure current user's name is always shown correctly
      const currentUserName =
        (session.user.user_metadata?.display_name as string | undefined) ??
        nameMap.get(session.user.id) ??
        session.user.email?.split("@")[0] ??
        "you";
      nameMap.set(session.user.id, currentUserName);

      const mapped: LeaderboardEntry[] = data.map((row, i) => {
        const isCurrentUser = row.user_id === session.user.id;
        const displayName =
          nameMap.get(row.user_id) ?? `player_${row.user_id.slice(0, 6)}`;

        return {
          rank: i + 1,
          userId: row.user_id,
          displayName,
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
