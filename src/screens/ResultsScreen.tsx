import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import type { ScoreResult } from "../lib/scorer";
import type { Challenge } from "../lib/supabase";
import { WaterGlass } from "../components/WaterGlass";
import { getScoreLabel, getWaterComparison } from "../lib/gameUtils";
import { mockScore } from "../lib/scorer";
import { T } from "../styles/tokens";
import { PromptDiff } from "../components/PromptDiff";
import { computeWordDiff } from "../lib/diff";

interface ResultsScreenProps {
  score: ScoreResult;
  gameState: string;
  animateScore: boolean;
  showAutoIdeal: boolean;
  idealPrompt: string;
  userPrompt: string;
  personalSavings: { waterMl: number };
  communitySavings: { waterLiters: number };
  onShare: () => void;
  onBackToMenu: () => void;
  challenge?: Challenge | null;
}

const SCORE_BAR_TOOLTIPS = {
  Accuracy: "Measures semantic similarity (40 pts) and keyword coverage (10 pts) against the target output.",
  Format: "Evaluates whether your prompt correctly enforces structural constraints, length limits, styling, and output type (20 pts).",
  Brevity: "Measures green efficiency: token economy (15 pts) and latency/speed of execution (15 pts).",
};

// ── Shared stagger helper ─────────────────────────────────────────────────────
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay },
  };
}

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
        label: "REVIEW: Meaning missed",
        tip: 'Your prompt didn\'t capture the core content. Add an explicit task verb (e.g. "Write", "List", "Explain") and name the specific subject the output must cover.',
      };
    if (accPct < 75)
      return {
        dim: "Accuracy",
        label: "REVIEW: Add missing details",
        tip: "Your prompt got the gist but lost important nuances. Specify the key details, constraints, or examples that the target output depends on.",
      };
  }

  if (weakest === "format") {
    if (fmtPct < 50)
      return {
        dim: "Format",
        label: "REVIEW: No structure specified",
        tip: 'Your prompt gave no formatting instructions. Tell the AI the exact output shape — e.g. "as a numbered list", "in a markdown table", "in 3 sentences", or "as a JSON object".',
      };
    if (fmtPct < 75)
      return {
        dim: "Format",
        label: "REVIEW: Tighten your format constraints",
        tip: "Your prompt hinted at structure but wasn't precise enough. Specify length limits, required section order, or explicit output types to lock in the shape.",
      };
  }

  if (weakest === "brevity") {
    if (brePct < 50)
      return {
        dim: "Brevity",
        label: "REVIEW: Your prompt is too long/inefficient",
        tip: "Remove background context the AI already knows, cut filler phrases, and consolidate overlapping constraints. Every unnecessary word increases compute cost.",
      };
    if (brePct < 75)
      return {
        dim: "Brevity",
        label: "REVIEW: Trim further",
        tip: 'You\'re close. Replace multi-word explanations with single precise terms — e.g. "formal tone" instead of "make it sound professional and business-like".',
      };
  }

  return {
    dim: "All",
    label: "REVIEW: Well-crafted prompt",
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
  const [playRings, setPlayRings] = useState(false);

  const diffTokens = userPrompt && idealPrompt ? computeWordDiff(userPrompt, idealPrompt) : [];
  const hasRemovals = diffTokens.some((t) => t.type === "removed");
  const hasAdditions = diffTokens.some((t) => t.type === "added");
  const isIdeal = diffTokens.length > 0 && !hasRemovals && !hasAdditions;

  useEffect(() => {
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
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#F59E0B", "#0EA79A", "#6EE09B"] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#F59E0B", "#0EA79A", "#6EE09B"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [animateScore, score.total]);

  return (
    <>
      {/* ── Wordmark ── */}
      <motion.div {...fadeUp(0)} style={{ marginBottom: "18px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: T.font, fontSize: 20, fontWeight: 800, color: T.primary, letterSpacing: "-0.02em" }}>Prompt</span>
          <span style={{ fontFamily: T.font, fontSize: 20, fontWeight: 300, fontStyle: "italic", color: T.mint, paddingRight: "2px" }}>Shot</span>
          <span className="ps-wordmark-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: T.amber, marginLeft: 6 }} />
        </div>
      </motion.div>

      {/* ── Bullseye rings ── */}
      <motion.div {...fadeUp(0.05)} style={{ textAlign: "center", marginBottom: "32px" }}>
          <svg className="ps-bullseye-svg" viewBox="0 0 200 200" style={{ margin: "0 auto" }}>
          {bars.map(({ label, value, max, r }, i) => {
            const circumference = 2 * Math.PI * r;
            const targetOffset = circumference * (1 - value / max);
            return (
              <g key={label}>
                <circle cx="100" cy="100" r={r} fill="none" stroke="#222" strokeWidth="12" />
                <circle
                  cx="100" cy="100" r={r}
                  fill="none" stroke="var(--ps-amber)" strokeWidth="12"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={(!animateScore || playRings) ? `${targetOffset}` : `${circumference}`}
                  transform="rotate(-90 100 100)"
                  style={{ transition: `stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.2}s` }}
                >
                  <title>{label}: {value}/{max}</title>
                </circle>
              </g>
            );
          })}
          <text x="100" y="95" textAnchor="middle" fill="var(--ps-text-primary)" fontSize="40" fontWeight="600">{score.total}</text>
          <text x="100" y="115" textAnchor="middle" fill="var(--ps-text-secondary)" fontSize="20">/100</text>
        </svg>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontSize: "var(--ps-text-subhead)", color: "var(--ps-amber)", marginTop: "16px", fontWeight: 600 }}
        >
          {getScoreLabel(score.total)}
        </motion.div>
      </motion.div>

      {/* ── Score bars ── */}
      <motion.div {...fadeUp(0.15)} style={{ marginBottom: "24px" }}>
        {bars.map((item, idx) => (
          <motion.div
            key={item.label}
            className="ps-tooltip-container"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: "12px" }}
          >
            <div className="ps-tooltip-text">{item.tooltip}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "var(--ps-text-secondary-size)" }}>
              <span style={{ color: "var(--ps-text-secondary)" }}>{item.label} ⓘ</span>
              <span style={{ color: "var(--ps-text-primary)" }}>{item.value}/{item.max}</span>
            </div>
            <div style={{ height: "4px", background: "#222", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ width: `${(item.value / item.max) * 100}%`, height: "100%", background: "var(--ps-amber)", transition: animateScore ? "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)" : "none" }} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Impact card ── */}
      <AnimatePresence>
        {gameState === "impact" && (() => {
          const idealWaterMl = challenge?.ideal_water_ml;
          const diff = idealWaterMl != null ? score.waterMl - idealWaterMl : null;
          const saved = diff != null ? Math.abs(diff) : null;
          const isOver = diff != null && diff > 0;
          const isEqual = diff != null && diff === 0;

          const diffText = diff == null
            ? null
            : diff === 0
              ? "Your prompt used the same amount of water as the reference prompt."
              : diff > 0
                ? `Your prompt and the model's response together used more tokens than the reference — ${Math.abs(diff)}ml more water, mostly from extra prompt length or a longer generated reply.`
                : `Your prompt was more token-efficient than the reference prompt, using ${Math.abs(diff)}ml less water.`;

          return (
            <motion.div
              key="impact-card"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="ps-glass-panel"
              style={{
                background: "rgba(20, 184, 166, 0.04)",
                borderLeft: "4px solid var(--ps-teal)",
                borderColor: "rgba(20, 184, 166, 0.15)",
                padding: "24px",
                marginBottom: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ fontFamily: "var(--ps-font-ui)", fontSize: "18px", fontWeight: 700, color: "var(--ps-teal)", letterSpacing: "0.02em" }}>
                  Did you know? 🌍
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
                  {idealWaterMl != null ? (
                    <>
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "32px", background: "rgba(255,255,255,0.03)", padding: "16px 12px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <div style={{ fontSize: "11px", color: "var(--ps-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--ps-font-mono)" }}>Ideal</div>
                          <WaterGlass waterMl={idealWaterMl} />
                          <div style={{ fontSize: "13px", color: "var(--ps-teal)", fontWeight: 700, fontFamily: "var(--ps-font-mono)" }}>~{idealWaterMl}ml</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "20px", gap: 4 }}>
                          <div style={{ fontSize: "18px", color: "var(--ps-teal)" }}>
                            {isEqual ? "=" : isOver ? "↑" : "↓"}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--ps-teal)", fontFamily: "var(--ps-font-mono)", fontWeight: 700 }}>
                            {isEqual ? "same" : `${isOver ? "+" : "-"}${saved}ml`}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <div style={{ fontSize: "11px", color: "var(--ps-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--ps-font-mono)" }}>You</div>
                          <WaterGlass waterMl={score.waterMl} />
                          <div style={{ fontSize: "13px", color: "var(--ps-teal)", fontWeight: 700, fontFamily: "var(--ps-font-mono)" }}>~{score.waterMl}ml</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", lineHeight: "1.55", padding: "0 2px" }}>
                        {diffText}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "center", background: "rgba(255,255,255,0.03)", padding: "16px 12px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <div style={{ fontSize: "11px", color: "var(--ps-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--ps-font-mono)" }}>You</div>
                          <WaterGlass waterMl={score.waterMl} />
                          <div style={{ fontSize: "13px", color: "var(--ps-teal)", fontWeight: 700, fontFamily: "var(--ps-font-mono)" }}>~{score.waterMl}ml</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", lineHeight: "1.55", padding: "0 2px" }}>
                        Better prompts = less AI = less water.
                      </div>
                    </>
                  )}
                  <div style={{ fontSize: "var(--ps-text-caption)", color: "var(--ps-text-secondary)", fontStyle: "italic" }}>
                    Better prompts = less AI = less water.
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── Challenge question ── */}
      {challenge && (
        <motion.div {...fadeUp(0.25)} style={{ marginBottom: "18px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginBottom: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--ps-font-mono)" }}>
            Challenge
          </div>
          <div style={{ background: "#141414", borderLeft: "4px solid var(--ps-border)", borderRadius: "8px", padding: "12px", fontFamily: "var(--ps-font-mono)", fontSize: "14px", color: "var(--ps-text-primary)", lineHeight: "1.5" }}>
            {challenge.target_output}
          </div>
        </motion.div>
      )}

      {/* ── Ideal prompt reveal ── */}
      <AnimatePresence>
        {showAutoIdeal && idealPrompt && (
          <motion.div
            key="ideal-diff"
            initial={{ opacity: 0, y: 20, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: "24px" }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Per-dimension coaching feedback ── */}
      {!isIdeal && (() => {
        const fb = getScoreFeedback(score.accuracy, score.format, score.brevity);
        const allGood = fb.dim === "All";
        const accentColor = allGood ? "var(--ps-teal)" : "var(--ps-amber)";
        const borderColor = allGood ? "var(--ps-teal)" : "var(--ps-amber)";
        return (
          <motion.div
            {...fadeUp(0.32)}
            className={allGood ? "ps-glass-panel" : "ps-glass-panel-amber"}
            style={{ borderLeft: `4px solid ${borderColor}`, padding: "16px 20px", marginBottom: "24px", borderRadius: "12px" }}
          >
            <div style={{ fontSize: "var(--ps-text-caption)", fontWeight: 700, color: accentColor, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--ps-font-mono)" }}>
              {allGood ? "✓" : "→"} {fb.label}
            </div>
            <div style={{ fontSize: "13px", color: "var(--ps-text-secondary)", lineHeight: "1.55" }}>
              {fb.tip}
            </div>
            {score.sandboxOutput && (
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ps-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--ps-font-mono)", marginBottom: "4px" }}>
                  Output produced by your prompt:
                </div>
                <div style={{ background: "#141414", borderLeft: `2px solid ${accentColor}`, borderRadius: "4px", padding: "8px 12px", fontFamily: "var(--ps-font-mono)", fontSize: "13px", color: "var(--ps-text-primary)", whiteSpace: "pre-wrap", textAlign: "left" }}>
                  {score.sandboxOutput}
                </div>
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* ── Action buttons ── */}
      <motion.div {...fadeUp(0.4)} style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "16px" }}>
        <button
          onClick={onShare}
          style={{
            width: "100%", height: "48px",
            background: "var(--ps-amber)", border: "none", color: "#000",
            borderRadius: "8px", fontSize: "var(--ps-text-secondary-size)", fontWeight: 600, cursor: "pointer",
            transition: "transform 0.18s cubic-bezier(0.22,1,0.36,1), opacity 0.18s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          Share result
        </button>
      </motion.div>
    </>
  );
}
