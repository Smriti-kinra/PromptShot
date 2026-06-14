import { useState, useEffect, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { calculateAndUpdateStreak } from "../lib/streak";
import { LearnPanel } from "./components/LearnPanel";
import { LeaderboardModal } from "./components/LeaderboardModal";
import { Topbar } from "./components/Topbar";
import { useGameState } from "../hooks/useGameState";
import { scorePrompt, simulateScore, mockScore } from "../lib/scorer";
import type { ScoreResult } from "../lib/scorer";
import { safeStorage } from "../lib/safeStorage";
import { loadChallenge } from "../lib/gameUtils";

// ─── screens ──────────────────────────────────────────────────────────────────
import { AlreadyPlayed } from "./screens/AlreadyPlayed";
import { LandingScreen } from "./screens/LandingScreen";
import { ChallengeScreen } from "./screens/ChallengeScreen";
import { ResultsScreen } from "./screens/ResultsScreen";

// ─── Toast Notification ───────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#121C14",
        border: "1px solid var(--ps-border)",
        color: "var(--ps-text-primary)",
        padding: "10px 20px",
        borderRadius: "9999px",
        fontSize: "14px",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
        fontWeight: 600,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        animation: "slideUp 0.25s ease-out",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "var(--ps-teal)" }}>✓</span>
      {message}
    </div>
  );
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

  // View Transitions API wrapper
  const transitionToState = (newState: typeof gameState) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => { setGameState(newState); });
    } else {
      setGameState(newState);
    }
  };

  const [personalSavings, setPersonalSavings] = useState<{ waterMl: number; co2Grams: number }>({ waterMl: 0, co2Grams: 0 });
  // Baseline is demo data seeded at launch; real community deltas are added on top
  const [communitySavings, setCommunitySavings] = useState<{ waterLiters: number; co2Kg: number }>({ waterLiters: 12450, co2Kg: 124.5 });

  const [challenge, setChallenge] = useState<import("../lib/supabase").Challenge | null>(null);
  const [isPlayingStarted, setIsPlayingStarted] = useState(false);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
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
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToastMsg(null), []);
  // Incremented each time the leaderboard modal opens — forces a fresh fetch
  const [leaderboardOpenCount, setLeaderboardOpenCount] = useState(0);

  useEffect(() => {
    // Get initial session — this resolves quickly if a cookie exists
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
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

    (async () => {
      const today = new Date().toISOString().split("T")[0];
      let hasPlayed = false;
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
        console.debug("[PromptShot] Guest init — today:", today, "history:", history, "todayEntry:", todayEntry);
        if (todayEntry) hasPlayed = true;

        history.forEach((s) => {
          localSavedWater += (50 - (s.waterMl ?? 10));
          localSavedCo2 += (0.5 - (s.co2Grams ?? 0.1));
        });
      }

      console.debug("[PromptShot] Init — hasPlayed:", hasPlayed, "→ routing to:", hasPlayed ? "already-played" : "challenge");

      setPersonalSavings({ waterMl: Math.max(0, localSavedWater), co2Grams: Math.max(0, localSavedCo2) });
      setHasPlayedToday(hasPlayed);

      // Fetch global community savings
      let globalWaterMl = 0;
      let globalCo2G = 0;
      try {
        const { data: allScores, error } = await supabase.from("scores").select("water_ml, co2_grams");
        if (!error && allScores) {
          allScores.forEach((s) => {
            globalWaterMl += (50 - (s.water_ml ?? 10));
            globalCo2G += (0.5 - (s.co2_grams ?? 0.1));
          });
        }
      } catch (err) {
        console.error("Error fetching global scores:", err);
      }

      setCommunitySavings({ waterLiters: 12450 + (globalWaterMl / 1000), co2Kg: 124.5 + (globalCo2G / 1000) });

      // Secure: only include ideal_prompt if already played
      const selectFields = hasPlayed
        ? "id, category, difficulty, target_output, ideal_prompt, char_count, active"
        : "id, category, difficulty, target_output, char_count, active";

      const ch = await loadChallenge(difficulty, selectFields);
      setChallenge(ch);

      if (!ch) { transitionToState("challenge"); return; }
      if (ch.ideal_prompt) setIdealPrompt(ch.ideal_prompt);

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

      transitionToState(hasPlayed ? "already-played" : "challenge");
    })();
  }, [session, difficulty, sessionLoading]);

  const handleDifficultyChange = (d: string) => setDifficulty(d);

  const handleBackToMenu = () => {
    setIsPlayingStarted(false);
    // If the user already completed today's challenge, send them to the stats screen
    // rather than the landing challenge view
    if (hasPlayedToday) {
      transitionToState("already-played");
    } else {
      transitionToState("challenge");
    }
  };

  const handleSubmit = async () => {
    if (!userPrompt.trim() || !challenge) return;
    transitionToState("loading");

    let result: ScoreResult;

    if (session) {
      try {
        result = await scorePrompt(userPrompt, challenge.id, session.access_token);
      } catch (err) {
        console.error("Scoring error, using local fallback:", err);
        result = mockScore(userPrompt);
      }

      const today = new Date().toISOString().split("T")[0];
      const { error: insertErr } = await supabase.from("scores").insert({
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
      console.debug("[PromptShot] Score insert result — error:", insertErr, "played_at:", today);

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
    if (result.idealPrompt) setIdealPrompt(result.idealPrompt);

    const savedWaterThisTurn = 50 - result.waterMl;
    const savedCo2ThisTurn = 0.5 - result.co2Grams;
    setPersonalSavings((prev) => ({ waterMl: prev.waterMl + savedWaterThisTurn, co2Grams: prev.co2Grams + savedCo2ThisTurn }));
    setCommunitySavings((prev) => ({ waterLiters: prev.waterLiters + (savedWaterThisTurn / 1000), co2Kg: prev.co2Kg + (savedCo2ThisTurn / 1000) }));
    setHasPlayedToday(true);

    transitionToState("results");
    setTimeout(() => setAnimateScore(true), 100);
    setTimeout(() => { transitionToState("impact"); }, 2000);

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
    tryClipboard().then(() => setToastMsg("Result copied to clipboard"));
  };

  const topbar = (
    <Topbar
      session={session}
      streak={streak}
      onOpenLearn={() => setShowLearnPanel(true)}
      onOpenLeaderboard={() => {
        setLeaderboardOpenCount((c) => c + 1);
        setShowLeaderboard(true);
      }}
      showHint={showHint}
      onToggleHint={() => setShowHint((v) => !v)}
      hasPlayedToday={hasPlayedToday}
      onStartPlay={() => {
        setIsPlayingStarted(true);
        setUserPrompt("");
        setScore(null);
        transitionToState("challenge");
      }}
    />
  );

  const modals = (
    <>
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        session={session}
        openCount={leaderboardOpenCount}
      />
      <LearnPanel isOpen={showLearnPanel} onClose={() => setShowLearnPanel(false)} />
      {toastMsg && <Toast message={toastMsg} onDone={dismissToast} />}
    </>
  );

  const isEcoState = gameState === "impact" || gameState === "results" || gameState === "already-played";
  const contentStyle: React.CSSProperties = {
    fontFamily: "Space Grotesk, system-ui, sans-serif",
    background: isEcoState ? "#0E1E14" : "var(--ps-background)",
    color: "var(--ps-text-primary)",
    minHeight: "100vh",
    padding: "24px",
    transition: "background 1.5s ease-in-out",
    boxSizing: "border-box",
  };

  // ── already-played flow ───────────────────────────────────────────────────────
  if (gameState === "already-played") {
    return (
      <>
        {topbar}
        <AlreadyPlayed
          score={score}
          challenge={challenge}
          personalSavings={personalSavings}
          communitySavings={communitySavings}
        />
        {modals}
      </>
    );
  }

  // ── main flow ─────────────────────────────────────────────────────────────────
  return (
    <>
      {topbar}
      <div style={contentStyle}>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>

          {/* Landing: no active play session */}
          {gameState === "challenge" && !isPlayingStarted && (
            <LandingScreen
              difficulty={difficulty}
              hasPlayedToday={hasPlayedToday}
              onDifficultyChange={handleDifficultyChange}
              onPlay={() => { setIsPlayingStarted(true); }}
            />
          )}

          {/* Active challenge / loading */}
          {isPlayingStarted && (
            <ChallengeScreen
              challenge={challenge}
              gameState={gameState}
              userPrompt={userPrompt}
              isLoading={!challenge}
              onPromptChange={setUserPrompt}
              onSubmit={handleSubmit}
              onBack={handleBackToMenu}
            />
          )}

          {/* Results + impact */}
          {(gameState === "results" || gameState === "impact") && score && (
            <ResultsScreen
              score={score}
              gameState={gameState}
              animateScore={animateScore}
              showAutoIdeal={showAutoIdeal}
              idealPrompt={idealPrompt}
              userPrompt={userPrompt}
              personalSavings={personalSavings}
              communitySavings={communitySavings}
              onShare={handleShare}
              onBackToMenu={handleBackToMenu}
            />
          )}

        </div>
      </div>
      {modals}
    </>
  );
}