# Project Setup & Configuration

This guide details the tech stack, API integrations, state storage, and challenge loading structure implemented in **PromptShot**.

---

## 1. Stack & Dependencies

* **Core**: React 18 + TypeScript + Vite.
* **Styling**: Tailwind CSS v4 (using the `@tailwindcss/vite` plugin).
* **Routing**: None. Navigation is managed via state-driven screen transitions (`gameState` enum in `App.tsx`).
* **Database & Hosting**: Supabase for authentication, profiles, scores, and Edge Functions.

---

## 2. Scoring API & Fallback Scorer

The application uses a hybrid scoring pipeline. For authenticated or guest runs, it calls the backend Edge Functions, falling back to a programmatic scorer if offline.

### Standard Scorer Call
* **Endpoints**: 
  - Authenticated: `https://fvtaoeunqeqnuotydrtv.supabase.co/functions/v1/make-server-488928a2/score`
  - Anonymous / Guest: `https://fvtaoeunqeqnuotydrtv.supabase.co/functions/v1/make-server-488928a2/score-guest`
* **Response Schema**: Returns a 100-point scale result:
  ```typescript
  export interface ScoreResult {
    accuracy: number;   // 0–50 (Semantic + Keyword)
    format: number;     // 0–20 (Structural layout)
    brevity: number;    // 0–30 (Token + Latency, scaled by accuracy)
    total: number;      // sum of above (0-100)
    waterMl: number;    // Estimated server water footprint
    idealPrompt?: string;
    justification?: string;
    feedback?: string;
  }
  ```

### Local Fallback Scoring
If the server is offline, the client uses `mockScore(userPrompt, targetOutput)` in `src/lib/scorer.ts` to perform a programmatic estimation:
- **Relevance Check**: Checks for keyword overlap between prompt and target. If zero keywords overlap, all scores evaluate directly to `0`.
- **Scaling**: Raw format and brevity scores are scaled by the accuracy ratio to penalize irrelevant or absurd prompts.

---

## 3. Challenge Loading System

Challenges are loaded dynamically from the backend and fall back to local seed data if needed.

1. **Dynamic Path (Default)**:
   Loads from `GET /challenge?difficulty=BEGINNER|PRO|EXPERT`. The backend edge function fetches the daily AI-generated challenge for that date.
2. **Local Fallback (Offline)**:
   If the edge function is offline, the client loads from `DAILY_CHALLENGES` in [`src/data/challenges.ts`](file:///Users/smriti/Documents/GitHub/promptshot/src/data/challenges.ts) using the day-of-year mod index.

---

## 4. State & Storage Integration

PromptShot uses a dual storage paradigm depending on user session state:

### Signed-In Mode (Supabase)
* **Auth**: Managed asynchronously via Supabase client auth hooks.
* **Scores & Streaks**: Persisted in the `profiles` and `scores` Postgres tables. Streaks are calculated and synced live.

### Guest Mode (LocalStorage)
* **Streak**: `promptshot_streak` (integer)
* **Last Played**: `promptshot_last_played` (ISO date string)
* **History**: `promptshot_history` (JSON array of previous attempts)