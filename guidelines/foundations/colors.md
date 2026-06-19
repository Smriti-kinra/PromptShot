# Color System

PromptShot uses a curated forest-green theme with strict styling boundaries.

| Role | Hex | Token Name | Used for |
|---|---|---|---|
| Background | #0B1610 | --ps-background | Page body / base canvas |
| Surface | #121C14 | --ps-surface | Glassmorphic card base background |
| Surface 2 | #1A2E1C | --ps-surface-2 | Secondary panel background / elements |
| Text primary | #D4E8D4 | --ps-text-primary | High-contrast body, headings, and values |
| Text secondary | #9CD19C | --ps-text-secondary | Labels, subtitles, and captions |
| Text muted | #2E4F31 | --ps-text-muted | Very low-contrast text / placeholders |
| Mint | #6EE09B | --ps-mint | Bright highlight elements |
| Teal | #0EA79A | --ps-teal | Environmental / eco-impact elements ONLY |
| Amber | #F59E0B | --ps-amber | Game / scoring elements ONLY |
| Border | #243B27 | --ps-border | Primary borders |
| Border subtle | #1A2E1C | --ps-border-subtle | Low-contrast delimiters |

## Two-World Color Rule
* **Amber (#F59E0B)**: Exclusively for game, score, bullseye, streak, difficulty badge, and prompt submission actions.
* **Teal (#0EA79A)**: Exclusively for environmental metrics, water estimations, and the eco impact card.
* **Mint (#6EE09B)**: Used as a neutral bright accent or success/action highlight.
* **Never mix amber and teal inside components.**

## Glassmorphism System
Cards in PromptShot use semi-transparent background blends with backdrop filters:
* **Default Card (`.ps-glass-panel`)**: Background: `rgba(18, 28, 20, 0.45)` with `backdrop-filter: blur(16px)` and border `1px solid rgba(110, 224, 155, 0.08)`.
* **Amber Card (`.ps-glass-panel-amber`)**: Background: `rgba(26, 22, 10, 0.45)` with `backdrop-filter: blur(16px)` and border `1px solid rgba(245, 158, 11, 0.1)`.

## Rules
- NEVER use amber for anything environmental.
- NEVER use teal for anything game/scoring related.
- ALWAYS use the variables defined in `src/styles/theme.css` to keep themes consistent.
- Focus rings on active inputs use the --ring token: `oklch(0.82 0.13 155)` with 50% opacity.