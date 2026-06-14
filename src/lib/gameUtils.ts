import { supabase } from "./supabase";
import type { Challenge } from "./supabase";
import { DAILY_CHALLENGES } from "../data/challenges";

// ─── score display helpers ─────────────────────────────────────────────────────

export function getScoreLabel(total: number): string {
  if (total > 80) return "Bullseye 🎯";
  if (total >= 60) return "On target";
  if (total >= 40) return "Close range";
  return "Missed";
}

export function getBrevityColor(length: number): string {
  if (length < 80) return "#14B8A6";
  if (length < 150) return "#F59E0B";
  return "#EF4444";
}

export function getWaterComparison(ml: number): string {
  if (ml <= 10) return "roughly a teaspoon";
  if (ml <= 30) return "roughly a tablespoon";
  if (ml <= 50) return "a small shot glass";
  return "a quarter cup";
}

// ─── challenge loading helpers ────────────────────────────────────────────────

export function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

export function getLocalFallbackChallenge(difficulty: string): Challenge {
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

export async function loadChallenge(
  difficulty: string,
  selectFields: string
): Promise<Challenge | null> {
  try {
    const url = `https://fvtaoeunqeqnuotydrtv.supabase.co/functions/v1/make-server-488928a2/challenge?difficulty=${difficulty}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Challenge server returned ${res.status}`);
    const data = await res.json();

    const ch: Challenge = {
      id: data.id,
      category: data.category,
      difficulty: data.difficulty,
      skill: data.skill,
      impactLesson: data.impactLesson || data.impact_lesson,
      target_output: data.targetOutput || data.target_output,
      ideal_prompt: data.idealPrompt || data.ideal_prompt,
      char_count: data.charCount || data.char_count,
      active: data.active,
    };

    // Strict security check: if client has not played today, the prompt request does not include ideal_prompt.
    if (!selectFields.includes("ideal_prompt")) {
      delete ch.ideal_prompt;
    }

    return ch;
  } catch (err) {
    console.error("Error loading AI generated challenge, falling back to local dataset:", err);
    return getLocalFallbackChallenge(difficulty);
  }
}
