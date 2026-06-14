import { useState } from "react";
import type { Challenge } from "../../lib/supabase";
import type { ScoreResult } from "../../lib/scorer";
import { useCountdownToMidnight } from "../../hooks/useCountdownToMidnight";
import { ImpactRow } from "../components/ImpactExplainer";

// ── Word-level diff (same LCS logic as ResultsScreen) ─────────────────────────
type DiffToken = { text: string; type: "same" | "removed" | "added" };

function computeWordDiff(userText: string, idealText: string): DiffToken[] {
  const userWords = userText.trim().split(/\s+/);
  const idealWords = idealText.trim().split(/\s+/);
  const m = userWords.length;
  const n = idealWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = userWords[i-1].toLowerCase() === idealWords[j-1].toLowerCase()
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1]);

  const tokens: DiffToken[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && userWords[i-1].toLowerCase() === idealWords[j-1].toLowerCase()) {
      tokens.unshift({ text: userWords[i-1], type: "same" }); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      tokens.unshift({ text: idealWords[j-1], type: "added" }); j--;
    } else {
      tokens.unshift({ text: userWords[i-1], type: "removed" }); i--;
    }
  }
  return tokens;
}

// ── Score bar tooltips ─────────────────────────────────────────────────────────
const SCORE_BAR_TOOLTIPS = {
  Accuracy: "Measures semantic similarity (40 pts) and keyword coverage (10 pts) against the target output.",
  Format: "Evaluates whether your prompt correctly enforces structural constraints, length limits, styling, and output type (20 pts).",
  Brevity: "Measures green efficiency: token economy (15 pts) and latency/speed of execution (15 pts).",
};

