import { publicAnonKey } from "./supabase";

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
  sandboxOutput?: string;
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
  sandboxOutput?: string;
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
    sandboxOutput: raw.sandboxOutput,
  };
}

const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const BASE_URL = isLocal ? "http://localhost:8000/make-server-488928a2" : "https://fvtaoeunqeqnuotydrtv.supabase.co/functions/v1/make-server-488928a2";

const EDGE_URL = `${BASE_URL}/score`;
const GUEST_SCORE_URL = `${BASE_URL}/score-guest`;

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
  const prompt = userPrompt.trim();
  const clean = prompt.toLowerCase();
  
  if (clean.length < 10 || ["hi", "hello", "test", "hey", "prompt"].includes(clean)) {
    return {
      accuracy: 0,
      format: 0,
      brevity: 0,
      total: 0,
      waterMl: 1,
      co2Grams: 0.01,
      justification: "The prompt was too short or contained only greeting words.",
      feedback: "Try writing a prompt with specific instructions and subject matter.",
    };
  }

  // Check plagiarism / copy-paste attempt
  if (targetOutput.trim()) {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const promptNorm = normalize(prompt);
    const targetNorm = normalize(targetOutput);
    
    const targetWords = targetNorm.split(/\s+/).filter(w => w.length > 4);
    if (targetWords.length > 0) {
      const promptWords = new Set(promptNorm.split(/\s+/));
      const overlap = targetWords.filter(w => promptWords.has(w)).length;
      const overlapRatio = overlap / targetWords.length;
      
      if (overlapRatio > 0.60) {
        return clampScore({
          accuracy: 0,
          format: 0,
          brevity: 0,
          total: 0,
          waterMl: 1,
          co2Grams: 0.01,
          justification: "Prompt appears to reproduce the target output directly. Describe what to produce, do not reproduce it.",
          feedback: "Try writing instructions that describe the tone, format, and subject matter — not the output itself.",
          sandboxOutput: "[Copy-paste attempt blocked. Describe the output instead of copying it.]",
        });
      }
    }
  }

  // Dimension 1: Instruction clarity (0-50)
  const hasActionVerb = /\b(write|create|generate|draft|compose|list|explain|translate|summarize|describe|rewrite|format|act|respond|reply|produce)\b/i.test(prompt);
  const hasSubject = /\b(email|message|text|note|reply|response|list|checklist|paragraph|update|report|notice|post|announcement)\b/i.test(prompt);
  const hasTone = /\b(formal|informal|polite|direct|firm|professional|casual|friendly|urgent|brief|concise|short|under \d+|in \d+|words?|sentences?|bullet|numbered|markdown|code block)\b/i.test(prompt);
  
  const clarityScore = (hasActionVerb ? 20 : 0) 
    + (hasSubject ? 15 : 0) 
    + (hasTone ? 15 : 0);
  
  // Dimension 2: Format specification (0-20)
  const hasFormatInstruction = /\b(list|numbered|bullets?|paragraph|table|code|markdown|format|structure|heading|line|item|step)\b/i.test(prompt);
  const hasLengthInstruction = /\b(under|within|max|maximum|short|brief|concise|\d+ words?|\d+ sentences?|\d+ characters?)\b/i.test(prompt);
  const formatScore = (hasFormatInstruction ? 12 : 0) 
    + (hasLengthInstruction ? 8 : 0);
  
  // Dimension 3: Brevity (0-30) — ratio based
  const idealTokens = Math.max(15, Math.round(targetOutput.length / 8));
  const userTokens = Math.max(1, Math.round(prompt.length / 4));
  const tokenRatio = userTokens / idealTokens;
  const brevityScore = tokenRatio <= 1.0 ? 30 
    : tokenRatio <= 1.5 ? Math.round(30 * (1 - (tokenRatio - 1.0) * 2))
    : 0;
  
  // Apply scaling factor (minimum 0.4 floor instead of 0)
  const scalingFactor = clarityScore > 0 ? 
    Math.max(0.4, clarityScore / 50) : 0;
  
  const rawTotal = clarityScore 
    + Math.round(formatScore * scalingFactor) 
    + Math.round(brevityScore * scalingFactor);
  
  const DIFFICULTY_BONUS: Record<string, number> = { BEGINNER: 0, PRO: 5, EXPERT: 10 };
  const total = Math.min(100, rawTotal + (DIFFICULTY_BONUS[difficulty.toUpperCase()] ?? 0));
  
  const estTokens = userTokens + Math.round(targetOutput.length / 4);
  const waterMl = Math.max(1, Math.round(estTokens * 0.033));
  const co2Grams = Math.max(0.01, parseFloat((estTokens * 0.00033).toFixed(3)));
  
  return clampScore({
    accuracy: Math.min(50, clarityScore),
    format: Math.min(20, Math.round(formatScore * scalingFactor)),
    brevity: Math.min(30, Math.round(brevityScore * scalingFactor)),
    total,
    waterMl,
    co2Grams,
    justification: "Programmatic evaluation simulation applied.",
    feedback: hasActionVerb && hasSubject && hasTone
      ? "Strong prompt structure detected — try the live scorer for full AI evaluation."
      : "Add a clear action verb, specify the output type, and add tone or length constraints.",
    sandboxOutput: `[Mock Sandbox Output: Executed prompt "${userPrompt}"]`,
  });
}

