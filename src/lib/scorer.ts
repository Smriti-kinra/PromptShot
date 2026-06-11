export interface ScoreResult {
  accuracy: number;   // 0–100
  format: number;     // 0–100
  brevity: number;    // 0–100
  total: number;      // sum of above
  waterMl: number;    // 10 per API call
  co2Grams: number;   // 0.1 per API call
  idealPrompt?: string;
}

const EDGE_URL =
  "https://fvtaoeunqeqnuotydrtv.supabase.co/functions/v1/make-server-488928a2/score";

const GUEST_SCORE_URL =
  "https://fvtaoeunqeqnuotydrtv.supabase.co/functions/v1/make-server-488928a2/score-guest";

export function mockScore(userPrompt: string): ScoreResult {
  const len = userPrompt.length;
  const brevity = len < 80 ? 85 : len < 150 ? 65 : 45;
  const hasStructure = /\b(write|create|generate|explain|list|describe)\b/i.test(userPrompt);
  const hasDetails = userPrompt.split(/[.,;]/).length > 1;
  const accuracy = Math.round(
    hasStructure && hasDetails ? 75 + Math.random() * 20 : 55 + Math.random() * 20,
  );
  const format = Math.round(hasStructure ? 70 + Math.random() * 25 : 50 + Math.random() * 20);
  
  // Dynamic resource estimation for mock score
  const totalEstTokens = Math.round(len / 4) + 100;
  const waterMl = Math.max(1, Math.round(totalEstTokens * 0.033));
  const co2Grams = Math.max(0.01, parseFloat((totalEstTokens * 0.00033).toFixed(3)));

  return {
    accuracy,
    format,
    brevity,
    total: accuracy + format + brevity,
    waterMl,
    co2Grams,
  };
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
  return {
    accuracy: data.accuracy,
    format: data.format,
    brevity: data.brevity,
    total: data.total,
    waterMl: data.waterMl ?? 10,
    co2Grams: data.co2Grams ?? 0.1,
    idealPrompt: data.idealPrompt,
  };
}

export async function simulateScore(
  userPrompt: string,
  challengeId: string | number,
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
    return {
      accuracy: res.accuracy,
      format: res.format,
      brevity: res.brevity,
      total: res.total,
      waterMl: res.waterMl ?? 10,
      co2Grams: res.co2Grams ?? 0.1,
      idealPrompt: res.idealPrompt,
    };
  }
  return mockScore(userPrompt);
}
