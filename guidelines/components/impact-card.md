# ImpactCard Component

The environmental intervention. Slides up after the bullseye animation. This is 
the product's philosophical core — treat it with care.

## When to use
Rendered in 'impact' game state only. Appears automatically, not on user click.

## Props
```typescript
interface ImpactCardProps {
  apiCallsUsed: number;      // always 1 for v1
  waterMl: number;           // 10 per call
  totalScore: number;        // determines if low-score warning shows
  visible: boolean;          // controls slide-up animation
}
```

## Visual structure
[4px teal left border]
[teal-dim bg — rgba(20,184,166,0.12)]
[16px radius, 24px padding]
Row 1: "This prompt used" [N] "API call" — [N] in teal
Row 2: "≈ Xml water" — X values in teal
[If totalScore < 60, show this block separated by a 1px border:]
Row 3: "A score this low typically means 3+ follow-ups to reach this output"
Row 4: "That's ≈ 30ml more — roughly a tablespoon" — "a tablespoon" in amber
(amber here is intentional — it's a callout comparison, not an eco value)
Bottom line: "Better prompts = less AI = less water. This is the skill."
— 12px secondary color, italic

## Entry animation
```css
@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
animation: slideUp 600ms ease-out forwards;
```
Trigger when `visible` prop changes to true.

## Water comparisons (use these exact strings)
- 10ml: "roughly a teaspoon"
- 30ml: "roughly a tablespoon"  
- 50ml: "a small shot glass"
- 100ml: "a quarter cup"

## Rules
- NEVER use amber for water values — only teal
- The one exception: "a tablespoon" comparison text uses amber (it's a callout)
- Do NOT add a close button or dismiss interaction
- Do NOT change the copy — these strings are final
- The component is always full-width within its container
- Numbers display with no decimal places (10ml not 10.0ml)