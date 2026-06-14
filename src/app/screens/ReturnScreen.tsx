import { useState } from "react";
import type { Challenge } from "../../lib/supabase";
import type { ScoreResult } from "../../lib/scorer";
import { useCountdownToMidnight } from "../../hooks/useCountdownToMidnight";

export function ReturnScreen({
  challenge,
  score,
  onAdmire,
  onPlaySandbox,
}: {
  challenge: Challenge | null;
  score: ScoreResult | null;
  onAdmire: () => void;
  onPlaySandbox: () => void;
}) {
  const { h, m, s } = useCountdownToMidnight();
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const [hovered, setHovered] = useState<"admire" | "sandbox" | null>(null);

  return (
    <div
      style={{
        fontFamily: "Space Grotesk, system-ui, sans-serif",
        background: "var(--ps-background)",
        color: "var(--ps-text-primary)",
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2px", marginBottom: "36px" }}>
          <span style={{ fontFamily: "Space Grotesk", fontSize: "28px", fontWeight: 850, letterSpacing: "-0.04em", color: "var(--ps-text-primary)" }}>Prompt</span>
          <span style={{ fontFamily: "Space Grotesk", fontSize: "28px", fontWeight: 300, fontStyle: "italic", letterSpacing: "-0.03em", color: "var(--ps-teal)", paddingRight: "4px" }}>Shot</span>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--ps-amber)", alignSelf: "flex-end", marginBottom: "6px" }} />
        </div>

        {/* Heading */}
        <div style={{ fontSize: "clamp(26px, 7vw, 36px)", fontWeight: 800, color: "var(--ps-text-primary)", lineHeight: 1.15, marginBottom: "14px", letterSpacing: "-0.02em" }}>
          Nice shot, Prompter.
        </div>

        {/* Subtext */}
        <div style={{ fontSize: "15px", color: "var(--ps-text-secondary)", lineHeight: 1.6, marginBottom: "32px", maxWidth: "320px", margin: "0 auto 32px" }}>
          You've already fired today's round.{" "}
          {score && <span><br />You scored <strong style={{ color: "var(--ps-amber)" }}>{score.total}/100</strong>. </span>}<br />Come back tomorrow ~
        </div>

        {/* Badges */}
        {challenge && (
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "32px" }}>
            <span style={{ background: "var(--ps-teal)", color: "#000", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
              {challenge.category}
            </span>
            <span style={{ background: "rgba(245,158,11,0.15)", color: "var(--ps-amber)", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
              {challenge.difficulty}
            </span>
          </div>
        )}

        {/* Primary CTA */}
        <button
          onClick={onAdmire}
          onMouseEnter={() => setHovered("admire")}
          onMouseLeave={() => setHovered(null)}
          style={{
            width: "100%",
            height: "52px",
            background: hovered === "admire" ? "#14B8A6" : "var(--ps-teal)",
            color: "#000",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "28px",
            fontFamily: "Space Grotesk",
            transition: "background 0.15s, transform 0.15s",
            transform: hovered === "admire" ? "scale(1.02)" : "scale(1)",
          }}
        >
          Admire your prompt →
        </button>

        {/* Date + countdown */}
        <div style={{ fontSize: "13px", color: "var(--ps-text-secondary)", lineHeight: 1.8 }}>
          <div style={{ fontWeight: 600, color: "var(--ps-text-primary)" }}>{today}</div>
          <div>Next challenge in <strong>{h}h {m}m {String(s).padStart(2, "0")}s</strong></div>
        </div>
      </div>
    </div>
  );
}
