import { useState } from "react";
import { supabase } from "../lib/supabase";

export const STORAGE_KEYS = {
  STREAK: "promptshot_streak",
  LAST_PLAYED: "promptshot_last_played",
  HISTORY: "promptshot_history",
} as const;

export interface LocalScore {
  played_at: string;
  accuracy: number;
  format: number;
  brevity: number;
  total: number;
  challenge_id?: string;
  user_prompt?: string;
}

export type GameState = "challenge" | "loading" | "results" | "impact" | "already-played";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>("challenge");
  const [streak, setStreak] = useState<number>(0);

  const getLocalHistory = (): LocalScore[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) ?? "[]");
    } catch {
      return [];
    }
  };

  const saveLocalScore = (entry: LocalScore) => {
    const history = getLocalHistory();
    history.push(entry);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  };

  const calculateLocalStreak = (): number => {
    const history = getLocalHistory();
    if (!history.length) return 1;

    const today = new Date().toISOString().split("T")[0];
    const dates = [...new Set(history.map((s) => s.played_at))].sort().reverse();

    let calculatedStreak = 0;
    let expected = today;

    for (const date of dates) {
      if (date === expected) {
        calculatedStreak++;
        const d = new Date(expected);
        d.setDate(d.getDate() - 1);
        expected = d.toISOString().split("T")[0];
      } else {
        break;
      }
    }

    localStorage.setItem(STORAGE_KEYS.STREAK, String(calculatedStreak));
    localStorage.setItem(STORAGE_KEYS.LAST_PLAYED, today);
    setStreak(calculatedStreak);
    return calculatedStreak;
  };

  const migrateLocalScoresToSupabase = async (userId: string) => {
    const history = getLocalHistory();
    if (!history.length) return;

    const rows = history.map((s) => ({
      user_id: userId,
      challenge_id: s.challenge_id ?? null,
      accuracy: s.accuracy,
      format: s.format,
      brevity: s.brevity,
      total: s.total,
      user_prompt: s.user_prompt ?? "",
      played_at: s.played_at,
    }));

    await supabase.from("scores").upsert(rows, { onConflict: "user_id,played_at" });

    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.STREAK);
    localStorage.removeItem(STORAGE_KEYS.LAST_PLAYED);
  };

  return {
    gameState,
    setGameState,
    streak,
    setStreak,
    getLocalHistory,
    saveLocalScore,
    calculateLocalStreak,
    migrateLocalScoresToSupabase,
  };
}
