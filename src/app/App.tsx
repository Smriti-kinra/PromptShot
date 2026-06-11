import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Challenge } from "../lib/supabase";
import { calculateAndUpdateStreak } from "../lib/streak";
import { LearnPanel } from "./components/LearnPanel";
import { Topbar } from "./components/Topbar";
import { useGameState } from "../hooks/useGameState";
import { scorePrompt, simulateScore, mockScore } from "../lib/scorer";
import type { ScoreResult } from "../lib/scorer";

// ─── hooks ────────────────────────────────────────────────────────────────────

function useCountdownToMidnight() {
  const getTimeLeft = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const ms = midnight.getTime() - now.getTime();
    const totalMinutes = Math.floor(ms / 60000);
    return { h: Math.floor(totalMinutes / 60), m: totalMinutes % 60 };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 60000);
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

// ─── already-played screen ────────────────────────────────────────────────────

function AlreadyPlayed({
  score,
  challenge,
  onOpenLearn,
}: {
  score: ScoreResult | null;
  challenge: Challenge | null;
  onOpenLearn: () => void;
}) {
  const { h, m } = useCountdownToMidnight();

  const bars = [
    { label: "Accuracy", value: score?.accuracy ?? 0 },
    { label: "Format", value: score?.format ?? 0 },
    { label: "Brevity", value: score?.brevity ?? 0 },
  ];

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        background: "var(--ps-background)",
        color: "var(--ps-text-primary)",
        minHeight: "calc(100vh - 56px)",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
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
                <div key={item.label} style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                      fontSize: "var(--ps-text-secondary-size)",
                    }}
                  >
                    <span style={{ color: "var(--ps-text-secondary)" }}>{item.label}</span>
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
            Next challenge in {h}h {m}m
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={onOpenLearn}
              style={{
                background: "none",
                border: "none",
                color: "#F59E0B",
                fontSize: "14px",
                cursor: "pointer",
                padding: 0,
                textDecoration: "none",
              }}
            >
              Review your prompting technique →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── main helper ──────────────────────────────────────────────────────────────

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

