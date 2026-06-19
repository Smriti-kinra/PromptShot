# PromptShot Design Guidelines

## Product character

PromptShot is a daily prompt engineering game. The tone is premium, focused, game-like —
not a productivity app, not a website. Dark mode only. Every interaction should feel
satisfying and intentional.

- **Density**: Breathable but game-focused — generous padding, no clutter
- **Color philosophy**: Near-black forest-green canvas. Amber owns all scoring/game elements.
  Teal owns all environmental/impact elements. These two color worlds must never mix.
- **Surface strategy**: Glassmorphic cards float on a deep forest-green (#0B1610) background, utilizing subtle borders and surface contrast to create visual hierarchy.
- **Animation**: Present and purposeful. The bullseye fill animation IS the product moment.
- **Copy**: Minimal. The UI never explains itself with paragraphs.

## Reading order

MUST READ before writing any code:

1. This file (Guidelines.md) — character, rules, state machine
2. guidelines/setup.md — tech stack, mock scorer, localStorage
3. guidelines/foundations/colors.md — 4 colors, usage rules
4. guidelines/foundations/typography.md — type scale
5. guidelines/components/overview.md — component catalog

Read on-demand:

- [Methodology, Citations & Credibility](methodology.md) — scientific citations, scoring formulas, execution determinism
- [Feature Catalog & Specifications](features.md) — game flow, scoring pipeline, results screen, eco stats, and leaderboard catalog
- guidelines/components/{name}.md — read BEFORE building that component
- guidelines/foundations/spacing.md — when placing any layout

## App state machine

The app has exactly 5 states. Use a single `gameState` enum to control which
state is shown. No routing.

```typescript
type GameState =
  | "challenge" // Show target output + prompt textarea
  | "loading" // Submitting, waiting for score
  | "results" // Bullseye animation + score breakdown
  | "impact" // Impact card revealed below results
  | "already-played"; // User played today — show yesterday + countdown
```

State transitions:
challenge → loading (on submit)
loading → results (after 1400ms)
results → impact (after 2000ms automatically — no click needed)

## Rules

IMPORTANT: Do NOT use any color outside the 4-color system defined in colors.md.
IMPORTANT: Do NOT add screens, routing, modals, or navigation not specified here.
IMPORTANT: Amber (#F59E0B) is for game/scoring elements ONLY. Never use amber for
environmental content.
IMPORTANT: Teal (#0EA79A) is for environmental/impact elements ONLY. Never use teal
for scoring content.
IMPORTANT: All spacing must be multiples of 8px. Never hardcode odd pixel values.
IMPORTANT: The app is mobile-first. Design at 390px width. Desktop just centers the
content at max-width 480px.

- Never use gradients
- Never use box-shadows (except for focused inputs: 0 0 0 2px amber at 40% opacity)
- Never use border-radius values other than 8px (default), 16px (cards), 9999px (pills)
- Streak counter in the header always shows fire emoji + number
- Scores are always displayed as integer/100 — never decimals
- All animations must respect prefers-reduced-motion (disable animation, show final state)

IMPORTANT: The LearnPanel is the ONLY component that uses accordion/expand
behavior. Do not add expand/collapse to any other component.

IMPORTANT: showLearnPanel is a separate boolean, not part of gameState enum.
It can be true simultaneously with any game state.