import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();
app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "OPTIONS"],
}));

// Initialize secure Supabase admin client
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

app.get("/make-server-488928a2/health", (c) => c.json({ status: "ok" }));

interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

function estimateResources(usage?: TokenUsage) {
  const input = usage?.input_tokens ?? 0;
  const output = usage?.output_tokens ?? 0;
  const total = input + output;

  // Estimating footprints dynamically based on token volume (300 tokens ≈ 10ml water & 0.1g CO2)
  const waterMl = Math.max(1, Math.round(total * 0.033));
  const co2Grams = Math.max(0.01, parseFloat((total * 0.00033).toFixed(3)));

  return { waterMl, co2Grams };
}

async function getChallengeFromDb(challengeId: string | number) {
  const { data, error } = await supabaseAdmin
    .from("challenges")
    .select("target_output, ideal_prompt")
    .eq("id", challengeId)
    .single();

  if (error || !data) {
    throw new Error(`Failed to fetch challenge details: ${error?.message || "Not found"}`);
  }
  return data;
}

async function verifyUser(authHeader?: string): Promise<void> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Missing or invalid token format");
  }
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new Error("Unauthorized: Invalid session");
  }
}

async function callClaudeScorer(userPrompt: string, targetOutput: string, idealPrompt: string) {
  const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY not set");

  const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL_NAME") || "claude-sonnet-4-20250514";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      system: "You are a precise scoring engine. Return only valid JSON.",
      messages: [
        {
          role: "user",
          content: `Score this prompt attempt. Return JSON only, no markdown.\n\nTARGET OUTPUT:\n${targetOutput}\n\nIDEAL PROMPT:\n${idealPrompt}\n\nUSER PROMPT:\n${userPrompt}\n\nScore each dimension 0-100:\n- accuracy: does the user prompt specify the right content and angle?\n- format: does it specify structure, length, and output type correctly?\n- brevity: is it concise? (100 if under 60 chars, scales down to 20 at 300+ chars)\n\nReturn: {"accuracy": N, "format": N, "brevity": N}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "{}";
  const scores = JSON.parse(text.replace(/```json?|```/g, "").trim());

  const accuracy = Math.max(0, Math.min(100, Math.round(scores.accuracy ?? 50)));
  const format = Math.max(0, Math.min(100, Math.round(scores.format ?? 50)));
  const brevity = Math.max(0, Math.min(100, Math.round(scores.brevity ?? 50)));

  const usage = data.usage;
  const { waterMl, co2Grams } = estimateResources(usage);

  return {
    accuracy,
    format,
    brevity,
    total: accuracy + format + brevity,
    waterMl,
    co2Grams,
  };
}

function fallbackScore(userPrompt: string) {
  const brevity = userPrompt.length < 80 ? 80 : userPrompt.length < 150 ? 60 : 40;
  const accuracy = 55 + Math.floor(Math.random() * 20);
  const format = 60 + Math.floor(Math.random() * 20);
  
  // Calculate mock resources dynamically based on prompt length
  const totalEstTokens = Math.round(userPrompt.length / 4) + 100;
  const { waterMl, co2Grams } = estimateResources({ input_tokens: totalEstTokens, output_tokens: 50 });

  return {
    accuracy,
    format,
    brevity,
    total: accuracy + format + brevity,
    waterMl,
    co2Grams,
  };
}

app.post("/make-server-488928a2/score", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    await verifyUser(authHeader);

    const { challengeId, userPrompt } = await c.req.json();
    if (!challengeId || !userPrompt) {
      return c.json({ error: "Missing fields" }, 400);
    }

    const challenge = await getChallengeFromDb(challengeId);
    const scoreResult = await callClaudeScorer(userPrompt, challenge.target_output, challenge.ideal_prompt);

    return c.json({
      ...scoreResult,
      idealPrompt: challenge.ideal_prompt,
    });
  } catch (err: any) {
    console.error("Scoring error (auth route):", err);
    if (err.message?.includes("Unauthorized")) {
      return c.json({ error: err.message }, 401);
    }
    const { challengeId, userPrompt } = await c.req.json().catch(() => ({}));
    let idealPrompt = "";
    if (challengeId) {
      const challenge = await getChallengeFromDb(challengeId).catch(() => null);
      if (challenge) idealPrompt = challenge.ideal_prompt;
    }
    return c.json({
      ...fallbackScore(userPrompt || ""),
      idealPrompt,
    });
  }
});

app.post("/make-server-488928a2/score-guest", async (c) => {
  try {
    const { challengeId, userPrompt } = await c.req.json();
    if (!challengeId || !userPrompt) {
      return c.json({ error: "Missing fields" }, 400);
    }

    const challenge = await getChallengeFromDb(challengeId);
    const scoreResult = await callClaudeScorer(userPrompt, challenge.target_output, challenge.ideal_prompt);

    return c.json({
      ...scoreResult,
      idealPrompt: challenge.ideal_prompt,
    });
  } catch (err) {
    console.error("Scoring error (guest route):", err);
    const { challengeId, userPrompt } = await c.req.json().catch(() => ({}));
    let idealPrompt = "";
    if (challengeId) {
      const challenge = await getChallengeFromDb(challengeId).catch(() => null);
      if (challenge) idealPrompt = challenge.ideal_prompt;
    }
    return c.json({
      ...fallbackScore(userPrompt || ""),
      idealPrompt,
    });
  }
});

Deno.serve(app.fetch);
