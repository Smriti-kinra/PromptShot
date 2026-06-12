Build PromptShot — a daily prompt engineering game.Think Wordle, but the daily challenge is: you're shown a target AI output (paragraph, code, or list) and must write the prompt that produces it. Your output is scored against the target on accuracy, format match, and brevity.

Core philosophy embedded in the product: since AI use is inevitable, efficient prompting reduces environmental waste(data center water, CO₂).The game teaches this without lecturing — it shows it through numbers.

---

  TECH STACK
React + TypeScript, Tailwind CSS, Vite.No backend.Daily challenge data lives in a hardcoded local JSON.Scoring is mocked for now — return a fixed JSON { accuracy: 72, format: 85, brevity: 60, total: 217 } from a simulateScore() function I'll replace with a real API call later.

---

  DESIGN SYSTEM — follow this exactly
Colors(4 only, no others):
background: #0A0A0A
surface: #141414
text - primary: #F0EFE8
text - secondary: #888880
amber: #F59E0B(scoring, bullseye rings, highlights)
teal: #14B8A6(all environmental / eco elements — never amber here)

Typography: Inter, loaded from Google Fonts.Scale: 12px captions, 14px secondary, 16px body, 20px subheads, 28px headings, 40px display.No other sizes.

  Spacing: 8px base unit.Use multiples of 8 only(8, 16, 24, 32, 40, 48).

Border radius: 8px default, 16px for cards, 9999px for pills and badges.

---

    SCREENS — the app is one page, pure state transitions, no routing

STATE 1: Challenge view
Header: "PromptShot" wordmark left, streak counter right(🔥 3)
  Center card(surface color, 16px radius, 24px padding):
- Top row: category badge(PARAGRAPH / CODE / LIST, pill, teal bg), difficulty badge(BEGINNER / PRO / EXPERT, pill, amber bg at 15 % opacity amber text)
  - Heading: "Today's target output" 14px secondary color
    - The target output text in a scrollable box, monospace for code targets, serif for paragraph, sans for list.Max height 240px, scrollable.
    - Bottom row: character count of target, small secondary text
  Below the card:
- Label "Write the prompt that generates this:" 14px secondary
  - Textarea: dark bg, 1px border #333, 16px body text, placeholder "Describe exactly what you want the AI to produce...", 140px min height, resizable vertically
    - Below textarea: character counter.Green if <80 chars, amber if 80 - 150, red if > 150. Small text: "Shorter prompts score higher on brevity"
      - Submit button: full width, amber bg, black text, "Shoot →" label, 48px height, 8px radius

STATE 2: Loading
  Replace submit button area with: centered animated target / crosshair(CSS animation, rotating ring), text "Analyzing your shot..." in 14px secondary.Duration: 1400ms then auto - transition to results.

  STATE 3: Results
  Keep the challenge card visible at top(compact, collapsed to 2 lines of target text + "show more")
Below: Bullseye visualization
  - Three concentric SVG rings(outer = accuracy, mid = format, inner = brevity).Each ring fills clockwise as a stroke - dasharray animation over 800ms, staggered 200ms apart.
    - Ring colors: all amber.Unfilled portions: #222.
  - Center of bullseye: total score in 40px display text, "/300" in 20px secondary
    - Below rings: three score rows — label left, "XX/100" right, with a thin progress bar for each
  Score label key:
    > 240: "Bullseye 🎯", 180 - 239: "On target", 120 - 179: "Close range", <120: "Missed"

STATE 4: Impact card(slides up from below results, 600ms after bullseye animation completes)
Full - width card, teal left border(4px), surface bg
  Line 1: "This prompt used 1 API call" — teal text for the number
  Line 2: "≈ 10ml water · ≈ 0.1g CO₂" — teal for the values
  If total score < 180, add a second block:
    Line 3: "A score this low typically means 3+ follow-up prompts to reach this output"
    Line 4: "That adds ≈ 30ml water — about a tablespoon" — amber for the tablespoon comparison
  Bottom of card: "Better prompts = less AI = less water. This is the skill." — 12px secondary

STATE 5: Post - game
  Below impact card: two buttons side by side
Left: "See ideal prompt →"(subtle, outline style) — shows a reveal card with an example optimal prompt
Right: "Share result"(amber fill) — copies a Wordle - style text to clipboard:
      PromptShot #001 🎯
217 / 300 ●●●◐○
      💧 ~10ml · Brevity needs work

---

  DAILY CHALLENGE DATA STRUCTURE
Hardcode this array as DAILY_CHALLENGES in a challenges.ts file.Pick challenge by(day of year) index so it rotates daily without a backend.

[
  {
    id: "001",
    category: "PARAGRAPH",
    difficulty: "BEGINNER",
    targetOutput: "The water cycle, also known as the hydrological cycle, describes the continuous movement of water through Earth's systems. Water evaporates from oceans and lakes, rises as vapor, condenses into clouds, and falls as precipitation. This process distributes fresh water across the planet and regulates global temperature.",
    idealPrompt: "Explain the water cycle in 3 sentences. Include: evaporation, condensation, and precipitation. Keep it factual and concise.",
    charCount: 312
  },
  {
    id: "002",
    category: "CODE",
    difficulty: "PRO",
    targetOutput: "function debounce(fn, delay) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}",
    idealPrompt: "Write a JavaScript debounce function. It should accept a function and delay in ms, return a new function that clears and resets a timer on each call, and execute the original function after the delay.",
    charCount: 148
  },
  {
    id: "003",
    category: "LIST",
    difficulty: "EXPERT",
    targetOutput: "Principles of effective feedback:\n• Specific over general — cite the exact behavior\n• Timely — given close to the event\n• Actionable — the receiver can do something with it\n• Separates behavior from identity — 'this report was unclear' not 'you are unclear'\n• Two-way — invites response",
    idealPrompt: "List the principles of effective feedback as bullet points. Each should be a short label followed by a one-sentence explanation. Include: specificity, timing, actionability, behavior vs identity, and dialogue.",
    charCount: 328
  }
]

---

  LOCAL STATE(localStorage keys)
promptshot_streak: number
promptshot_last_played: ISO date string
promptshot_history: array of { id, score, date }

On load: if last_played is today, skip to a "already played today" state showing yesterday's score and a countdown to tomorrow.

---

  ANIMATIONS
All animations: CSS only, no libraries.
  - Bullseye rings: stroke - dasharray / stroke - dashoffset transition, 800ms ease - out, staggered
  - Impact card: translateY(40px) → translateY(0) + opacity 0→1, 600ms ease - out
    - Score number: count up from 0 to final value over 600ms
      - Loading crosshair: rotate 360deg, 1.2s linear infinite

---
