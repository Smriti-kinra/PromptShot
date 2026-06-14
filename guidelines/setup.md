# Project Setup

## Stack
React 18 + TypeScript, Tailwind CSS v3, Vite. Single page app, no router needed.

## Fonts
Load Inter from Google Fonts in index.html:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```
Set in tailwind.config: fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }

## Score mock function
IMPORTANT: Do NOT call any external API. Use this mock in src/lib/scorer.ts:

```typescript
export interface ScoreResult {
  accuracy: number;   // 0–100
  format: number;     // 0–100
  brevity: number;    // 0–100
  total: number;      // sum of above
  waterMl: number;    // 10 per API call
  co2Grams: number;   // 0.1 per API call
}

export async function simulateScore(
  userPrompt: string, 
  targetOutput: string
): Promise<ScoreResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Brevity score based on prompt length — shorter = higher
  const brevity = Math.max(20, Math.min(100, Math.round(120 - userPrompt.length * 0.4)));
  
  // Mock accuracy and format
  const accuracy = 65 + Math.floor(Math.random() * 25);
  const format = 70 + Math.floor(Math.random() * 20);
  
  return {
    accuracy,
    format, 
    brevity,
    total: accuracy + format + brevity,
    waterMl: 10,
    co2Grams: 0.1
  };
}
```


## localStorage keys
```typescript
const STORAGE_KEYS = {
  STREAK: 'promptshot_streak',
  LAST_PLAYED: 'promptshot_last_played',
  HISTORY: 'promptshot_history'
} as const;
```

Write a useGameState hook in src/hooks/useGameState.ts that reads/writes these.

## Challenge selection
Pick today's challenge in src/lib/challenges.ts:
```typescript
function getTodaysChallenge() {
  const dayOfYear = getDayOfYear(new Date());
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
}
```

## Rules
- Do NOT add any other npm packages unless explicitly asked
- Do NOT add React Router or any routing library
- Do NOT connect to any external API in v1 — scorer is mocked
- The simulateScore interface (inputs/outputs) must stay exactly as defined above