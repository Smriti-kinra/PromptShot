import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { GateScreen } from "./leaderboard/GateScreen";
import { LeaderboardScreen } from "./leaderboard/LeaderboardScreen";
import { C } from "./leaderboard/constants";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  openCount?: number;
}

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
