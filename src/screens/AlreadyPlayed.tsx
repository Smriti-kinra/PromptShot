import { useState } from "react";
import type { Challenge } from "../lib/supabase";
import type { ScoreResult } from "../lib/scorer";

import { ResultsScreen } from "./ResultsScreen";
import { AdmireScreen } from "./AdmireScreen";

interface AlreadyPlayedProps {
  score: ScoreResult | null;
  challenge: Challenge | null;
  personalSavings: { waterMl: number; co2Grams: number };
  communitySavings: { waterLiters: number; co2Kg: number };
  userPrompt?: string;
  idealPrompt?: string;
}

// AdmireSplash replaced by `AdmireScreen` component (see src/screens/AdmireScreen.tsx)

function AdmireStats({ score, challenge, personalSavings, communitySavings, userPrompt, idealPrompt }: AlreadyPlayedProps) {
  const defaultScore = score ?? { accuracy: 0, format: 0, brevity: 0, total: 0, waterMl: 0, co2Grams: 0 };
  return (
    <div style={{ padding: "16px", borderRadius: "14px", border: "4px solid rgba(20,184,166,0.95)", background: "rgba(20,184,166,0.06)" }}>
      <ResultsScreen
        score={defaultScore}
        gameState={"impact"}
        animateScore={false}
        showAutoIdeal={!!idealPrompt}
        idealPrompt={idealPrompt ?? ""}
        userPrompt={userPrompt ?? ""}
        personalSavings={personalSavings}
        communitySavings={communitySavings}
        onShare={() => {}}
        onBackToMenu={() => {}}
        challenge={challenge}
      />
    </div>
  );
}

export function AlreadyPlayed({ score, challenge, personalSavings, communitySavings, userPrompt = "", idealPrompt = "" }: AlreadyPlayedProps) {
  const [phase, setPhase] = useState<"splash" | "stats">("splash");

  if (phase === "splash") return <AdmireScreen onAdmire={() => setPhase("stats")} />;

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
