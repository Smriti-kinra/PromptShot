export interface ScoreResult {
  accuracy: number;   // 0–50 (Semantic + Keyword)
  format: number;     // 0–20 (Structural)
  brevity: number;    // 0–30 (Token + Latency)
  total: number;      // sum of above (0-100)
  waterMl: number;    
  co2Grams: number;   
  idealPrompt?: string;
  justification?: string;
  feedback?: string;
}

/** Hard-clamp every score field so API over-scoring never leaks into the UI */
function clampScore(raw: {
  accuracy: number;
  format: number;
  brevity: number;
  total: number;
  waterMl: number;
  co2Grams: number;
  idealPrompt?: string;
  justification?: string;
  feedback?: string;
}): ScoreResult {
  const accuracy = Math.min(50,  Math.max(0, Math.round(raw.accuracy)));
  const format   = Math.min(20,  Math.max(0, Math.round(raw.format)));
  const brevity  = Math.min(30,  Math.max(0, Math.round(raw.brevity)));
  const total    = Math.min(100, Math.max(0, accuracy + format + brevity));
  return {
    accuracy,
    format,
    brevity,
    total,
    waterMl:  Math.max(1,    raw.waterMl),
    co2Grams: Math.max(0.01, raw.co2Grams),
    idealPrompt:   raw.idealPrompt,
    justification: raw.justification,
    feedback:      raw.feedback,
  };
}

const EDGE_URL =
  "https://fvtaoeunqeqnuotydrtv.supabase.co/functions/v1/make-server-488928a2/score";

const GUEST_SCORE_URL =
  "https://fvtaoeunqeqnuotydrtv.supabase.co/functions/v1/make-server-488928a2/score-guest";

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().match(/\b\w{4,}\b/g) ?? []);
  const setB = new Set(b.toLowerCase().match(/\b\w{4,}\b/g) ?? []);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const w of setA) { if (setB.has(w)) intersection++; }
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

export function mockScore(userPrompt: string, targetOutput: string = "", difficulty: string = "BEGINNER"): ScoreResult {
  const cleanPrompt = userPrompt.trim();
  if (cleanPrompt.length < 10 || ["hi", "hello", "test", "hey", "prompt"].includes(cleanPrompt.toLowerCase())) {
    return {
      accuracy: 0,
      format: 0,
      brevity: 0,
      total: 0,
      waterMl: 1,
      co2Grams: 0.01,
      justification: "The prompt was too short or contained only greeting words.",
      feedback: "Try writing a prompt with specific instructions and formatting guidelines.",
    };
  }

  // Check relevance by word overlap
  if (targetOutput.trim()) {
    const promptWords = new Set(cleanPrompt.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    const targetWords = new Set(targetOutput.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    
    let overlapCount = 0;
    for (const word of promptWords) {
      if (targetWords.has(word)) {
        overlapCount++;
      }
    }

    if (overlapCount === 0) {
      return {
        accuracy: 0,
        format: 0,
        brevity: 0,
        total: 0,
        waterMl: 1,
        co2Grams: 0.01,
        justification: "The prompt has no relevance to the challenge subject matter.",
        feedback: "Make sure you include topic keywords from the target output in your prompt.",
      };
    }
  }

  const len = cleanPrompt.length;
  const rawBrevity = len < 80 ? 25 : len < 150 ? 18 : 10;
  
  const sim = jaccardSimilarity(userPrompt, targetOutput);
  const hasVerbs = /\b(write|create|generate|explain|list|describe|act|role|format|output|show)\b/i.test(userPrompt.trim());

  const accuracy    = Math.round(sim * 40 + (hasVerbs ? 5 : 0));   // 0–45, capped at 50
  const rawFormat   = Math.round(sim * 16 + (hasVerbs ? 2 : 0));   // 0–18, capped at 20
  
  // Dependency scaling
  const accuracyRatio = accuracy / 50;
  const format = Math.round(rawFormat * accuracyRatio);
  const brevity = Math.round(rawBrevity * accuracyRatio);
  const total = accuracy + format + brevity;

  const DIFFICULTY_MULTIPLIER: Record<string, number> = {
    BEGINNER: 1.0,
    PRO:      1.15,
    EXPERT:   1.30,
  };

  const multiplier = DIFFICULTY_MULTIPLIER[difficulty?.toUpperCase() ?? "BEGINNER"] ?? 1.0;
  const adjustedTotal = Math.min(100, Math.round(total * multiplier));

  const totalEstTokens = Math.round(len / 4) + 100;
  const waterMl = Math.max(1, Math.round(totalEstTokens * 0.033));
  const co2Grams = Math.max(0.01, parseFloat((totalEstTokens * 0.00033).toFixed(3)));

  return clampScore({
    accuracy,
    format,
    brevity,
    total: adjustedTotal,
    waterMl,
    co2Grams,
    justification: "Programmatic evaluation simulation applied.",
    feedback: "Focus on adding clear instructions and output structure directives.",
  });
}

export async function scorePrompt(
  userPrompt: string,
  challengeId: string | number,
  accessToken: string,
  difficulty: string = "BEGINNER",
): Promise<ScoreResult> {
  const res = await fetch(EDGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      userPrompt,
      challengeId,
      difficulty,
    }),
  });
  if (!res.ok) throw new Error(`Score request failed: ${res.status}`);
  const data = await res.json();
  return clampScore({
    accuracy: data.accuracy,
    format: data.format,
    brevity: data.brevity,
    total: data.total,
    waterMl: data.waterMl ?? 10,
    co2Grams: data.co2Grams ?? 0.1,
    idealPrompt: data.idealPrompt,
    justification: data.justification,
    feedback: data.feedback,
  });
}

export async function simulateScore(
  userPrompt: string,
  challengeId: string | number,
  targetOutput: string = "",
  difficulty: string = "BEGINNER",
): Promise<ScoreResult> {
  const [res] = await Promise.all([
    fetch(GUEST_SCORE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt, challengeId, difficulty }),
    })
      .then((r) => r.json())
      .catch(() => null),
    new Promise((resolve) => setTimeout(resolve, 1400)),
  ]);

  if (res && typeof res.accuracy === "number") {
    return clampScore({
      accuracy: res.accuracy,
      format: res.format,
      brevity: res.brevity,
      total: res.total,
      waterMl: res.waterMl ?? 10,
      co2Grams: res.co2Grams ?? 0.1,
      idealPrompt: res.idealPrompt,
      justification: res.justification,
      feedback: res.feedback,
    });
  }
  return mockScore(userPrompt, targetOutput, difficulty);
}
