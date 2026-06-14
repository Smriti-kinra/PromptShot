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

export function mockScore(userPrompt: string, targetOutput: string = ""): ScoreResult {
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
  const hasStructure = /\b(write|create|generate|explain|list|describe|act|role|format|output|show)\b/i.test(cleanPrompt);
  
  const accuracy = Math.round(
    hasStructure ? 30 + Math.random() * 15 : 5 + Math.random() * 10
  );
  const rawFormat = Math.round(
    hasStructure ? 10 + Math.random() * 8 : 2 + Math.random() * 5
  );
  
  // Dependency scaling
  const accuracyRatio = accuracy / 50;
  const format = Math.round(rawFormat * accuracyRatio);
  const brevity = Math.round(rawBrevity * accuracyRatio);
  const total = accuracy + format + brevity;

  const totalEstTokens = Math.round(len / 4) + 100;
  const waterMl = Math.max(1, Math.round(totalEstTokens * 0.033));
  const co2Grams = Math.max(0.01, parseFloat((totalEstTokens * 0.00033).toFixed(3)));

  return clampScore({
    accuracy,
    format,
    brevity,
    total,
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
): Promise<ScoreResult> {
  const [res] = await Promise.all([
    fetch(GUEST_SCORE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt, challengeId }),
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
  return mockScore(userPrompt, targetOutput);
}
