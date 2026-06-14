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

  const titleText = session ? "Today's Leaderboard" : "Leaderboard";

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
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ps-amber)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M6 3.5h12l-1 7.5a5 5 0 0 1-5 4.5 5 5 0 0 1-5-4.5L6 3.5z" />
              <path d="M6 5C3.5 5 2.5 7 3.5 10.5" />
              <path d="M18 5C20.5 5 21.5 7 20.5 10.5" />
              <path d="M11 15.5c0 2-.8 3.5-1.5 5" />
              <path d="M13 15.5c0 2 .8 3.5 1.5 5" />
              <rect x="7" y="20.5" width="10" height="2.5" rx="1" />
            </svg>
            <span>{titleText}</span>
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