// ── Splash screen (phase 1) ────────────────────────────────────────────────────
function AdmireSplash({ onAdmire }: { onAdmire: () => void }) {
  const [btnHovered, setBtnHovered] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);
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
        padding: "24px 0",
        fontFamily: "var(--ps-font-ui)",
        animation: "fadeIn 0.5s ease-out",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes badgePop { from { opacity:0; transform:scale(0.7); } to { opacity:1; transform:scale(1); } }
      `}</style>

      {/* Shooting animation — same SVG as LandingScreen */}
      <div style={{ width: "160px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px" }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ overflow: "visible" }}>
          <circle
            cx="80" cy="80" r="14"
            fill="none" stroke="var(--ps-amber)"
            style={{ animation: "ripple-expand 4.5s ease-out infinite", transformOrigin: "80px 80px" }}
          />
          <g style={{ animation: "target-wobble 4.5s ease-out infinite", transformOrigin: "80px 80px" }}>
            <circle cx="80" cy="80" r="56" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="1.5" strokeDasharray="6 4" />
            <circle cx="80" cy="80" r="42" fill="none" stroke="var(--ps-teal)" strokeWidth="3" />
            <circle cx="80" cy="80" r="28" fill="none" stroke="var(--ps-text-primary)" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="80" cy="80" r="14" fill="var(--ps-amber)" />
            <circle cx="80" cy="80" r="5" fill="#000" />
          </g>
          <g style={{ animation: "arrow-shoot 4.5s infinite", transformOrigin: "0px 0px" }}>
            <line x1="-32" y1="0" x2="-2" y2="0" stroke="var(--ps-text-primary)" strokeWidth="2" strokeLinecap="round" />
            <path d="M -32 -5 L -24 0 L -32 5 L -37 5 L -30 0 L -37 -5 Z" fill="var(--ps-teal)" />
            <polygon points="0,0 -8,-4 -6,0 -8,4" fill="var(--ps-amber)" />
          </g>
        </svg>
      </div>

      {/* Wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px", justifyContent: "center", marginBottom: "16px" }}>
        <span style={{ fontFamily: "var(--ps-font-ui)", fontSize: "36px", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--ps-text-primary)" }}>Prompt</span>
        <span style={{ fontFamily: "var(--ps-font-ui)", fontSize: "36px", fontWeight: 400, fontStyle: "italic", letterSpacing: "-0.03em", color: "var(--ps-teal)", paddingRight: "6px" }}>Shot</span>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ps-amber)", alignSelf: "flex-end", marginBottom: "8px" }} />
      </div>

      {/* Already played badge */}
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(20,184,166,0.1)",
        border: "1px solid var(--ps-teal)",
        borderRadius: "9999px",
        padding: "6px 16px",
        marginBottom: "24px",
        animation: "badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both",
      }}>
        <span style={{ color: "var(--ps-teal)", fontSize: "14px" }}>✓</span>
        <span style={{ color: "var(--ps-teal)", fontSize: "13px", fontWeight: 600 }}>You already played today</span>
      </div>

      <div style={{ marginBottom: "36px", textAlign: "center" }}>
        <p style={{ fontSize: "15px", color: "var(--ps-text-secondary)", margin: "0 0 8px 0", lineHeight: "1.6" }}>
          come back tomorrow~
        </p>
        <p style={{ fontSize: "18px", color: "var(--ps-text-primary)", fontWeight: 600, fontFamily: "var(--ps-font-mono)", margin: 0 }}>
          {h}h {m}m {String(s).padStart(2, "0")}s
        </p>
      </div>

      <button
        onClick={onAdmire}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => { setBtnHovered(false); setBtnPressed(false); }}
        onMouseDown={() => setBtnPressed(true)}
        onMouseUp={() => setBtnPressed(false)}
        style={{
          height: "52px",
          padding: "0 36px",
          background: btnPressed ? "rgba(245,158,11,0.85)" : btnHovered ? "rgba(245,158,11,0.9)" : "var(--ps-amber)",
          border: "none",
          borderRadius: "26px",
          color: "#000",
          fontSize: "16px",
          fontWeight: 700,
          fontFamily: "var(--ps-font-ui)",
          cursor: "pointer",
          transform: btnPressed ? "scale(0.96)" : btnHovered ? "scale(1.03)" : "scale(1)",
          transition: "transform 0.15s ease, background 0.15s ease",
          letterSpacing: "-0.01em",
        }}
      >
        Admire your prompt →
      </button>
    </div>
  );
}

// ── Stats + prompt comparison (phase 2) ───────────────────────────────────────
function AdmireStats({
  score,
  challenge,
  personalSavings,
  communitySavings,
  userPrompt,
  idealPrompt,
}: {
  score: ScoreResult | null;
  challenge: Challenge | null;
  personalSavings: { waterMl: number; co2Grams: number };
  communitySavings: { waterLiters: number; co2Kg: number };
  userPrompt: string;
  idealPrompt: string;
}) {
  const { h, m, s } = useCountdownToMidnight();
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const bars = [
    { label: "Accuracy", value: score?.accuracy ?? 0, max: 50, tooltip: SCORE_BAR_TOOLTIPS.Accuracy },
    { label: "Format",   value: score?.format   ?? 0, max: 20, tooltip: SCORE_BAR_TOOLTIPS.Format },
    { label: "Brevity",  value: score?.brevity  ?? 0, max: 30, tooltip: SCORE_BAR_TOOLTIPS.Brevity },
  ];

  const waterDisplay = personalSavings.waterMl >= 1000
    ? `${(personalSavings.waterMl / 1000).toFixed(2)}L`
    : `${personalSavings.waterMl}ml`;
  const co2Display = personalSavings.co2Grams >= 1000
    ? `${(personalSavings.co2Grams / 1000).toFixed(2)}kg`
    : `${personalSavings.co2Grams.toFixed(2)}g`;

  const hasPrompts = userPrompt.trim() && idealPrompt.trim();
  const tokens = hasPrompts ? computeWordDiff(userPrompt, idealPrompt) : [];
  const hasRemovals = tokens.some((t) => t.type === "removed");
  const hasAdditions = tokens.some((t) => t.type === "added");

  return (
    <div
      style={{
        fontFamily: "var(--ps-font-ui)",
        color: "var(--ps-text-primary)",
        padding: "24px 0 40px",
        boxSizing: "border-box",
        animation: "slideIn 0.4s ease-out",
      }}
    >
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes barFill { from { width:0%; } }
        @keyframes countUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .impact-card-lift { transition: transform 0.2s ease, border-color 0.2s ease; }
        .impact-card-lift:hover { transform: translateY(-2px); border-color: var(--ps-teal) !important; }
      `}</style>

      {/* Logo */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <span style={{ fontFamily: "var(--ps-font-ui)", fontSize: "22px", fontWeight: 850, letterSpacing: "-0.04em", color: "var(--ps-text-primary)" }}>Prompt</span>
          <span style={{ fontFamily: "var(--ps-font-ui)", fontSize: "22px", fontWeight: 300, fontStyle: "italic", letterSpacing: "-0.03em", color: "var(--ps-teal)", paddingRight: "4px" }}>Shot</span>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--ps-amber)", alignSelf: "flex-end", marginBottom: "5px" }} />
        </div>
      </div>

      <div style={{ background: "var(--ps-surface)", borderRadius: "16px", padding: "28px" }}>

          {/* Badges */}
          {challenge && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", justifyContent: "center" }}>
              <span style={{ background: "var(--ps-teal)", color: "#000", padding: "4px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600 }}>
                {challenge.category}
              </span>
              <span style={{ background: "rgba(245,158,11,0.15)", color: "var(--ps-amber)", padding: "4px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600 }}>
                {challenge.difficulty}
              </span>
            </div>
          )}

          {/* Score */}
          <div style={{ fontSize: "40px", textAlign: "center", marginBottom: "24px", animation: "countUp 0.6s ease-out", fontWeight: 700 }}>
            <span style={{ color: "var(--ps-amber)" }}>{score ? score.total : "—"}</span>
            <span style={{ color: "var(--ps-text-secondary)", fontSize: "22px", fontWeight: 400 }}>/100</span>
          </div>

          {/* Score bars */}
          {score && (
            <div style={{ marginBottom: "24px" }}>
              {bars.map((item, i) => (
                <div
                  key={item.label}
                  className="ps-tooltip-container"
                  style={{ marginBottom: "12px", opacity: 0, animation: `countUp 0.4s ease-out ${0.1 + i * 0.1}s forwards` }}
                  onMouseEnter={() => setHoveredBar(item.label)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="ps-tooltip-text">{item.tooltip}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "14px" }}>
                    <span style={{ color: hoveredBar === item.label ? "var(--ps-text-primary)" : "var(--ps-text-secondary)", transition: "color 0.2s" }}>
                      {item.label} ⓘ
                    </span>
                    <span style={{ color: "var(--ps-text-primary)", fontFamily: "var(--ps-font-mono)" }}>{item.value}/{item.max}</span>
                  </div>
                  <div style={{ height: "4px", background: "#222", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{
                      width: `${(item.value / item.max) * 100}%`,
                      height: "100%",
                      background: hoveredBar === item.label ? "var(--ps-mint)" : "var(--ps-amber)",
                      transition: "background 0.2s",
                      animation: `barFill 0.8s cubic-bezier(0.25,0.8,0.25,1) ${0.2 + i * 0.1}s both`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Countdown */}
          <div style={{ fontSize: "13px", color: "var(--ps-text-secondary)", textAlign: "center", marginBottom: "24px", fontFamily: "var(--ps-font-mono)" }}>
            Next challenge in{" "}
            <span style={{ color: "var(--ps-text-primary)", fontWeight: 600 }}>
              {h}h {m}m {String(s).padStart(2, "0")}s
            </span>
          </div>

          {/* ── Prompt comparison ── */}
          {hasPrompts && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--ps-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px", fontFamily: "var(--ps-font-mono)" }}>
                Prompt Comparison
              </div>

              {/* Legend */}
              {(hasRemovals || hasAdditions) && (
                <div style={{ display: "flex", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
                  {hasRemovals && <span style={{ fontSize: "11px", color: "var(--ps-red)", fontFamily: "var(--ps-font-mono)" }}>− words you wrote that weren't needed</span>}
                  {hasAdditions && <span style={{ fontSize: "11px", color: "var(--ps-teal)", fontFamily: "var(--ps-font-mono)" }}>+ words the ideal added</span>}
                </div>
              )}

              {/* Your prompt */}
              <div style={{ background: "rgba(255,95,95,0.04)", border: "1px solid rgba(255,95,95,0.15)", borderRadius: "8px", padding: "12px", marginBottom: "8px", fontFamily: "var(--ps-font-mono)", fontSize: "13px", lineHeight: "1.7", color: "var(--ps-text-primary)" }}>
                <span style={{ fontSize: "10px", color: "var(--ps-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>Your prompt</span>
                {tokens.filter((t) => t.type !== "added").map((t, idx) => (
                  <span key={idx} style={{
                    background: t.type === "removed" ? "rgba(255,95,95,0.18)" : "transparent",
                    color: t.type === "removed" ? "var(--ps-red)" : "var(--ps-text-primary)",
                    textDecoration: t.type === "removed" ? "line-through" : "none",
                    marginRight: "4px",
                    borderRadius: "3px",
                    padding: t.type === "removed" ? "0 2px" : "0",
                  }}>{t.text}</span>
                ))}
              </div>

              {/* Ideal prompt */}
              <div style={{ background: "rgba(20,184,166,0.04)", border: "1px solid rgba(20,184,166,0.2)", borderRadius: "8px", padding: "12px", fontFamily: "var(--ps-font-mono)", fontSize: "13px", lineHeight: "1.7", color: "var(--ps-text-primary)" }}>
                <span style={{ fontSize: "10px", color: "var(--ps-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>Ideal prompt</span>
                {tokens.filter((t) => t.type !== "removed").map((t, idx) => (
                  <span key={idx} style={{
                    background: t.type === "added" ? "rgba(20,184,166,0.15)" : "transparent",
                    color: t.type === "added" ? "var(--ps-teal)" : "var(--ps-text-primary)",
                    fontWeight: t.type === "added" ? 600 : 400,
                    marginRight: "4px",
                    borderRadius: "3px",
                    padding: t.type === "added" ? "0 3px" : "0",
                  }}>{t.text}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── Eco dashboard ── */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="impact-card-lift" style={{ background: "rgba(20,184,166,0.06)", borderLeft: "3px solid var(--ps-border)", padding: "16px", borderRadius: "8px" }}>
              <div style={{ fontFamily: "var(--ps-font-ui)", fontSize: "11px", fontWeight: 600, color: "var(--ps-teal)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Your Lifetime Impact</div>
              <ImpactRow emoji="💧" value={`~${waterDisplay}`} label="water saved" explainerType="lifetime-water" personal={personalSavings} community={communitySavings} size="md" />
              <ImpactRow emoji="🌲" value={`~${co2Display}`} label="CO₂ prevented" explainerType="lifetime-co2" personal={personalSavings} community={communitySavings} size="sm" />
            </div>
            <div className="impact-card-lift" style={{ background: "rgba(20,184,166,0.06)", borderLeft: "3px solid var(--ps-border)", padding: "16px", borderRadius: "8px" }}>
              <div style={{ fontFamily: "var(--ps-font-ui)", fontSize: "11px", fontWeight: 600, color: "var(--ps-teal)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Community Impact</div>
              <ImpactRow emoji="💧" value={`~${communitySavings.waterLiters.toLocaleString(undefined, { maximumFractionDigits: 1 })}L`} label="water saved" explainerType="community-water" community={communitySavings} size="md" />
              <ImpactRow emoji="🌲" value={`~${communitySavings.co2Kg.toLocaleString(undefined, { maximumFractionDigits: 1 })}kg`} label="CO₂ prevented" explainerType="community-co2" community={communitySavings} size="sm" />
            </div>
          </div>
        </div>
    </div>
  );
}

// ── Root export — orchestrates both phases ────────────────────────────────────
export function AlreadyPlayed({
  score,
  challenge,
  personalSavings,
  communitySavings,
  userPrompt = "",
  idealPrompt = "",
}: {
  score: ScoreResult | null;
  challenge: Challenge | null;
  personalSavings: { waterMl: number; co2Grams: number };
  communitySavings: { waterLiters: number; co2Kg: number };
  userPrompt?: string;
  idealPrompt?: string;
}) {
  const [phase, setPhase] = useState<"splash" | "stats">("splash");

  if (phase === "splash") {
    return <AdmireSplash onAdmire={() => setPhase("stats")} />;
  }

  return (
    <AdmireStats
      score={score}
      challenge={challenge}
      personalSavings={personalSavings}
      communitySavings={communitySavings}
      userPrompt={userPrompt}
      idealPrompt={idealPrompt}
    />
  );
}