async function loadChallenge(difficulty: string, selectFields: string): Promise<Challenge | null> {
  const dayOfYear = getDayOfYear(new Date());
  const { data } = await supabase
    .from("challenges")
    .select(selectFields)
    .eq("difficulty", difficulty)
    .eq("active", true)
    .order("id");
  if (!data || data.length === 0) return null;
  return data[dayOfYear % data.length];
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

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [difficulty, setDifficulty] = useState<string>(
    () => localStorage.getItem("promptshot_difficulty") ?? "BEGINNER",
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
    localStorage.setItem("promptshot_difficulty", difficulty);
  }, [difficulty]);

  useEffect(() => {
    if (sessionLoading) return;
    setChallenge(null);
    setScore(null);
    setIdealPrompt("");
    setShowAutoIdeal(false);
    setAnimateScore(false);
    setUserPrompt("");

    (async () => {
      const today = new Date().toISOString().split("T")[0];
      let hasPlayed = false;

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
      } else {
        setStreak(parseInt(localStorage.getItem("promptshot_streak") ?? "0", 10));
        const todayEntry = getLocalHistory().find((s) => s.played_at === today);
        if (todayEntry) hasPlayed = true;
      }

      // Secure retrieval: fetch ideal_prompt only if they have already played today
      const selectFields = hasPlayed
        ? "id, category, difficulty, target_output, ideal_prompt, char_count, active"
        : "id, category, difficulty, target_output, char_count, active";

      const ch = await loadChallenge(difficulty, selectFields);
      setChallenge(ch);

      if (!ch) {
        setGameState("challenge");
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
          setGameState("already-played");
        } else {
          setGameState("challenge");
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
          setGameState("already-played");
        } else {
          setGameState("challenge");
        }
      }
    })();
  }, [session, difficulty, sessionLoading]);

  const handleDifficultyChange = (d: string) => {
    setDifficulty(d);
  };

  const handleSubmit = async () => {
    if (!userPrompt.trim() || !challenge) return;
    setGameState("loading");

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
    } else {
      result = await simulateScore(userPrompt, challenge.id);

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

    setScore(result);
    if (result.idealPrompt) {
      setIdealPrompt(result.idealPrompt);
    }
    setGameState("results");
    setTimeout(() => setAnimateScore(true), 100);
    
    // Automatically transition results -> impact after 2000ms
    setTimeout(() => {
      setGameState("impact");
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
      difficulty={difficulty}
      onDifficultyChange={handleDifficultyChange}
      onOpenLearn={() => setShowLearnPanel(true)}
      showHint={showHint}
      onToggleHint={() => setShowHint((v) => !v)}
    />
  );

  const contentStyle: React.CSSProperties = {
    fontFamily: "Inter, sans-serif",
    background: "var(--ps-background)",
    color: "var(--ps-text-primary)",
    minHeight: "calc(100vh - 56px)",
    padding: "24px",
  };

  if (gameState === "already-played") {
    return (
      <>
        {topbar}
        <AlreadyPlayed
          score={score}
          challenge={challenge}
          onOpenLearn={() => setShowLearnPanel(true)}
        />
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

          {isChallengeLoading && <LoadingSkeleton />}

          {challenge && (
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
                }}
              >
                {challenge.target_output}
              </div>
              <div style={{ color: "var(--ps-text-secondary)", fontSize: "var(--ps-text-caption)" }}>
                {challenge.char_count} characters
              </div>
            </div>
          )}

          {gameState === "challenge" && challenge && (
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
                  />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#222" strokeWidth="12" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="var(--ps-amber)" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - score.format / 100)}`}
                    transform="rotate(-90 100 100)"
                    style={{ transition: animateScore ? "stroke-dashoffset 0.8s ease-out 0.2s" : "none" }}
                  />
                  <circle cx="100" cy="100" r="35" fill="none" stroke="#222" strokeWidth="12" />
                  <circle cx="100" cy="100" r="35" fill="none" stroke="var(--ps-amber)" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - score.brevity / 100)}`}
                    transform="rotate(-90 100 100)"
                    style={{ transition: animateScore ? "stroke-dashoffset 0.8s ease-out 0.4s" : "none" }}
                  />
                  <text x="100" y="95" textAnchor="middle" fill="var(--ps-text-primary)" fontSize="40" fontWeight="600">{score.total}</text>
                  <text x="100" y="115" textAnchor="middle" fill="var(--ps-text-secondary)" fontSize="20">/300</text>
                </svg>
                <div style={{ fontSize: "var(--ps-text-subhead)", color: "var(--ps-amber)", marginTop: "16px", fontWeight: 600 }}>
                  {getScoreLabel(score.total)}
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                {[
                  { label: "Accuracy", value: score.accuracy },
                  { label: "Format", value: score.format },
                  { label: "Brevity", value: score.brevity },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "var(--ps-text-secondary-size)" }}>
                      <span style={{ color: "var(--ps-text-secondary)" }}>{item.label}</span>
                      <span style={{ color: "var(--ps-text-primary)" }}>{item.value}/100</span>
                    </div>
                    <div style={{ height: "4px", background: "#222", borderRadius: "9999px", overflow: "hidden" }}>
                      <div style={{ width: `${item.value}%`, height: "100%", background: "var(--ps-amber)", transition: animateScore ? "width 0.6s ease-out" : "none" }} />
                    </div>
                  </div>
                ))}
              </div>

              {gameState === "impact" && (
                <div style={{ background: "var(--ps-surface)", borderLeft: "4px solid var(--ps-teal)", padding: "24px", borderRadius: "8px", marginBottom: "24px", animation: "slideUp 0.6s ease-out forwards" }}>
                  <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }`}</style>
                  <div style={{ marginBottom: "8px", fontSize: "var(--ps-text-secondary-size)" }}>
                    This prompt used <span style={{ color: "var(--ps-teal)", fontWeight: 600 }}>1</span> API call
                  </div>
                  <div style={{ marginBottom: score.total < 180 ? "16px" : "0", fontSize: "var(--ps-text-secondary-size)", color: "var(--ps-text-secondary)" }}>
                    ≈ <span style={{ color: "var(--ps-teal)" }}>{score.waterMl}ml</span> water · ≈ <span style={{ color: "var(--ps-teal)" }}>{score.co2Grams}g</span> CO₂
                  </div>
                  {score.total < 180 && (
                    <>
                      <div style={{ marginBottom: "8px", fontSize: "var(--ps-text-secondary-size)" }}>
                        A score this low typically means 3+ follow-up prompts to reach this output
                      </div>
                      <div style={{ marginBottom: "16px", fontSize: "var(--ps-text-secondary-size)" }}>
                        That adds ≈ 30ml water — about <span style={{ color: "var(--ps-amber)", fontWeight: 600 }}>a tablespoon</span>
                      </div>
                    </>
                  )}
                  <div style={{ fontSize: "var(--ps-text-caption)", color: "var(--ps-text-secondary)", fontStyle: "italic" }}>
                    Better prompts = less AI = less water. This is the skill.
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

              <button
                onClick={handleShare}
                style={{ width: "100%", height: "48px", background: "var(--ps-amber)", border: "none", color: "#000", borderRadius: "8px", fontSize: "var(--ps-text-secondary-size)", fontWeight: 600, cursor: "pointer" }}
              >
                Share result
              </button>
            </>
          )}
        </div>
      </div>
      <LearnPanel isOpen={showLearnPanel} onClose={() => setShowLearnPanel(false)} />
    </>
  );
}