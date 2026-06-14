import type { ScoreResult } from "../../lib/scorer";
import { WaterGlass } from "../components/WaterGlass";
import { getScoreLabel, getWaterComparison } from "../../lib/gameUtils";

interface ResultsScreenProps {
  score: ScoreResult;
  gameState: string;
  animateScore: boolean;
  showAutoIdeal: boolean;
  idealPrompt: string;
  personalSavings: { waterMl: number; co2Grams: number };
  communitySavings: { waterLiters: number; co2Kg: number };
  onShare: () => void;
  onBackToMenu: () => void;
}

const SCORE_BAR_TOOLTIPS = {
  Accuracy: "Measures how well your prompt captures the required semantic details, meaning, and nuances of the target output.",
  Format: "Evaluates whether your prompt correctly enforces structural constraints, length limits, styling, and output type specified in the target.",
  Brevity: "Measures prompt efficiency. Shorter prompts receive higher scores (100 pts for <60 chars, scaling down to 20 pts for >300 chars).",
};

export function ResultsScreen({
  score,
  gameState,
  animateScore,
  showAutoIdeal,
  idealPrompt,
  isSandboxMode,
  personalSavings,
  communitySavings,
  onShare,
  onTryAgain,
  onBackToMenu,
}: ResultsScreenProps) {
  const bars = [
    { label: "Accuracy", value: score.accuracy, tooltip: SCORE_BAR_TOOLTIPS.Accuracy, r: 85 },
    { label: "Format", value: score.format, tooltip: SCORE_BAR_TOOLTIPS.Format, r: 60 },
    { label: "Brevity", value: score.brevity, tooltip: SCORE_BAR_TOOLTIPS.Brevity, r: 35 },
  ];

  return (
    <>
      {/* Bullseye rings SVG */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ margin: "0 auto" }}>
          {bars.map(({ label, value, r }, i) => (
            <g key={label}>
              <circle cx="100" cy="100" r={r} fill="none" stroke="#222" strokeWidth="12" />
              <circle
                cx="100" cy="100" r={r}
                fill="none" stroke="var(--ps-amber)" strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * r}`}
                strokeDashoffset={`${2 * Math.PI * r * (1 - value / 100)}`}
                transform="rotate(-90 100 100)"
                style={{ transition: animateScore ? `stroke-dashoffset 0.8s ease-out ${i * 0.2}s` : "none" }}
              >
                <title>{label}: {value}/100</title>
              </circle>
            </g>
          ))}
          <text x="100" y="95" textAnchor="middle" fill="var(--ps-text-primary)" fontSize="40" fontWeight="600">{score.total}</text>
          <text x="100" y="115" textAnchor="middle" fill="var(--ps-text-secondary)" fontSize="20">/300</text>
        </svg>
        <div style={{ fontSize: "var(--ps-text-subhead)", color: "var(--ps-amber)", marginTop: "16px", fontWeight: 600 }}>
          {getScoreLabel(score.total)}
        </div>
      </div>

      {/* Score bars */}
      <div style={{ marginBottom: "24px" }}>
        {bars.map((item) => (
          <div key={item.label} className="ps-tooltip-container" style={{ marginBottom: "12px" }}>
            <div className="ps-tooltip-text">{item.tooltip}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "var(--ps-text-secondary-size)" }}>
              <span style={{ color: "var(--ps-text-secondary)" }}>{item.label} ⓘ</span>
              <span style={{ color: "var(--ps-text-primary)" }}>{item.value}/100</span>
            </div>
            <div style={{ height: "4px", background: "#222", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ width: `${item.value}%`, height: "100%", background: "var(--ps-amber)", transition: animateScore ? "width 0.6s ease-out" : "none" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Impact card */}
      {gameState === "impact" && (
        <div
          style={{
            background: "rgba(20, 184, 166, 0.12)",
            borderLeft: "4px solid var(--ps-teal)",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "24px",
            animation: "slideUp 0.6s ease-out forwards",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }`}</style>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontFamily: "Space Grotesk", fontSize: "18px", fontWeight: 700, color: "var(--ps-teal)", letterSpacing: "0.02em" }}>
              Did you know? 🌍
            </div>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6", color: "var(--ps-text-primary)" }}>
              Every time we ask AI a question, massive computer servers work in the background to generate answers. This process consumes electricity and requires fresh water to cool the hot servers down.
            </p>

            {/* Water usage row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.05)", marginTop: "4px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", color: "var(--ps-text-primary)", fontWeight: 600, marginBottom: "6px" }}>Your prompt used:</div>
                <div style={{ fontSize: "14px", color: "var(--ps-teal)", fontWeight: 700 }}>💧 {score.waterMl}ml of water</div>
                <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginTop: "4px" }}>({getWaterComparison(score.waterMl)})</div>
                <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginTop: "2px" }}>🌲 ≈ {score.co2Grams.toFixed(2)}g of CO₂ generated</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <WaterGlass waterMl={score.waterMl} />
                <span style={{ fontSize: "11px", color: "var(--ps-text-secondary)", fontWeight: 600 }}>{score.waterMl}ml</span>
              </div>
            </div>

            {/* Score quality message */}
            {score.total < 180 ? (
              <div style={{ background: "rgba(245, 158, 11, 0.05)", borderLeft: "3px solid var(--ps-amber)", padding: "12px 14px", borderRadius: "6px", marginTop: "4px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--ps-amber)", marginBottom: "4px" }}>Why a higher score matters:</div>
                <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", lineHeight: "1.5" }}>
                  A lower accuracy/format score means you would typically need 3+ follow-up corrections. Retrying multiplies your footprint by another tablespoon or more!
                </div>
              </div>
            ) : (
              <div style={{ background: "rgba(20, 184, 166, 0.05)", borderLeft: "3px solid var(--ps-teal)", padding: "12px 14px", borderRadius: "6px", marginTop: "4px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--ps-teal)", marginBottom: "4px" }}>Excellent "One-Shot" Prompt!</div>
                <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", lineHeight: "1.5" }}>
                  By writing a precise instruction, you got the target output on the first try. This prevented extra retries and saved precious water!
                </div>
              </div>
            )}
          </div>

          {/* Eco savings grid */}
          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
              <div>
                <div style={{ fontFamily: "Space Grotesk", fontSize: "11px", fontWeight: 600, color: "var(--ps-teal)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Lifetime Savings</div>
                <div style={{ fontSize: "13px", color: "var(--ps-text-primary)", fontWeight: 500 }}>
                  💧 {personalSavings.waterMl >= 1000 ? `${(personalSavings.waterMl / 1000).toFixed(2)}L` : `${personalSavings.waterMl}ml`}
                </div>
                <div style={{ fontSize: "11px", color: "var(--ps-text-secondary)" }}>
                  🌲 {personalSavings.co2Grams >= 1000 ? `${(personalSavings.co2Grams / 1000).toFixed(2)}kg` : `${personalSavings.co2Grams.toFixed(1)}g`} CO₂
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "Space Grotesk", fontSize: "11px", fontWeight: 600, color: "var(--ps-teal)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Community Savings</div>
                <div style={{ fontSize: "13px", color: "var(--ps-text-primary)", fontWeight: 500 }}>
                  💧 {communitySavings.waterLiters.toLocaleString(undefined, { maximumFractionDigits: 1 })}L
                </div>
                <div style={{ fontSize: "11px", color: "var(--ps-text-secondary)" }}>
                  🌲 {communitySavings.co2Kg.toLocaleString(undefined, { maximumFractionDigits: 1 })}kg CO₂
                </div>
              </div>
            </div>
            <div style={{ fontSize: "var(--ps-text-caption)", color: "var(--ps-text-secondary)", fontStyle: "italic", marginTop: "8px" }}>
              Better prompts = less AI = less water. This is the skill.
            </div>
          </div>
        </div>
      )}

      {/* Ideal prompt reveal */}
      {showAutoIdeal && idealPrompt && (
        <div style={{ marginBottom: "24px", animation: "slideUp 0.4s ease-out" }}>
          <div style={{ fontSize: "14px", color: "#888880", marginBottom: "12px" }}>Here's what a strong prompt looks like</div>
          <div
            style={{
              background: "#141414",
              borderLeft: "4px solid #14B8A6",
              borderRadius: "8px",
              padding: "16px",
              fontFamily: "var(--ps-font-mono)",
              fontSize: "14px",
              color: "#F0EFE8",
              lineHeight: "1.6",
            }}
          >
            {idealPrompt}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "16px" }}>
        <button
          onClick={onShare}
          style={{ width: "100%", height: "48px", background: "var(--ps-amber)", border: "none", color: "#000", borderRadius: "8px", fontSize: "var(--ps-text-secondary-size)", fontWeight: 600, cursor: "pointer" }}
        >
          Share result
        </button>
      </div>
    </>
  );
}
