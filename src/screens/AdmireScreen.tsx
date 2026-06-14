import React from "react";
import { useCountdownToMidnight } from "../hooks/useCountdownToMidnight";
import { soundManager } from "../lib/sounds";
import { useEffect, useState } from "react";

interface AdmireScreenProps {
  onAdmire: () => void;
}

export function AdmireScreen({ onAdmire }: AdmireScreenProps) {
  const { h, m, s } = useCountdownToMidnight();
  const [playRings, setPlayRings] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPlayRings(true), 80);
    return () => clearTimeout(t);
  }, []);

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
      <div style={{ width: "160px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
        {/* small target svg like landing */}
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ overflow: "visible" }}>
          <circle
            cx="80" cy="80" r="14"
            fill="none" stroke="var(--ps-amber)"
            style={{ animation: "ripple-expand 4.5s ease-out infinite", transformOrigin: "80px 80px" }}
          />
          <g style={{ animation: "target-wobble 4.5s ease-out infinite", transformOrigin: "80px 80px" }}>
            {/* animated rings using stroke-dashoffset to match ResultsScreen */}
            {([56, 42, 28] as const).map((r, i) => {
              const circumference = 2 * Math.PI * r;
              const initialOffset = circumference;
              const targetOffset = 0;
              const stroke = i === 0 ? "rgba(20,184,166,0.08)" : i === 1 ? "var(--ps-teal)" : "var(--ps-text-primary)";
              const strokeWidth = i === 1 ? 3 : 1.5;
              const dash = i === 0 ? "6 4" : i === 2 ? "4 3" : undefined;
              return (
                <g key={r}>
                  <circle cx="80" cy="80" r={r} fill="none" stroke="transparent" strokeWidth={strokeWidth} />
                  <circle
                    cx="80" cy="80"
                    r={r}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={playRings ? `${targetOffset}` : `${initialOffset}`}
                    transform="rotate(-90 80 80)"
                    style={{ transition: `stroke-dashoffset 0.8s ease-out ${i * 0.14}s` }}
                  />
                  {dash && <circle cx="80" cy="80" r={r} fill="none" stroke="transparent" strokeDasharray={dash as any} />}
                </g>
              );
            })}
            <circle cx="80" cy="80" r="14" fill="var(--ps-amber)" />
            <circle cx="80" cy="80" r="5" fill="#000" />
          </g>
        </svg>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "2px", justifyContent: "center", marginBottom: "12px" }}>
        <span style={{ fontFamily: "Space Grotesk", fontSize: "36px", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--ps-text-primary)" }}>Prompt</span>
        <span style={{ fontFamily: "Space Grotesk", fontSize: "36px", fontWeight: 400, fontStyle: "italic", letterSpacing: "-0.03em", color: "var(--ps-teal)", paddingRight: "6px" }}>Shot</span>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ps-amber)", alignSelf: "flex-end", marginBottom: "8px" }} />
      </div>

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
