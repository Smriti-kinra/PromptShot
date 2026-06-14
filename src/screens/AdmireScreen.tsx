import React from "react";
import { useCountdownToMidnight } from "../hooks/useCountdownToMidnight";
import { soundManager } from "../lib/sounds";
import { Wordmark } from "../components/Wordmark";

interface AdmireScreenProps {
  onAdmire: () => void;
}

export function AdmireScreen({ onAdmire }: AdmireScreenProps) {
  const { h, m, s } = useCountdownToMidnight();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 180px)",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
        {/* small target svg like landing */}
        <svg className="ps-target-svg" viewBox="0 0 160 160" style={{ overflow: "visible" }}>
          <circle
            cx="80" cy="80" r="14"
            fill="none" stroke="var(--ps-amber)"
            style={{ animation: "ripple-expand 4.5s ease-out infinite", transformOrigin: "80px 80px" }}
          />
          <g style={{ animation: "target-wobble 4.5s ease-out infinite", transformOrigin: "80px 80px" }}>
            <circle cx="80" cy="80" r="56" fill="none" stroke="rgba(20, 184, 166, 0.15)" strokeWidth="1.5" strokeDasharray="6 4" />
            <circle cx="80" cy="80" r="42" fill="none" stroke="var(--ps-teal)" strokeWidth="3" />
            <circle cx="80" cy="80" r="28" fill="none" stroke="var(--ps-text-primary)" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="80" cy="80" r="14" fill="var(--ps-amber)" />
            <circle cx="80" cy="80" r="5" fill="#000" />
          </g>
          <g id="arrow-group" style={{ animation: "arrow-shoot 4.5s infinite", transformOrigin: "0px 0px" }}>
            <line x1="-32" y1="0" x2="-2" y2="0" stroke="var(--ps-text-primary)" strokeWidth="2" strokeLinecap="round" />
            <path d="M -32 -5 L -24 0 L -32 5 L -37 5 L -30 0 L -37 -5 Z" fill="var(--ps-teal)" />
            <polygon points="0,0 -8,-4 -6,0 -8,4" fill="var(--ps-amber)" />
          </g>
        </svg>
      </div>

      <Wordmark size="lg" style={{ marginBottom: "12px" }} />

      <div style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        gap: "6px", 
        padding: "6px 16px", 
        borderRadius: "9999px", 
        border: "1px solid var(--ps-teal)", 
        color: "var(--ps-teal)", 
        fontSize: "13px", 
        fontWeight: 500,
        marginBottom: "16px",
        fontFamily: "Space Grotesk"
      }}>
        <span>✓</span> You already played today
      </div>

      <div style={{ fontSize: "14px", color: "var(--ps-text-secondary)", marginBottom: "8px", fontFamily: "Space Grotesk" }}>
        come back tomorrow~
      </div>

      <div style={{ fontSize: "20px", color: "var(--ps-text-primary)", fontWeight: 700, marginBottom: "24px", fontFamily: "var(--ps-font-mono)", letterSpacing: "1px" }}>
        {h}h {String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s
      </div>

      <button
        onClick={() => { soundManager.playClick(); onAdmire(); }}
        style={{ marginTop: "8px", padding: "12px 28px", borderRadius: "10px", background: "var(--ps-amber)", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "16px" }}
      >
        Admire your prompt →
      </button>
    </div>
  );
}
