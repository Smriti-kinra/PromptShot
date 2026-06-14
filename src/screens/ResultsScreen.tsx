import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import type { ScoreResult } from "../lib/scorer";
import type { Challenge } from "../lib/supabase";
import { WaterGlass } from "../components/WaterGlass";
import { getScoreLabel, getWaterComparison } from "../lib/gameUtils";
import { mockScore } from "../lib/scorer";
import { T } from "../styles/tokens";
import { PromptDiff } from "../components/PromptDiff";

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
  challenge?: Challenge | null;
}

const SCORE_BAR_TOOLTIPS = {
  Accuracy: "Measures semantic similarity (40 pts) and keyword coverage (10 pts) against the target output.",
  Format: "Evaluates whether your prompt correctly enforces structural constraints, length limits, styling, and output type (20 pts).",
  Brevity: "Measures green efficiency: token economy (15 pts) and latency/speed of execution (15 pts).",
};

// ── Per-dimension coaching ────────────────────────────────────────────────────
function getScoreFeedback(
  accuracy: number,
  format: number,
  brevity: number,
): { label: string; tip: string; dim: string } {
  const accPct = (accuracy / 50) * 100;
  const fmtPct = (format / 20) * 100;
  const brePct = (brevity / 30) * 100;

  const weakest =
    accPct <= fmtPct && accPct <= brePct
      ? "accuracy"
      : fmtPct <= brePct
        ? "format"
        : "brevity";

  if (weakest === "accuracy") {
    if (accPct < 50)
      return {
        dim: "Accuracy",
        label: "Critical: Meaning missed",
        tip: 'Your prompt didn\'t capture the core content. Add an explicit task verb (e.g. "Write", "List", "Explain") and name the specific subject the output must cover.',
      };
    if (accPct < 75)
      return {
        dim: "Accuracy",
        label: "Tip: Add missing details",
        tip: "Your prompt got the gist but lost important nuances. Specify the key details, constraints, or examples that the target output depends on.",
      };
  }

  if (weakest === "format") {
    if (fmtPct < 50)
      return {
        dim: "Format",
        label: "Critical: No structure specified",
        tip: 'Your prompt gave no formatting instructions. Tell the AI the exact output shape — e.g. "as a numbered list", "in a markdown table", "in 3 sentences", or "as a JSON object".',
      };
    if (fmtPct < 75)
      return {
        dim: "Format",
        label: "Tip: Tighten your format constraints",
        tip: "Your prompt hinted at structure but wasn't precise enough. Specify length limits, required section order, or explicit output types to lock in the shape.",
      };
  }

  if (weakest === "brevity") {
    if (brePct < 50)
      return {
        dim: "Brevity",
        label: "Tip: Your prompt is too long/inefficient",
        tip: "Remove background context the AI already knows, cut filler phrases, and consolidate overlapping constraints. Every unnecessary word increases compute cost.",
      };
    if (brePct < 75)
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
  challenge,
}: ResultsScreenProps) {
  const bars = [
    { label: "Accuracy", value: score.accuracy, max: 50, tooltip: SCORE_BAR_TOOLTIPS.Accuracy, r: 85 },
    { label: "Format", value: score.format, max: 20, tooltip: SCORE_BAR_TOOLTIPS.Format, r: 60 },
    { label: "Brevity", value: score.brevity, max: 30, tooltip: SCORE_BAR_TOOLTIPS.Brevity, r: 35 },
  ];
  // calculation modal removed; comparison shown inline
  const [playRings, setPlayRings] = useState(false);
  const [didYouKnowOpen, setDidYouKnowOpen] = useState(false);

  useEffect(() => {
    // trigger ring animations shortly after mount when `animateScore` is true
    if (animateScore) {
      const t = setTimeout(() => setPlayRings(true), 80);
      return () => clearTimeout(t);
    } else {
      setPlayRings(false);
    }
  }, [animateScore, score.total]);
  useEffect(() => {
    if (animateScore && score.total >= 80) {
      const duration = 1.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#F59E0B", "#14B8A6", "#6EE09B"]
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#F59E0B", "#14B8A6", "#6EE09B"]
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [animateScore, score.total]);

  return (
    <>
      {/* Wordmark / Logo on top */}
      <div style={{ marginBottom: "18px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: T.font, fontSize: 20, fontWeight: 800, color: T.primary, letterSpacing: "-0.02em" }}>Prompt</span>
          <span style={{ fontFamily: T.font, fontSize: 20, fontWeight: 300, fontStyle: "italic", color: T.mint, paddingRight: "2px" }}>Shot</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.amber, marginLeft: 6 }} />
        </div>
      </div>
      {/* Bullseye rings SVG */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ margin: "0 auto" }}>
          {bars.map(({ label, value, max, r }, i) => {
            const circumference = 2 * Math.PI * r;
            const targetOffset = circumference * (1 - value / max);
            const initialOffset = circumference; // hide initially
            return (
              <g key={label}>
                <circle cx="100" cy="100" r={r} fill="none" stroke="#222" strokeWidth="12" />
                <circle
                  cx="100" cy="100" r={r}
                  fill="none" stroke="var(--ps-amber)" strokeWidth="12"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={playRings ? `${targetOffset}` : `${initialOffset}`}
                  transform="rotate(-90 100 100)"
                  style={{ transition: `stroke-dashoffset 0.8s ease-out ${i * 0.18}s` }}
                >
                  <title>{label}: {value}/{max}</title>
                </circle>
              </g>
            );
          })}
          <text x="100" y="95" textAnchor="middle" fill="var(--ps-text-primary)" fontSize="40" fontWeight="600">{score.total}</text>
          <text x="100" y="115" textAnchor="middle" fill="var(--ps-text-secondary)" fontSize="20">/100</text>
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
              <span style={{ color: "var(--ps-text-primary)" }}>{item.value}/{item.max}</span>
            </div>
            <div style={{ height: "4px", background: "#222", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ width: `${(item.value / item.max) * 100}%`, height: "100%", background: "var(--ps-amber)", transition: animateScore ? "width 0.6s ease-out" : "none" }} />
            </div>
          </div>
        ))}
      </div>

      

      {/* Impact card */}
      {gameState === "impact" && (
        <div
          className="ps-glass-panel"
          style={{
            background: "rgba(20, 184, 166, 0.04)",
            borderLeft: "4px solid var(--ps-teal)",
            borderColor: "rgba(20, 184, 166, 0.15)",
            padding: "24px",
            marginBottom: "24px",
            animation: "slideUp 0.6s ease-out forwards",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }`}</style>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", cursor: "pointer" }} onClick={() => setDidYouKnowOpen(d => !d)}>
              <div style={{ fontFamily: "var(--ps-font-ui)", fontSize: "18px", fontWeight: 700, color: "var(--ps-teal)", letterSpacing: "0.02em" }}>
                Did you know? 🌍
              </div>
            </div>
            {/* Motivation paragraph moved to FAQ */}

            {didYouKnowOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", marginTop: "4px" }}>
                  <div style={{ flex: 1 }}>
                    {idealPrompt ? (
                      (() => {
                        const ideal = mockScore(idealPrompt, (challenge && (challenge as any).target_output) || "");
                        const diff = score.waterMl - ideal.waterMl;
                        const diffSign = diff >= 0 ? "+" : "-";
                        const absDiff = Math.abs(diff);
                        return (
                          <div>
                            <div style={{ fontSize: "13px", color: "var(--ps-text-secondary)", marginBottom: 6 }}>Ideal prompt would use approximately:</div>
                            <div style={{ fontSize: "14px", color: "var(--ps-teal)", fontWeight: 700 }}>💧 ~{ideal.waterMl}ml</div>
                            <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginTop: 8 }}>Your prompt used: <span style={{ color: "var(--ps-teal)", fontWeight: 700 }}>~{score.waterMl}ml</span></div>
                            <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginTop: 8 }}>Difference: <span style={{ color: "var(--ps-amber)", fontWeight: 700 }}>{diffSign}{absDiff}ml</span></div>
                          </div>
                        );
                      })()
                    ) : (
                      <div style={{ fontSize: "13px", color: "var(--ps-text-secondary)" }}>No ideal prompt available for this challenge.</div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minWidth: 120 }}>
                    {idealPrompt ? (
                      (() => {
                        const ideal = mockScore(idealPrompt, (challenge && (challenge as any).target_output) || "");
                        return (
                          <>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginBottom: 6 }}>Ideal</div>
                              <WaterGlass waterMl={ideal.waterMl} />
                              <div style={{ fontSize: "11px", color: "var(--ps-text-secondary)", fontWeight: 600 }}>~{ideal.waterMl}ml</div>
                            </div>
                            <div style={{ height: 8 }} />
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginBottom: 6 }}>You</div>
                              <WaterGlass waterMl={score.waterMl} />
                              <div style={{ fontSize: "11px", color: "var(--ps-text-secondary)", fontWeight: 600 }}>~{score.waterMl}ml</div>
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <div style={{ textAlign: "center" }}>
                        <WaterGlass waterMl={score.waterMl} />
                        <div style={{ fontSize: "11px", color: "var(--ps-text-secondary)", fontWeight: 600 }}>~{score.waterMl}ml</div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: "var(--ps-text-caption)", color: "var(--ps-text-secondary)", fontStyle: "italic", marginTop: "8px" }}>
                  Better prompts = less AI = less water.
                </div>
              </div>
            )}
          </div>

          {/* lifetime/community savings removed; concise footer */}
          <div style={{ fontSize: "var(--ps-text-caption)", color: "var(--ps-text-secondary)", fontStyle: "italic", marginTop: "8px" }}>
            Better prompts = less AI = less water.
          </div>
        </div>
      )}

      {/* Calculation modal removed — inline comparison shown in the card above */}

      {/* Challenge question (after Did you know) */}
      {challenge && (
        <div style={{ marginBottom: "18px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginBottom: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--ps-font-mono)" }}>
            Challenge
          </div>
          <div style={{ background: "#141414", borderLeft: "4px solid var(--ps-border)", borderRadius: "8px", padding: "12px", fontFamily: "var(--ps-font-mono)", fontSize: "14px", color: "var(--ps-text-primary)", lineHeight: "1.5" }}>
            {challenge.target_output}
          </div>
        </div>
      )}

      {/* Per-dimension coaching feedback (critical review) */}
      {(() => {
        const fb = getScoreFeedback(score.accuracy, score.format, score.brevity);
        const allGood = fb.dim === "All";
        const accentColor = allGood ? "var(--ps-teal)" : "var(--ps-amber)";
        const borderColor = allGood ? "var(--ps-teal)" : "var(--ps-amber)";
        return (
          <div className={allGood ? "ps-glass-panel" : "ps-glass-panel-amber"} style={{ borderLeft: `4px solid ${borderColor}`, padding: "16px 20px", marginBottom: "24px", borderRadius: "12px" }}>
            <div style={{ fontSize: "var(--ps-text-caption)", fontWeight: 700, color: accentColor, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--ps-font-mono)" }}>
              {allGood ? "✓" : "→"} {fb.label}
            </div>
            <div style={{ fontSize: "13px", color: "var(--ps-text-secondary)", lineHeight: "1.55" }}>
              {fb.tip}
            </div>
          </div>
        );
      })()}

      {/* Ideal prompt reveal — with word diff */}
      {showAutoIdeal && idealPrompt && (
        <div style={{ marginBottom: "24px", animation: "slideUp 0.4s ease-out" }}>
          
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