export async function scorePrompt(
  userPrompt: string,
  challengeId: string | number,
  accessToken: string,
  difficulty: string = "BEGINNER",
): Promise<ScoreResult> {
  let res;
  try {
    res = await fetch(EDGE_URL, {
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
  } catch (err) {
    if (isLocal) {
      const PROD_EDGE_URL = "https://fvtaoeunqeqnuotydrtv.supabase.co/functions/v1/make-server-488928a2/score";
      console.log("Local score backend down, falling back to remote production backend at:", PROD_EDGE_URL);
      res = await fetch(PROD_EDGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          userPrompt,
          challengeId,
          difficulty,
        }),
      }).catch(() => null);
    }
  }

  if (res && res.ok) {
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
      sandboxOutput: data.sandboxOutput,
    });
  }

  if (res && !res.ok) {
    throw new Error(`Score request failed: ${res.status}`);
  }

  // Fallback to local mock if server completely unavailable
  const challenge = await import("../data/challenges").then(m => m.DAILY_CHALLENGES.find(c => String(c.id) === String(challengeId)));
  const targetOutput = challenge?.targetOutput || "";
  return mockScore(userPrompt, targetOutput, difficulty);
}

export async function simulateScore(
  userPrompt: string,
  challengeId: string | number,
  targetOutput: string = "",
  difficulty: string = "BEGINNER",
): Promise<ScoreResult> {
  let res = null;

  try {
    const response = await fetch(GUEST_SCORE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: publicAnonKey,
        Authorization: `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ userPrompt, challengeId, difficulty }),
    });
    if (response.ok) {
      res = await response.json();
    }
  } catch (err) {
    if (isLocal) {
      const PROD_GUEST_SCORE_URL = "https://fvtaoeunqeqnuotydrtv.supabase.co/functions/v1/make-server-488928a2/score-guest";
      console.log("Local score-guest backend down, falling back to remote production backend at:", PROD_GUEST_SCORE_URL);
      try {
        const response = await fetch(PROD_GUEST_SCORE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: publicAnonKey,
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ userPrompt, challengeId, difficulty }),
        });
        if (response.ok) {
          res = await response.json();
        }
      } catch (err2) {
        console.error("Remote production fallback score failed:", err2);
      }
    }
  }

  // Wait to simulate AI processing time if it was fast
  await new Promise((resolve) => setTimeout(resolve, 1000));

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
      sandboxOutput: res.sandboxOutput,
    });
  }
  return mockScore(userPrompt, targetOutput, difficulty);
}
