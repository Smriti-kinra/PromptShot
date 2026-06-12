import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Challenge } from "../lib/supabase";
import { calculateAndUpdateStreak } from "../lib/streak";
import { LearnPanel } from "./components/LearnPanel";
import { LeaderboardModal } from "./components/LeaderboardModal";
import { Topbar } from "./components/Topbar";
import { useGameState } from "../hooks/useGameState";
import { scorePrompt, simulateScore, mockScore } from "../lib/scorer";
import type { ScoreResult } from "../lib/scorer";
import { safeStorage } from "../lib/safeStorage";
import { DAILY_CHALLENGES } from "./challenges";

// ─── hooks ────────────────────────────────────────────────────────────────────

function useCountdownToMidnight() {
  const getTimeLeft = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const totalSeconds = Math.floor((midnight.getTime() - now.getTime()) / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { h, m, s };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

// ─── ui helpers ───────────────────────────────────────────────────────────────

function getScoreLabel(total: number): string {
  if (total > 240) return "Bullseye 🎯";
  if (total >= 180) return "On target";
  if (total >= 120) return "Close range";
  return "Missed";
}

function getBrevityColor(length: number): string {
  if (length < 80) return "#14B8A6";
  if (length < 150) return "#F59E0B";
  return "#EF4444";
}

function getWaterComparison(ml: number): string {
  if (ml <= 10) return "roughly a teaspoon";
  if (ml <= 30) return "roughly a tablespoon";
  if (ml <= 50) return "a small shot glass";
  return "a quarter cup";
}

function LoadingSkeleton() {
  return (
    <>
      <style>{`@keyframes pulse { 0%,100% { opacity:.35 } 50% { opacity:.7 } }`}</style>
      {[{ h: 80 }, { h: 160 }, { h: 48 }].map((b, i) => (
        <div
          key={i}
          style={{
            height: `${b.h}px`,
            background: "#1a1a1a",
            borderRadius: "8px",
            marginBottom: "16px",
            animation: `pulse 1.4s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </>
  );
}

// ─── return screen (shown when user revisits after completing today's challenge) ─

function ReturnScreen({
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
        background: "#0E1E14",
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
          {score && <span>You scored <strong style={{ color: "var(--ps-amber)" }}>{score.total}/300</strong>. </span>}
          Come back tomorrow — or admire what you built.
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
          <div>Next challenge in <strong>{h}h {m}m {String(s).padStart(2, '0')}s</strong></div>
        </div>
      </div>
    </div>
  );
}

// ─── already-played screen ────────────────────────────────────────────────────

function AlreadyPlayed({
  score,
  challenge,
  personalSavings,
  communitySavings,
  onBackToMenu,
}: {
  score: ScoreResult | null;
  challenge: Challenge | null;
  personalSavings: { waterMl: number; co2Grams: number };
  communitySavings: { waterLiters: number; co2Kg: number };
  onBackToMenu: () => void;
}) {
  const { h, m } = useCountdownToMidnight();

  const bars = [
    {
      label: "Accuracy",
      value: score?.accuracy ?? 0,
      tooltip: "Measures how well your prompt captures the required semantic details, meaning, and nuances of the target output."
    },
    {
      label: "Format",
      value: score?.format ?? 0,
      tooltip: "Evaluates whether your prompt correctly enforces structural constraints, length limits, styling, and output type specified in the target."
    },
    {
      label: "Brevity",
      value: score?.brevity ?? 0,
      tooltip: "Measures prompt efficiency. Shorter prompts receive higher scores (100 pts for <60 chars, scaling down to 20 pts for >300 chars)."
    },
  ];

  return (
    <div
      style={{
        fontFamily: "Space Grotesk, system-ui, sans-serif",
        background: "#0E1E14", // Shipped to minty near-black since they played
        color: "var(--ps-text-primary)",
        minHeight: "calc(100vh - 56px)",
        padding: "24px",
        transition: "background 1.5s ease-in-out",
      }}
    >
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <button
          onClick={onBackToMenu}
          style={{
            background: "none",
            border: "none",
            color: "var(--ps-text-secondary)",
            fontSize: "14px",
            cursor: "pointer",
            padding: "8px 0",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontFamily: "Space Grotesk",
            marginBottom: "16px",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ps-text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ps-text-secondary)")}
        >
          ‹ Back to Home Menu
        </button>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <span style={{
              fontFamily: "Space Grotesk",
              fontSize: "22px",
              fontWeight: 850,
              letterSpacing: "-0.04em",
              color: "var(--ps-text-primary)",
            }}>
              Prompt
            </span>
            <span style={{
              fontFamily: "Space Grotesk",
              fontSize: "22px",
              fontWeight: 300,
              fontStyle: "italic",
              letterSpacing: "-0.03em",
              color: "var(--ps-teal)",
              paddingRight: "4px",
            }}>
              Shot
            </span>
            <span style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--ps-amber)",
              alignSelf: "flex-end",
              marginBottom: "5px",
                }} />
          </div>
        </div>

        <div style={{ background: "var(--ps-surface)", borderRadius: "16px", padding: "32px" }}>

          {challenge && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", justifyContent: "center" }}>
              <span
                style={{
                  background: "var(--ps-teal)",
                  color: "#000",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "var(--ps-text-caption)",
                  fontWeight: 600,
                }}
              >
                {challenge.category}
              </span>
              <span
                style={{
                  background: "rgba(245,158,11,0.15)",
                  color: "var(--ps-amber)",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "var(--ps-text-caption)",
                  fontWeight: 600,
                }}
              >
                {challenge.difficulty}
              </span>
            </div>
          )}

          <div style={{ fontSize: "var(--ps-text-display)", textAlign: "center", marginBottom: "24px" }}>
            {score ? score.total : "—"}/300
          </div>

          {score && (
            <div style={{ marginBottom: "24px" }}>
              {bars.map((item) => (
                <div key={item.label} className="ps-tooltip-container" style={{ marginBottom: "12px" }}>
                  <div className="ps-tooltip-text">{item.tooltip}</div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                      fontSize: "var(--ps-text-secondary-size)",
                    }}
                  >
                    <span style={{ color: "var(--ps-text-secondary)" }}>{item.label} ⓘ</span>
                    <span style={{ color: "var(--ps-text-primary)" }}>{item.value}/100</span>
                  </div>
                  <div style={{ height: "4px", background: "#222", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${item.value}%`,
                        height: "100%",
                        background: "var(--ps-amber)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: "14px", color: "#888880", textAlign: "center", marginBottom: "24px" }}>
            Next challenge in {h}h {m}m {String(s).padStart(2, '0')}s
          </div>

          {/* Lifetime & Community Eco Dashboard */}
          <div
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "24px",
              marginBottom: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                background: "rgba(20, 184, 166, 0.06)",
                borderLeft: "3px solid var(--ps-teal)",
                padding: "16px",
                borderRadius: "8px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--ps-teal)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "4px",
                }}
              >
                Your Lifetime Impact
              </div>
              <div style={{ fontSize: "14px", color: "var(--ps-text-primary)", fontWeight: 500 }}>
                💧 {personalSavings.waterMl >= 1000
                  ? `${(personalSavings.waterMl / 1000).toFixed(2)}L`
                  : `${personalSavings.waterMl}ml`}{" "}
                water saved
              </div>
              <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginTop: "2px" }}>
                🌲 {personalSavings.co2Grams >= 1000
                  ? `${(personalSavings.co2Grams / 1000).toFixed(2)}kg`
                  : `${personalSavings.co2Grams.toFixed(2)}g`}{" "}
                CO₂ prevented
              </div>
            </div>

            <div
              style={{
                background: "rgba(20, 184, 166, 0.06)",
                borderLeft: "3px solid var(--ps-teal)",
                padding: "16px",
                borderRadius: "8px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--ps-teal)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "4px",
                }}
              >
                Global Community Impact
              </div>
              <div style={{ fontSize: "14px", color: "var(--ps-text-primary)", fontWeight: 500 }}>
                💧 {communitySavings.waterLiters.toLocaleString(undefined, { maximumFractionDigits: 1 })}L{" "}
                water saved
              </div>
              <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginTop: "2px" }}>
                🌲 {communitySavings.co2Kg.toLocaleString(undefined, { maximumFractionDigits: 1 })}kg{" "}
                CO₂ prevented
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}

// ─── Water Glass Effect Component ──────────────────────────────────────────────

function WaterGlass({ waterMl }: { waterMl: number }) {
  const [fillPct, setFillPct] = useState(0);
  const glassW = 72;
  const glassH = 120;

  useEffect(() => {
    const timer = setTimeout(() => {
      const target = Math.min(90, Math.max(18, (waterMl / 35) * 100));
      setFillPct(target);
    }, 300);
    return () => clearTimeout(timer);
  }, [waterMl]);

  // Fill level in pixels from the bottom
  const fillY = glassH - (glassH * fillPct) / 100;

  // Wave path: sinusoidal wave across the glass top, clipped to glass shape
  // We animate translateX on a wide wave path for the sloshing effect
  const waveWidth = glassW * 3; // 3x wide so we can animate left-right

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg
        width={glassW}
        height={glassH}
        viewBox={`0 0 ${glassW} ${glassH}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Keyframes injected via <style> inside SVG */}
          <style>{`
            @keyframes wave-move {
              0%   { transform: translateX(0); }
              50%  { transform: translateX(-${glassW}px); }
              100% { transform: translateX(0); }
            }
            @keyframes wave-move2 {
              0%   { transform: translateX(-${glassW * 0.5}px); }
              50%  { transform: translateX(${glassW * 0.5}px); }
              100% { transform: translateX(-${glassW * 0.5}px); }
            }
            @keyframes fill-rise {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
          `}</style>

          {/* Glass shape clip path (rounded bottom beaker shape) */}
          <clipPath id="glass-clip">
            <path d={`
              M 4 0
              L ${glassW - 4} 0
              L ${glassW - 2} ${glassH - 14}
              Q ${glassW - 2} ${glassH} ${glassW - 14} ${glassH}
              L 14 ${glassH}
              Q 2 ${glassH} 2 ${glassH - 14}
              Z
            `} />
          </clipPath>
        </defs>

        {/* Glass body (frosted outline) */}
        <path
          d={`
            M 4 0
            L ${glassW - 4} 0
            L ${glassW - 2} ${glassH - 14}
            Q ${glassW - 2} ${glassH} ${glassW - 14} ${glassH}
            L 14 ${glassH}
            Q 2 ${glassH} 2 ${glassH - 14}
            Z
          `}
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />

        {/* Water fill group — clipped to glass shape */}
        <g clipPath="url(#glass-clip)">
          {/* Water body (solid color beneath wave) */}
          <rect
            x={0}
            y={fillY + 8}  /* slightly below wave peak so no gap */
            width={glassW}
            height={glassH - fillY}
            fill="#14B8A6"
            style={{ transition: "y 2.5s cubic-bezier(0.1,0.8,0.2,1)" }}
          />

          {/* Animated wave 1 (primary) */}
          <g style={{
            animation: "wave-move 4s ease-in-out infinite",
            transition: "transform 2.5s cubic-bezier(0.1,0.8,0.2,1)",
          }}>
            <path
              d={`
                M ${-glassW} ${fillY}
                Q ${-glassW + glassW * 0.25} ${fillY - 8} ${-glassW + glassW * 0.5} ${fillY}
                Q ${-glassW + glassW * 0.75} ${fillY + 8} ${-glassW + glassW} ${fillY}
                Q ${-glassW + glassW * 1.25} ${fillY - 8} ${-glassW + glassW * 1.5} ${fillY}
                Q ${-glassW + glassW * 1.75} ${fillY + 8} ${-glassW + glassW * 2} ${fillY}
                Q ${-glassW + glassW * 2.25} ${fillY - 8} ${-glassW + glassW * 2.5} ${fillY}
                Q ${-glassW + glassW * 2.75} ${fillY + 8} ${-glassW + glassW * 3} ${fillY}
                L ${-glassW + glassW * 3} ${glassH}
                L ${-glassW} ${glassH}
                Z
              `}
              fill="#14B8A6"
            />
          </g>

          {/* Animated wave 2 (secondary, darker — depth/shadow effect) */}
          <g style={{
            animation: "wave-move2 5.5s ease-in-out infinite",
          }}>
            <path
              d={`
                M ${-glassW} ${fillY + 4}
                Q ${-glassW + glassW * 0.25} ${fillY - 4} ${-glassW + glassW * 0.5} ${fillY + 4}
                Q ${-glassW + glassW * 0.75} ${fillY + 12} ${-glassW + glassW} ${fillY + 4}
                Q ${-glassW + glassW * 1.25} ${fillY - 4} ${-glassW + glassW * 1.5} ${fillY + 4}
                Q ${-glassW + glassW * 1.75} ${fillY + 12} ${-glassW + glassW * 2} ${fillY + 4}
                Q ${-glassW + glassW * 2.25} ${fillY - 4} ${-glassW + glassW * 2.5} ${fillY + 4}
                Q ${-glassW + glassW * 2.75} ${fillY + 12} ${-glassW + glassW * 3} ${fillY + 4}
                L ${-glassW + glassW * 3} ${glassH}
                L ${-glassW} ${glassH}
                Z
              `}
              fill="rgba(10,30,20,0.35)"
            />
          </g>

          {/* Shimmer highlight — a soft diagonal stripe */}
          <rect
            x={8}
            y={fillY + 6}
            width={6}
            height={glassH - fillY}
            rx={3}
            fill="rgba(255,255,255,0.08)"
          />
        </g>

        {/* Rim highlight (top edge glint) */}
        <line x1={4} y1={1} x2={glassW - 4} y2={1} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      </svg>
    </div>
  );
}

// ─── main helper ──────────────────────────────────────────────────────────────

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

function getLocalFallbackChallenge(difficulty: string): Challenge {
  const filtered = DAILY_CHALLENGES.filter(
    (c) => c.difficulty.toUpperCase() === difficulty.toUpperCase()
  );
  const pool = filtered.length > 0 ? filtered : DAILY_CHALLENGES;
  const dayOfYear = getDayOfYear(new Date());
  const localCh = pool[dayOfYear % pool.length];

  return {
    id: localCh.id,
    category: localCh.category,
    difficulty: localCh.difficulty,
    target_output: localCh.targetOutput,
    ideal_prompt: localCh.idealPrompt,
    char_count: localCh.charCount,
    active: true,
  };
}

async function loadChallenge(difficulty: string, selectFields: string): Promise<Challenge | null> {
  const dayOfYear = getDayOfYear(new Date());
  try {
    const { data, error } = await supabase
      .from("challenges")
      .select(selectFields)
      .eq("difficulty", difficulty)
      .eq("active", true)
      .order("id");

    if (error || !data || data.length === 0) {
      console.warn("Challenges query empty/failed from database, falling back to local dataset.");
      return getLocalFallbackChallenge(difficulty);
    }
    return data[dayOfYear % data.length];
  } catch (err) {
    console.error("Error loading challenge from Supabase, falling back to local dataset:", err);
    return getLocalFallbackChallenge(difficulty);
  }
}

// ─── main component ───────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const {
    gameState,
    setGameState,
    streak,
    setStreak,
    getLocalHistory,
    saveLocalScore,
    calculateLocalStreak,
    migrateLocalScoresToSupabase,
  } = useGameState();

  // View Transitions API Wrapper
  const transitionToState = (newState: GameState) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setGameState(newState);
      });
    } else {
      setGameState(newState);
    }
  };

  const [personalSavings, setPersonalSavings] = useState<{ waterMl: number; co2Grams: number }>({
    waterMl: 0,
    co2Grams: 0,
  });

  const [communitySavings, setCommunitySavings] = useState<{ waterLiters: number; co2Kg: number }>({
    waterLiters: 12450, // Active baseline
    co2Kg: 124.5,       // Active baseline
  });

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isPlayingStarted, setIsPlayingStarted] = useState(false);
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [hasClickedAdmire, setHasClickedAdmire] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [difficulty, setDifficulty] = useState<string>(
    () => safeStorage.getItem("promptshot_difficulty") ?? "BEGINNER",
  );

  const [userPrompt, setUserPrompt] = useState("");
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [idealPrompt, setIdealPrompt] = useState("");
  const [showAutoIdeal, setShowAutoIdeal] = useState(false);
  const [animateScore, setAnimateScore] = useState(false);
  const [showLearnPanel, setShowLearnPanel] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (event === "SIGNED_IN" && s) {
        await migrateLocalScoresToSupabase(s.user.id);
      }
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    safeStorage.setItem("promptshot_difficulty", difficulty);
  }, [difficulty]);

  useEffect(() => {
    if (sessionLoading) return;
    setChallenge(null);
    setScore(null);
    setIdealPrompt("");
    setShowAutoIdeal(false);
    setAnimateScore(false);
    setUserPrompt("");
    setIsPlayingStarted(false);
    setIsSandboxMode(false);

    (async () => {
      const today = new Date().toISOString().split("T")[0];
      let hasPlayed = false;

      // ─── Fetch Personal Savings ───
      let localSavedWater = 0;
      let localSavedCo2 = 0;

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("streak")
          .eq("id", session.user.id)
          .single();
        setStreak(profile?.streak ?? 0);

        const { data: existing } = await supabase
          .from("scores")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("played_at", today)
          .maybeSingle();
        if (existing) hasPlayed = true;

        // Fetch user history for lifetime savings calculation
        const { data: userScores } = await supabase
          .from("scores")
          .select("water_ml, co2_grams")
          .eq("user_id", session.user.id);

        if (userScores) {
          userScores.forEach((s) => {
            localSavedWater += (50 - (s.water_ml ?? 10));
            localSavedCo2 += (0.5 - (s.co2_grams ?? 0.1));
          });
        }
      } else {
        setStreak(parseInt(safeStorage.getItem("promptshot_streak") ?? "0", 10));
        const history = getLocalHistory();
        const todayEntry = history.find((s) => s.played_at === today);
        if (todayEntry) hasPlayed = true;

        // Calculate from local history
        history.forEach((s) => {
          localSavedWater += (50 - (s.waterMl ?? 10));
          localSavedCo2 += (0.5 - (s.co2Grams ?? 0.1));
        });
      }

      setPersonalSavings({
        waterMl: Math.max(0, localSavedWater),
        co2Grams: Math.max(0, localSavedCo2),
      });
      setHasPlayedToday(hasPlayed);

      // ─── Fetch Global Community Savings ───
      let globalWaterMl = 0;
      let globalCo2G = 0;
      try {
        const { data: allScores, error } = await supabase
          .from("scores")
          .select("water_ml, co2_grams");
        if (!error && allScores) {
          allScores.forEach((s) => {
            globalWaterMl += (50 - (s.water_ml ?? 10));
            globalCo2G += (0.5 - (s.co2_grams ?? 0.1));
          });
        }
      } catch (err) {
        console.error("Error fetching global scores:", err);
      }

      setCommunitySavings({
        waterLiters: 12450 + (globalWaterMl / 1000),
        co2Kg: 124.5 + (globalCo2G / 1000),
      });

      // Secure retrieval: fetch ideal_prompt only if they have already played today
      const selectFields = hasPlayed
        ? "id, category, difficulty, target_output, ideal_prompt, char_count, active"
        : "id, category, difficulty, target_output, char_count, active";

      const ch = await loadChallenge(difficulty, selectFields);
      setChallenge(ch);

      if (!ch) {
        transitionToState("challenge");
        return;
      }

      if (ch.ideal_prompt) {
        setIdealPrompt(ch.ideal_prompt);
      }

      if (session) {
        const { data: existingScore } = await supabase
          .from("scores")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("played_at", today)
          .single();

        if (existingScore) {
          setScore({
            accuracy: existingScore.accuracy,
            format: existingScore.format,
            brevity: existingScore.brevity,
            total: existingScore.total,
            waterMl: existingScore.water_ml ?? 10,
            co2Grams: existingScore.co2_grams ?? 0.1,
          });
        }
      } else {
        const todayEntry = getLocalHistory().find((s) => s.played_at === today);
        if (todayEntry) {
          setScore({
            accuracy: todayEntry.accuracy,
            format: todayEntry.format,
            brevity: todayEntry.brevity,
            total: todayEntry.total,
            waterMl: todayEntry.waterMl ?? 10,
            co2Grams: todayEntry.co2Grams ?? 0.1,
          });
        }
      }

      // Go directly to return screen if they've already played, otherwise challenge
      transitionToState(hasPlayed ? "already-played" : "challenge");
    })();
  }, [session, difficulty, sessionLoading]);

  const handleDifficultyChange = (d: string) => {
    setDifficulty(d);
  };

  const handlePlaySandbox = () => {
    setIsSandboxMode(true);
    setIsPlayingStarted(true);
    setUserPrompt("");
    setScore(null);
    transitionToState("challenge");
  };

  const handleBackToMenu = () => {
    setIsPlayingStarted(false);
    setIsSandboxMode(false);
    transitionToState("challenge");
  };

  const handleSubmit = async () => {
    if (!userPrompt.trim() || !challenge) return;
    transitionToState("loading");

    let result: ScoreResult;

    if (session) {
      try {
        result = await scorePrompt(
          userPrompt,
          challenge.id,
          session.access_token
        );
      } catch (err) {
        console.error("Scoring error, using local fallback:", err);
        result = mockScore(userPrompt);
      }

      if (!isSandboxMode) {
        const today = new Date().toISOString().split("T")[0];
        await supabase.from("scores").insert({
          user_id: session.user.id,
          challenge_id: challenge.id,
          accuracy: result.accuracy,
          format: result.format,
          brevity: result.brevity,
          total: result.total,
          user_prompt: userPrompt,
          played_at: today,
          water_ml: result.waterMl,
          co2_grams: result.co2Grams,
        });

        const newStreak = await calculateAndUpdateStreak(session.user.id);
        setStreak(newStreak);
      }
    } else {
      result = await simulateScore(userPrompt, challenge.id);

      if (!isSandboxMode) {
        const today = new Date().toISOString().split("T")[0];
        saveLocalScore({
          played_at: today,
          accuracy: result.accuracy,
          format: result.format,
          brevity: result.brevity,
          total: result.total,
          challenge_id: challenge.id,
          user_prompt: userPrompt,
          waterMl: result.waterMl,
          co2Grams: result.co2Grams,
        });

        const newStreak = calculateLocalStreak();
        setStreak(newStreak);
      }
    }

    setScore(result);
    if (result.idealPrompt) {
      setIdealPrompt(result.idealPrompt);
    }

    // Dynamic savings update (only persistent for actual plays)
    if (!isSandboxMode) {
      const savedWaterThisTurn = 50 - result.waterMl;
      const savedCo2ThisTurn = 0.5 - result.co2Grams;
      setPersonalSavings((prev) => ({
        waterMl: prev.waterMl + savedWaterThisTurn,
        co2Grams: prev.co2Grams + savedCo2ThisTurn,
      }));
      setCommunitySavings((prev) => ({
        waterLiters: prev.waterLiters + (savedWaterThisTurn / 1000),
        co2Kg: prev.co2Kg + (savedCo2ThisTurn / 1000),
      }));
    }

    transitionToState("results");
    setTimeout(() => setAnimateScore(true), 100);
    
    // Automatically transition results -> impact after 2000ms
    setTimeout(() => {
      transitionToState("impact");
    }, 2000);

    if (result.total < 210) {
      setTimeout(() => setShowAutoIdeal(true), 1500);
    }
  };

  const handleShare = () => {
    if (!score || !challenge) return;
    const dots = "●●●●●"
      .split("")
      .map((_, i) => {
        const threshold = (i + 1) * 60;
        if (score.total >= threshold) return "●";
        if (score.total >= threshold - 30) return "◐";
        return "○";
      })
      .join("");
    const text = `PromptShot — ${challenge.id}\n${score.total}/300 ${dots}\n💧 ~10ml · ${challenge.difficulty}`;
    const tryClipboard = async () => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
    };
    tryClipboard().then(() => alert("Copied to clipboard!"));
  };

  const topbar = (
    <Topbar
      session={session}
      streak={streak}
      onOpenLearn={() => setShowLearnPanel(true)}
      onOpenLeaderboard={() => setShowLeaderboard(true)}
      showHint={showHint}
      onToggleHint={() => setShowHint((v) => !v)}
      hasPlayedToday={hasPlayedToday}
      onStartPlay={() => {
        setIsSandboxMode(false);
        setIsPlayingStarted(true);
        setUserPrompt("");
        setScore(null);
        transitionToState("challenge");
      }}
      onPlaySandbox={handlePlaySandbox}
    />
  );

  const isEcoState = gameState === "impact" || gameState === "results" || gameState === "already-played";
  const contentStyle: React.CSSProperties = {
    fontFamily: "Space Grotesk, system-ui, sans-serif",
    background: isEcoState ? "#0E1E14" : "var(--ps-background)",
    color: "var(--ps-text-primary)",
    minHeight: "calc(100vh - 56px)",
    padding: "24px",
    transition: "background 1.5s ease-in-out",
  };

  if (gameState === "already-played") {
    // Show the welcoming return screen first; only show full stats after user clicks "Admire"
    if (!hasClickedAdmire) {
      return (
        <>
          {topbar}
          <ReturnScreen
            challenge={challenge}
            score={score}
            onAdmire={() => setHasClickedAdmire(true)}
            onPlaySandbox={handlePlaySandbox}
          />
          <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} session={session} />
          <LearnPanel isOpen={showLearnPanel} onClose={() => setShowLearnPanel(false)} />
        </>
      );
    }
    return (
      <>
        {topbar}
        <AlreadyPlayed
          score={score}
          challenge={challenge}
          personalSavings={personalSavings}
          communitySavings={communitySavings}
          onBackToMenu={handleBackToMenu}
        />
        <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} session={session} />
        <LearnPanel isOpen={showLearnPanel} onClose={() => setShowLearnPanel(false)} />
      </>
    );
  }

  const isChallengeLoading = !challenge;

  return (
    <>
      {topbar}
      <div style={contentStyle}>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          {/* Back button below question mark (top-left) */}
          {isPlayingStarted && (
            <button
              onClick={handleBackToMenu}
              style={{
                background: "none",
                border: "none",
                color: "var(--ps-text-secondary)",
                fontSize: "14px",
                cursor: "pointer",
                padding: "8px 0",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "Space Grotesk",
                marginBottom: "16px",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ps-text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ps-text-secondary)")}
            >
              ‹ Back to Home Menu
            </button>
          )}
          {isPlayingStarted && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                <span style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "22px",
                  fontWeight: 850,
                  letterSpacing: "-0.04em",
                  color: "var(--ps-text-primary)",
                }}>
                  Prompt
                </span>
                <span style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "22px",
                  fontWeight: 300,
                  fontStyle: "italic",
                  letterSpacing: "-0.03em",
                  color: "var(--ps-teal)",
                  paddingRight: "4px",
                }}>
                  Shot
                </span>
                <span style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "var(--ps-amber)",
                  alignSelf: "flex-end",
                  marginBottom: "5px",
                }} />
              </div>
            </div>
          )}

          {/* Landing View: Play Challenge Button */}
          {gameState === "challenge" && !isPlayingStarted && (
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
              {/* Premium Animated SVG Target & Bow/Arrow */}
              <div style={{ width: "160px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ overflow: "visible" }}>
                  {/* Animated Ripple Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="14"
                    fill="none"
                    stroke="var(--ps-amber)"
                    style={{
                      animation: "ripple-expand 4.5s ease-out infinite",
                      transformOrigin: "80px 80px",
                    }}
                  />
                  
                  {/* Target Base (wobbles on impact) */}
                  <g style={{ animation: "target-wobble 4.5s ease-out infinite", transformOrigin: "80px 80px" }}>
                    {/* Outer Dashed Ring */}
                    <circle cx="80" cy="80" r="56" fill="none" stroke="rgba(20, 184, 166, 0.15)" strokeWidth="1.5" strokeDasharray="6 4" />
                    {/* Middle Teal Ring */}
                    <circle cx="80" cy="80" r="42" fill="none" stroke="var(--ps-teal)" strokeWidth="3" />
                    {/* Inner Primary Dashed Ring */}
                    <circle cx="80" cy="80" r="28" fill="none" stroke="var(--ps-text-primary)" strokeWidth="1.5" strokeDasharray="4 3" />
                    {/* Center Amber Bullseye */}
                    <circle cx="80" cy="80" r="14" fill="var(--ps-amber)" />
                    {/* Innermost dot */}
                    <circle cx="80" cy="80" r="5" fill="#000" />
                  </g>

                  {/* Arrow (shoots in) */}
                  <g
                    id="arrow-group"
                    style={{
                      animation: "arrow-shoot 4.5s infinite",
                      transformOrigin: "0px 0px",
                    }}
                  >
                    {/* Arrow Shaft */}
                    <line x1="-32" y1="0" x2="-2" y2="0" stroke="var(--ps-text-primary)" strokeWidth="2" strokeLinecap="round" />
                    {/* Arrow Fletching (Teal feathers) */}
                    <path d="M -32 -5 L -24 0 L -32 5 L -37 5 L -30 0 L -37 -5 Z" fill="var(--ps-teal)" />
                    {/* Arrow Head (Amber tip) */}
                    <polygon points="0,0 -8,-4 -6,0 -8,4" fill="var(--ps-amber)" />
                  </g>
                </svg>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "2px", justifyContent: "center", marginBottom: "12px" }}>
                <span style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "36px",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "var(--ps-text-primary)",
                }}>
                  Prompt
                </span>
                <span style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "36px",
                  fontWeight: 400,
                  fontStyle: "italic",
                  letterSpacing: "-0.03em",
                  color: "var(--ps-teal)",
                  paddingRight: "6px",
                }}>
                  Shot
                </span>
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--ps-amber)",
                  alignSelf: "flex-end",
                  marginBottom: "8px",
                }} />
              </div>
              
              <p
                style={{
                  fontSize: "var(--ps-text-body)",
                  color: "var(--ps-text-secondary)",
                  maxWidth: "320px",
                  lineHeight: "1.6",
                  marginBottom: "32px",
                }}
              >
                Can you shoot a perfect prompt? Stop chatting with AI like it's your therapist and get the output in one clean shot. Thirsty data centers are counting on you.
              </p>

              {/* Difficulty Segmented Selector */}
              <div style={{ marginBottom: "24px", width: "100%", maxWidth: "280px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--ps-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontFamily: "var(--ps-font-mono)",
                    marginBottom: "8px",
                    textAlign: "center",
                  }}
                >
                  Select Level
                </div>
                <div
                  style={{
                    display: "flex",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--ps-border)",
                    borderRadius: "24px",
                    padding: "4px",
                    gap: "4px",
                  }}
                >
                  {(["BEGINNER", "PRO", "EXPERT"] as const).map((d) => {
                    const isSelected = difficulty === d;
                    return (
                      <button
                        key={d}
                        onClick={() => handleDifficultyChange(d)}
                        style={{
                          flex: 1,
                          height: "32px",
                          background: isSelected ? "var(--ps-amber)" : "transparent",
                          color: isSelected ? "#000" : "var(--ps-text-secondary)",
                          border: "none",
                          borderRadius: "20px",
                          fontSize: "10px",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          fontFamily: "Space Grotesk",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {hasPlayedToday ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", alignItems: "center" }}>
                  <button
                    onClick={handlePlaySandbox}
                    style={{
                      width: "100%",
                      maxWidth: "280px",
                      height: "52px",
                      background: "var(--ps-amber)",
                      color: "#000",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                      fontFamily: "Space Grotesk",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    Practice in Sandbox Mode
                  </button>
                  <button
                    onClick={() => transitionToState("already-played")}
                    style={{
                      width: "100%",
                      maxWidth: "280px",
                      height: "52px",
                      background: "transparent",
                      color: "var(--ps-text-primary)",
                      border: "1px solid var(--ps-border)",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      fontFamily: "Space Grotesk",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.borderColor = "var(--ps-amber)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "var(--ps-border)";
                    }}
                  >
                    View Today's Results
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsSandboxMode(false);
                    setIsPlayingStarted(true);
                  }}
                  style={{
                    width: "100%",
                    maxWidth: "280px",
                    height: "52px",
                    background: "var(--ps-amber)",
                    color: "#000",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "transform 0.15s ease",
                    fontFamily: "Space Grotesk",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  Play Today's Challenge
                </button>
              )}

              <div
                style={{
                  marginTop: "40px",
                  fontSize: "var(--ps-text-caption)",
                  color: "var(--ps-text-secondary)",
                  fontFamily: "var(--ps-font-mono)",
                  lineHeight: "1.6",
                }}
              >
                💡 Fun Fact: Every sloppy, wordy prompt makes an AI server sweat and drink more water.<br />
                <span style={{ color: "var(--ps-teal)", fontWeight: 600 }}>Teal tracks Eco-savings</span> · <span style={{ color: "var(--ps-amber)", fontWeight: 600 }}>Amber tracks your Score</span>
              </div>
            </div>
          )}

          {isPlayingStarted && isChallengeLoading && <LoadingSkeleton />}

          {isPlayingStarted && challenge && (
            <div style={{ background: "var(--ps-surface)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <span style={{ background: "var(--ps-teal)", color: "#000", padding: "4px 12px", borderRadius: "9999px", fontSize: "var(--ps-text-caption)", fontWeight: 600 }}>
                  {challenge.category}
                </span>
                <span style={{ background: "rgba(245,158,11,0.15)", color: "var(--ps-amber)", padding: "4px 12px", borderRadius: "9999px", fontSize: "var(--ps-text-caption)", fontWeight: 600 }}>
                  {challenge.difficulty}
                </span>
              </div>
              <div style={{ color: "var(--ps-text-secondary)", fontSize: "var(--ps-text-secondary-size)", marginBottom: "8px" }}>
                Today's target output
              </div>
              <div
                style={{
                  maxHeight: "240px",
                  overflow: "auto",
                  background: "#0A0A0A",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  fontFamily: challenge.category === "CODE" ? "var(--ps-font-mono)" : "Space Grotesk",
                  fontSize: "var(--ps-text-secondary-size)",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {challenge.target_output}
              </div>
              <div style={{ color: "var(--ps-text-secondary)", fontSize: "var(--ps-text-caption)" }}>
                {challenge.char_count} characters
              </div>
            </div>
          )}

          {gameState === "challenge" && isPlayingStarted && challenge && (
            <>
              <div style={{ color: "var(--ps-text-secondary)", fontSize: "var(--ps-text-secondary-size)", marginBottom: "8px" }}>
                Write the prompt that generates this:
              </div>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Describe exactly what you want the AI to produce..."
                style={{
                  width: "100%",
                  minHeight: "140px",
                  background: "#0A0A0A",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "var(--ps-text-primary)",
                  fontSize: "var(--ps-text-body)",
                  fontFamily: "var(--ps-font-mono)",
                  resize: "vertical",
                  marginBottom: "8px",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "var(--ps-text-caption)", color: getBrevityColor(userPrompt.length) }}>
                  {userPrompt.length} characters
                </span>
                <span style={{ fontSize: "var(--ps-text-caption)", color: "var(--ps-text-secondary)" }}>
                  Shorter prompts score higher on brevity
                </span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!userPrompt.trim()}
                style={{
                  width: "100%",
                  height: "48px",
                  background: userPrompt.trim() ? "var(--ps-amber)" : "#444",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "var(--ps-text-body)",
                  fontWeight: 600,
                  cursor: userPrompt.trim() ? "pointer" : "not-allowed",
                  transition: "background 0.2s",
                }}
              >
                Shoot →
              </button>
            </>
          )}

          {gameState === "loading" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  margin: "0 auto 16px",
                  border: "3px solid var(--ps-amber)",
                  borderRadius: "50%",
                  borderTopColor: "transparent",
                  animation: "spin 1.2s linear infinite",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ color: "var(--ps-text-secondary)", fontSize: "var(--ps-text-secondary-size)" }}>
                Analyzing your shot...
              </div>
            </div>
          )}

          {(gameState === "results" || gameState === "impact") && score && (
            <>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <svg width="200" height="200" viewBox="0 0 200 200" style={{ margin: "0 auto" }}>
                  <circle cx="100" cy="100" r="85" fill="none" stroke="#222" strokeWidth="12" />
                  <circle cx="100" cy="100" r="85" fill="none" stroke="var(--ps-amber)" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 85}`}
                    strokeDashoffset={`${2 * Math.PI * 85 * (1 - score.accuracy / 100)}`}
                    transform="rotate(-90 100 100)"
                    style={{ transition: animateScore ? "stroke-dashoffset 0.8s ease-out 0s" : "none" }}
                  >
                    <title>Accuracy: {score.accuracy}/100</title>
                  </circle>
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#222" strokeWidth="12" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="var(--ps-amber)" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - score.format / 100)}`}
                    transform="rotate(-90 100 100)"
                    style={{ transition: animateScore ? "stroke-dashoffset 0.8s ease-out 0.2s" : "none" }}
                  >
                    <title>Format: {score.format}/100</title>
                  </circle>
                  <circle cx="100" cy="100" r="35" fill="none" stroke="#222" strokeWidth="12" />
                  <circle cx="100" cy="100" r="35" fill="none" stroke="var(--ps-amber)" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - score.brevity / 100)}`}
                    transform="rotate(-90 100 100)"
                    style={{ transition: animateScore ? "stroke-dashoffset 0.8s ease-out 0.4s" : "none" }}
                  >
                    <title>Brevity: {score.brevity}/100</title>
                  </circle>
                  <text x="100" y="95" textAnchor="middle" fill="var(--ps-text-primary)" fontSize="40" fontWeight="600">{score.total}</text>
                  <text x="100" y="115" textAnchor="middle" fill="var(--ps-text-secondary)" fontSize="20">/300</text>
                </svg>
                <div style={{ fontSize: "var(--ps-text-subhead)", color: "var(--ps-amber)", marginTop: "16px", fontWeight: 600 }}>
                  {getScoreLabel(score.total)}
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                {[
                  {
                    label: "Accuracy",
                    value: score.accuracy,
                    tooltip: "Measures how well your prompt captures the required semantic details, meaning, and nuances of the target output."
                  },
                  {
                    label: "Format",
                    value: score.format,
                    tooltip: "Evaluates whether your prompt correctly enforces structural constraints, length limits, styling, and output type specified in the target."
                  },
                  {
                    label: "Brevity",
                    value: score.brevity,
                    tooltip: "Measures prompt efficiency. Shorter prompts receive higher scores (100 pts for <60 chars, scaling down to 20 pts for >300 chars)."
                  },
                ].map((item) => (
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
                    <div
                      style={{
                        fontFamily: "Space Grotesk",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "var(--ps-teal)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Did you know? 🌍
                    </div>
                    
                    <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6", color: "var(--ps-text-primary)" }}>
                      Every time we ask AI a question, massive computer servers work in the background to generate answers. This process consumes electricity and requires fresh water to cool the hot servers down.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        background: "rgba(255, 255, 255, 0.03)",
                        padding: "16px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        marginTop: "4px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", color: "var(--ps-text-primary)", fontWeight: 600, marginBottom: "6px" }}>
                          Your prompt used:
                        </div>
                        <div style={{ fontSize: "14px", color: "var(--ps-teal)", fontWeight: 700 }}>
                          💧 {score.waterMl}ml of water
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginTop: "4px" }}>
                          ({getWaterComparison(score.waterMl)})
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", marginTop: "2px" }}>
                          🌲 ≈ {score.co2Grams.toFixed(2)}g of CO₂ generated
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <WaterGlass waterMl={score.waterMl} />
                        <span style={{ fontSize: "11px", color: "var(--ps-text-secondary)", fontWeight: 600 }}>
                          {score.waterMl}ml
                        </span>
                      </div>
                    </div>

                    {score.total < 180 ? (
                      <div
                        style={{
                          background: "rgba(245, 158, 11, 0.05)",
                          borderLeft: "3px solid var(--ps-amber)",
                          padding: "12px 14px",
                          borderRadius: "6px",
                          marginTop: "4px",
                        }}
                      >
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--ps-amber)", marginBottom: "4px" }}>
                          Why a higher score matters:
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", lineHeight: "1.5" }}>
                          A lower accuracy/format score means you would typically need 3+ follow-up corrections. Retrying multiplies your footprint by another tablespoon or more!
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: "rgba(20, 184, 166, 0.05)",
                          borderLeft: "3px solid var(--ps-teal)",
                          padding: "12px 14px",
                          borderRadius: "6px",
                          marginTop: "4px",
                        }}
                      >
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--ps-teal)", marginBottom: "4px" }}>
                          Excellent "One-Shot" Prompt!
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", lineHeight: "1.5" }}>
                          By writing a precise instruction, you got the target output on the first try. This prevented extra retries and saved precious water!
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
                      <div>
                        <div style={{ fontFamily: "Space Grotesk", fontSize: "11px", fontWeight: 600, color: "var(--ps-teal)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                          Lifetime Savings
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--ps-text-primary)", fontWeight: 500 }}>
                          💧 {personalSavings.waterMl >= 1000 ? `${(personalSavings.waterMl / 1000).toFixed(2)}L` : `${personalSavings.waterMl}ml`}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--ps-text-secondary)" }}>
                          🌲 {personalSavings.co2Grams >= 1000 ? `${(personalSavings.co2Grams / 1000).toFixed(2)}kg` : `${personalSavings.co2Grams.toFixed(1)}g`} CO₂
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "Space Grotesk", fontSize: "11px", fontWeight: 600, color: "var(--ps-teal)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                          Community Savings
                        </div>
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

              {showAutoIdeal && idealPrompt && (
                <div style={{ marginBottom: "24px", animation: "slideUp 0.4s ease-out" }}>
                  <div style={{ fontSize: "14px", color: "#888880", marginBottom: "12px" }}>
                    Here's what a strong prompt looks like
                  </div>
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

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "16px" }}>
                <button
                  onClick={handleShare}
                  style={{
                    width: "100%",
                    height: "48px",
                    background: "var(--ps-amber)",
                    border: "none",
                    color: "#000",
                    borderRadius: "8px",
                    fontSize: "var(--ps-text-secondary-size)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Share result
                </button>

                {isSandboxMode && (
                  <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                    <button
                      onClick={() => {
                        setUserPrompt("");
                        setScore(null);
                        transitionToState("challenge");
                      }}
                      style={{
                        flex: 1,
                        height: "48px",
                        background: "transparent",
                        border: "1px solid var(--ps-border)",
                        color: "var(--ps-text-primary)",
                        borderRadius: "8px",
                        fontSize: "var(--ps-text-secondary-size)",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        fontFamily: "Space Grotesk",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor = "var(--ps-amber)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "var(--ps-border)";
                      }}
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleBackToMenu}
                      style={{
                        flex: 1,
                        height: "48px",
                        background: "transparent",
                        border: "1px solid var(--ps-border)",
                        color: "var(--ps-text-primary)",
                        borderRadius: "8px",
                        fontSize: "var(--ps-text-secondary-size)",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        fontFamily: "Space Grotesk",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor = "var(--ps-amber)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "var(--ps-border)";
                      }}
                    >
                      Back to Menu
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} session={session} />
      <LearnPanel isOpen={showLearnPanel} onClose={() => setShowLearnPanel(false)} />
    </>
  );
}