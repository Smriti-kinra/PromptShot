import type { ScoreResult } from "../../lib/scorer";
import { WaterGlass } from "../components/WaterGlass";
import { getScoreLabel, getWaterComparison } from "../../lib/gameUtils";

interface ResultsScreenProps {
  score: ScoreResult;
  gameState: string;
  animateScore: boolean;
  showAutoIdeal: boolean;
  idealPrompt: string;
  userPrompt: string;
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

// ── Per-dimension coaching ────────────────────────────────────────────────────
function getScoreFeedback(
  accuracy: number,
  format: number,
  brevity: number,
): { label: string; tip: string; dim: string } {
  const LOW = 50;
  const MID = 75;

  const weakest =
    accuracy <= format && accuracy <= brevity
      ? "accuracy"
      : format <= brevity
        ? "format"
        : "brevity";

  if (weakest === "accuracy") {
    if (accuracy < LOW)
      return {
        dim: "Accuracy",
        label: "Critical: Meaning missed",
        tip: 'Your prompt didn\'t capture the core content. Add an explicit task verb (e.g. "Write", "List", "Explain") and name the specific subject the output must cover.',
      };
    if (accuracy < MID)
      return {
        dim: "Accuracy",
        label: "Tip: Add missing details",
        tip: "Your prompt got the gist but lost important nuances. Specify the key details, constraints, or examples that the target output depends on.",
      };
  }

  if (weakest === "format") {
    if (format < LOW)
      return {
        dim: "Format",
        label: "Critical: No structure specified",
        tip: 'Your prompt gave no formatting instructions. Tell the AI the exact output shape — e.g. "as a numbered list", "in a markdown table", "in 3 sentences", or "as a JSON object".',
      };
    if (format < MID)
      return {
        dim: "Format",
        label: "Tip: Tighten your format constraints",
        tip: "Your prompt hinted at structure but wasn't precise enough. Specify length limits, required section order, or explicit output types to lock in the shape.",
      };
  }

  if (weakest === "brevity") {
    if (brevity < LOW)
      return {
        dim: "Brevity",
        label: "Tip: Your prompt is too long",
        tip: "Remove background context the AI already knows, cut filler phrases, and consolidate overlapping constraints. Every unnecessary word increases compute cost.",
      };
    if (brevity < MID)
      return {
        dim: "Brevity",
        label: "Tip: Trim further",
        tip: 'You\'re close. Replace multi-word explanations with single precise terms — e.g. "formal tone" instead of "make it sound professional and business-like".',
      };
  }

  return {
    dim: "All",
    label: "Well-crafted prompt",
    tip: "Strong across all three dimensions. Your prompt was clear, structured, and efficient — exactly what one-shot prompting looks like.",
  };
}

// ── Word-level diff between user prompt and ideal prompt ─────────────────────
// Produces a sequence of { text, type } tokens for rendering.
type DiffToken = { text: string; type: "same" | "removed" | "added" };

function computeWordDiff(userText: string, idealText: string): DiffToken[] {
  const userWords = userText.trim().split(/\s+/);
  const idealWords = idealText.trim().split(/\s+/);

  // Longest Common Subsequence (LCS) on words
  const m = userWords.length;
  const n = idealWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (userWords[i - 1].toLowerCase() === idealWords[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to produce aligned tokens
  const tokens: DiffToken[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && userWords[i - 1].toLowerCase() === idealWords[j - 1].toLowerCase()) {
      tokens.unshift({ text: userWords[i - 1], type: "same" });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.unshift({ text: idealWords[j - 1], type: "added" });
      j--;
    } else {
      tokens.unshift({ text: userWords[i - 1], type: "removed" });
      i--;
    }
  }

  return tokens;
}

function PromptDiff({
  userPrompt,
  idealPrompt,
}: {
  userPrompt: string;
  idealPrompt: string;
}) {
  const tokens = computeWordDiff(userPrompt, idealPrompt);
  const hasRemovals = tokens.some((t) => t.type === "removed");
  const hasAdditions = tokens.some((t) => t.type === "added");

  if (!hasRemovals && !hasAdditions) {
    return (
      <div style={{ fontSize: "13px", color: "var(--ps-text-secondary)", fontStyle: "italic" }}>
        Your prompt matched the ideal almost exactly.
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "10px",
          fontSize: "11px",
          fontFamily: "var(--ps-font-mono)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {hasRemovals && (
          <span style={{ color: "var(--ps-red)" }}>− words you wrote that weren't needed</span>
        )}
        {hasAdditions && (
          <span style={{ color: "var(--ps-teal)" }}>+ words the ideal added</span>
        )}
      </div>

      {/* Diff view — yours */}
      <div
        style={{
          background: "rgba(255, 95, 95, 0.04)",
          border: "1px solid rgba(255,95,95,0.15)",
          borderRadius: "6px",
          padding: "10px 12px",
          marginBottom: "6px",
          fontFamily: "var(--ps-font-mono)",
          fontSize: "13px",
          lineHeight: "1.7",
          color: "var(--ps-text-primary)",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            color: "var(--ps-text-secondary)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            display: "block",
            marginBottom: "6px",
          }}
        >
          Yours
        </span>
        {tokens
          .filter((t) => t.type !== "added")
          .map((t, idx) => (
            <span
              key={idx}
              style={{
                background:
                  t.type === "removed" ? "rgba(255,95,95,0.18)" : "transparent",
                color:
                  t.type === "removed" ? "var(--ps-red)" : "var(--ps-text-primary)",
                textDecoration: t.type === "removed" ? "line-through" : "none",
                marginRight: "4px",
                borderRadius: "3px",
                padding: t.type === "removed" ? "0 2px" : "0",
              }}
            >
              {t.text}
            </span>
          ))}
      </div>

      {/* Diff view — ideal */}
      <div
        style={{
          background: "rgba(20, 184, 166, 0.04)",
          border: "1px solid rgba(20,184,166,0.2)",
          borderRadius: "6px",
          padding: "10px 12px",
          fontFamily: "var(--ps-font-mono)",
          fontSize: "13px",
          lineHeight: "1.7",
          color: "var(--ps-text-primary)",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            color: "var(--ps-text-secondary)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            display: "block",
            marginBottom: "6px",
          }}
        >
          Ideal
        </span>
        {tokens
          .filter((t) => t.type !== "removed")
          .map((t, idx) => (
            <span
              key={idx}
              style={{
                background:
                  t.type === "added" ? "rgba(20,184,166,0.15)" : "transparent",
                color:
                  t.type === "added" ? "var(--ps-teal)" : "var(--ps-text-primary)",
                fontWeight: t.type === "added" ? 600 : 400,
                marginRight: "4px",
                borderRadius: "3px",
                padding: t.type === "added" ? "0 3px" : "0",
              }}
            >
              {t.text}
            </span>
          ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ResultsScreen({
  score,
  gameState,
  animateScore,
  showAutoIdeal,
  idealPrompt,
  userPrompt,
  personalSavings,
  communitySavings,
  onShare,
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

      {/* Per-dimension coaching feedback */}
      {(() => {
        const fb = getScoreFeedback(score.accuracy, score.format, score.brevity);
        const allGood = fb.dim === "All";
        const accentColor = allGood ? "var(--ps-teal)" : "var(--ps-amber)";
        const bgColor = allGood ? "rgba(20, 184, 166, 0.06)" : "rgba(245, 158, 11, 0.06)";
        const borderColor = allGood ? "var(--ps-teal)" : "var(--ps-amber)";
        return (
          <div style={{ background: bgColor, borderLeft: `3px solid ${borderColor}`, borderRadius: "8px", padding: "12px 14px", marginBottom: "24px" }}>
            <div style={{ fontSize: "var(--ps-text-caption)", fontWeight: 700, color: accentColor, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--ps-font-mono)" }}>
              {allGood ? "✓" : "→"} {fb.label}
            </div>
            <div style={{ fontSize: "13px", color: "var(--ps-text-secondary)", lineHeight: "1.55" }}>
              {fb.tip}
            </div>
          </div>
        );
      })()}

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
            <div style={{ fontFamily: "var(--ps-font-ui)", fontSize: "18px", fontWeight: 700, color: "var(--ps-teal)", letterSpacing: "0.02em" }}>
              Did you know? 🌍
            </div>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6", color: "var(--ps-text-primary)" }}>
              Every time we ask AI a question, massive computer servers work in the background to generate answers. This process consumes electricity and requires fresh water to cool the hot servers down.
            </p>

            {/* Water usage row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", marginTop: "4px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", color: "var(--ps-text-primary)", fontWeight: 600, marginBottom: "6px" }}>Your prompt used approximately:</div>
                <div style={{ fontSize: "14px", color: "var(--ps-teal)", fontWeight: 700 }}>💧 ~{score.waterMl}ml of water</div>
                <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginTop: "4px" }}>({getWaterComparison(score.waterMl)})</div>
                <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginTop: "2px" }}>🌲 ~{score.co2Grams.toFixed(2)}g of CO₂ generated</div>
                {/* Source citation */}
                <div style={{ fontSize: "10px", color: "var(--ps-text-muted)", marginTop: "8px", lineHeight: "1.4", fontStyle: "italic" }}>
                  Estimates based on Li et al., "Making AI Less Thirsty," UC Riverside 2023. Values are approximations; real usage varies by data center and model.
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <WaterGlass waterMl={score.waterMl} />
                <span style={{ fontSize: "11px", color: "var(--ps-text-secondary)", fontWeight: 600 }}>~{score.waterMl}ml</span>
              </div>
            </div>

            {/* Score quality message */}
            {score.total < 180 ? (
              <div style={{ background: "rgba(245,158,11,0.05)", borderLeft: "3px solid var(--ps-amber)", padding: "12px 14px", borderRadius: "6px", marginTop: "4px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--ps-amber)", marginBottom: "4px" }}>Why a higher score matters:</div>
                <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", lineHeight: "1.5" }}>
                  A lower accuracy/format score means you would typically need 3+ follow-up corrections. Retrying multiplies your footprint by another tablespoon or more!
                </div>
              </div>
            ) : (
              <div style={{ background: "rgba(20,184,166,0.05)", borderLeft: "3px solid var(--ps-teal)", padding: "12px 14px", borderRadius: "6px", marginTop: "4px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--ps-teal)", marginBottom: "4px" }}>Excellent "One-Shot" Prompt!</div>
                <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", lineHeight: "1.5" }}>
                  By writing a precise instruction, you got the target output on the first try. This prevented extra retries and saved precious water!
                </div>
              </div>
            )}
          </div>

          {/* Eco savings grid */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
              <div>
                <div style={{ fontFamily: "var(--ps-font-ui)", fontSize: "11px", fontWeight: 600, color: "var(--ps-teal)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Lifetime Savings</div>
                <div style={{ fontSize: "13px", color: "var(--ps-text-primary)", fontWeight: 500 }}>
                  💧 {personalSavings.waterMl >= 1000 ? `~${(personalSavings.waterMl / 1000).toFixed(2)}L` : `~${personalSavings.waterMl}ml`}
                </div>
                <div style={{ fontSize: "11px", color: "var(--ps-text-secondary)" }}>
                  🌲 ~{personalSavings.co2Grams >= 1000 ? `${(personalSavings.co2Grams / 1000).toFixed(2)}kg` : `${personalSavings.co2Grams.toFixed(1)}g`} CO₂
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--ps-font-ui)", fontSize: "11px", fontWeight: 600, color: "var(--ps-teal)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Community Savings</div>
                <div style={{ fontSize: "13px", color: "var(--ps-text-primary)", fontWeight: 500 }}>
                  💧 ~{communitySavings.waterLiters.toLocaleString(undefined, { maximumFractionDigits: 1 })}L
                </div>
                <div style={{ fontSize: "11px", color: "var(--ps-text-secondary)" }}>
                  🌲 ~{communitySavings.co2Kg.toLocaleString(undefined, { maximumFractionDigits: 1 })}kg CO₂
                </div>
              </div>
            </div>
            <div style={{ fontSize: "var(--ps-text-caption)", color: "var(--ps-text-secondary)", fontStyle: "italic", marginTop: "8px" }}>
              Better prompts = less AI = less water. This is the skill.
            </div>
          </div>
        </div>
      )}

      {/* Ideal prompt reveal — with word diff */}
      {showAutoIdeal && idealPrompt && (
        <div style={{ marginBottom: "24px", animation: "slideUp 0.4s ease-out" }}>
          <div style={{ fontSize: "14px", color: "var(--ps-text-secondary)", marginBottom: "12px" }}>
            Here's what a strong prompt looks like — and how yours differed:
          </div>
          {userPrompt.trim() ? (
            <PromptDiff userPrompt={userPrompt} idealPrompt={idealPrompt} />
          ) : (
            <div
              style={{
                background: "#141414",
                borderLeft: "4px solid var(--ps-teal)",
                borderRadius: "8px",
                padding: "16px",
                fontFamily: "var(--ps-font-mono)",
                fontSize: "14px",
                color: "var(--ps-text-primary)",
                lineHeight: "1.6",
              }}
            >
              {idealPrompt}
            </div>
          )}
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
