import type { Challenge } from "../../lib/supabase";
import type { ScoreResult } from "../../lib/scorer";
import { useCountdownToMidnight } from "../../hooks/useCountdownToMidnight";

const SCORE_BAR_TOOLTIPS = {
  Accuracy:
    "Measures how well your prompt captures the required semantic details, meaning, and nuances of the target output.",
  Format:
    "Evaluates whether your prompt correctly enforces structural constraints, length limits, styling, and output type specified in the target.",
  Brevity:
    "Measures prompt efficiency. Shorter prompts receive higher scores (100 pts for <60 chars, scaling down to 20 pts for >300 chars).",
};

export function AlreadyPlayed({
  score,
  challenge,
  personalSavings,
  communitySavings,
}: {
  score: ScoreResult | null;
  challenge: Challenge | null;
  personalSavings: { waterMl: number; co2Grams: number };
  communitySavings: { waterLiters: number; co2Kg: number };
}) {
  const { h, m, s } = useCountdownToMidnight();

  const bars = [
    { label: "Accuracy", value: score?.accuracy ?? 0, tooltip: SCORE_BAR_TOOLTIPS.Accuracy },
    { label: "Format", value: score?.format ?? 0, tooltip: SCORE_BAR_TOOLTIPS.Format },
    { label: "Brevity", value: score?.brevity ?? 0, tooltip: SCORE_BAR_TOOLTIPS.Brevity },
  ];

  return (
    <div
      style={{
        fontFamily: "Space Grotesk, system-ui, sans-serif",
        background: "#0E1E14",
        color: "var(--ps-text-primary)",
        minHeight: "100vh",
        padding: "24px",
        transition: "background 1.5s ease-in-out",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        {/* Logo wordmark */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <span style={{ fontFamily: "Space Grotesk", fontSize: "22px", fontWeight: 850, letterSpacing: "-0.04em", color: "var(--ps-text-primary)" }}>Prompt</span>
            <span style={{ fontFamily: "Space Grotesk", fontSize: "22px", fontWeight: 300, fontStyle: "italic", letterSpacing: "-0.03em", color: "var(--ps-teal)", paddingRight: "4px" }}>Shot</span>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--ps-amber)", alignSelf: "flex-end", marginBottom: "5px" }} />
          </div>
        </div>

        <div style={{ background: "var(--ps-surface)", borderRadius: "16px", padding: "32px" }}>
          {/* Badges */}
          {challenge && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", justifyContent: "center" }}>
              <span style={{ background: "var(--ps-teal)", color: "#000", padding: "4px 12px", borderRadius: "9999px", fontSize: "var(--ps-text-caption)", fontWeight: 600 }}>
                {challenge.category}
              </span>
              <span style={{ background: "rgba(245,158,11,0.15)", color: "var(--ps-amber)", padding: "4px 12px", borderRadius: "9999px", fontSize: "var(--ps-text-caption)", fontWeight: 600 }}>
                {challenge.difficulty}
              </span>
            </div>
          )}

          {/* Total score */}
          <div style={{ fontSize: "var(--ps-text-display)", textAlign: "center", marginBottom: "24px" }}>
            {score ? score.total : "—"}/300
          </div>

          {/* Score bars */}
          {score && (
            <div style={{ marginBottom: "24px" }}>
              {bars.map((item) => (
                <div key={item.label} className="ps-tooltip-container" style={{ marginBottom: "12px" }}>
                  <div className="ps-tooltip-text">{item.tooltip}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "var(--ps-text-secondary-size)" }}>
                    <span style={{ color: "var(--ps-text-secondary)" }}>{item.label} ⓘ</span>
                    <span style={{ color: "var(--ps-text-primary)" }}>{item.value}/100</span>
                  </div>
                  <div style={{ height: "4px", background: "#222", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{ width: `${item.value}%`, height: "100%", background: "var(--ps-amber)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Countdown */}
          <div style={{ fontSize: "14px", color: "#888880", textAlign: "center", marginBottom: "24px" }}>
            Next challenge in {h}h {m}m {String(s).padStart(2, "0")}s
          </div>

          {/* Eco Dashboard */}
          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "24px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "rgba(20, 184, 166, 0.06)", borderLeft: "3px solid var(--ps-teal)", padding: "16px", borderRadius: "8px", textAlign: "left" }}>
              <div style={{ fontFamily: "Space Grotesk", fontSize: "12px", fontWeight: 600, color: "var(--ps-teal)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                Your Lifetime Impact
              </div>
              <div style={{ fontSize: "14px", color: "var(--ps-text-primary)", fontWeight: 500 }}>
                💧 {personalSavings.waterMl >= 1000 ? `${(personalSavings.waterMl / 1000).toFixed(2)}L` : `${personalSavings.waterMl}ml`}{" "}water saved
              </div>
              <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginTop: "2px" }}>
                🌲 {personalSavings.co2Grams >= 1000 ? `${(personalSavings.co2Grams / 1000).toFixed(2)}kg` : `${personalSavings.co2Grams.toFixed(2)}g`}{" "}CO₂ prevented
              </div>
            </div>

            <div style={{ background: "rgba(20, 184, 166, 0.06)", borderLeft: "3px solid var(--ps-teal)", padding: "16px", borderRadius: "8px", textAlign: "left" }}>
              <div style={{ fontFamily: "Space Grotesk", fontSize: "12px", fontWeight: 600, color: "var(--ps-teal)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                Community Impact
              </div>
              <div style={{ fontSize: "14px", color: "var(--ps-text-primary)", fontWeight: 500 }}>
                💧 {communitySavings.waterLiters.toLocaleString(undefined, { maximumFractionDigits: 1 })}L{" "}water saved
              </div>
              <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginTop: "2px" }}>
                🌲 {communitySavings.co2Kg.toLocaleString(undefined, { maximumFractionDigits: 1 })}kg{" "}CO₂ prevented
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
