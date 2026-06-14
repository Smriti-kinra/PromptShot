# BullseyeRings Component

The hero visual moment of the game. Three concentric SVG rings, each filling 
clockwise to represent one score dimension. This animation IS the product.

## When to use
Rendered only in 'results' and 'impact' game states. Never in 'challenge' or 'loading'.

## Props
```typescript
interface BullseyeRingsProps {
  accuracy: number;   // 0–50
  format: number;     // 0–20
  brevity: number;    // 0–30
  total: number;      // displayed in center
  animate: boolean;   // set true once to trigger fill animation
}
```

## Ring layout
Three rings, centered in a 240×240px SVG viewBox:
- Outer ring (r=100): accuracy score (max 50)
- Middle ring (r=72): format score (max 20)
- Inner ring (r=44): brevity score (max 30)

All rings: 16px stroke-width, amber color (#F59E0B), stroke-linecap="round".
Unfilled track: rgba(245,158,11,0.12) — amber at 12% opacity.
Ring gap labels: tiny text outside each ring — "Accuracy", "Format", "Brevity" at 11px.

## Animation technique
Use stroke-dasharray + stroke-dashoffset for the fill animation:
```typescript
const circumference = 2 * Math.PI * radius;
const dashOffset = circumference - (score / max) * circumference;
// Animate dashOffset from circumference (empty) to calculated value (filled)
```

CSS transition: stroke-dashoffset 800ms ease-out
Stagger: outer ring starts at 0ms, middle at 200ms, inner at 400ms.

## Center display
- Total score in 40px Inter 600 weight, amber color
- "/100" in 20px secondary color, below
- Score label ("Bullseye 🎯" etc.) in 12px secondary color, below that

Score label thresholds:
  >80: "Bullseye 🎯"
  60-79: "On target"  
  40-59: "Close range"
  <40: "Missed"

## ScoreBreakdown companion component
Below the bullseye, three rows:
```typescript
interface ScoreBreakdownProps {
  accuracy: number;
  format: number;
  brevity: number;
}
```
Each row: label left (14px secondary), "XX/max" right (16px primary), 
thin progress bar below (4px height, amber fill, surface bg track).

## Rules
- Animation must only run ONCE — use a ref or useEffect with a flag
- Do NOT animate on re-render
- Respect prefers-reduced-motion: if true, show final state immediately
- Scores display as integers — never show decimal scores
- The SVG must be exactly 240×240px — do not make it responsive
  (center it in its container with mx-auto)