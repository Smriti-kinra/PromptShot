# Component Catalog

All components live in `src/components/` and its subdirectories.

| Component | File | Purpose | Guidelines |
|---|---|---|---|
| Topbar | [Topbar.tsx](file:///Users/smriti/Documents/GitHub/promptshot/src/components/Topbar.tsx) | Header containing streak badges, title, learn/leaderboard buttons, and volume control. | - |
| WaterGlass | [WaterGlass.tsx](file:///Users/smriti/Documents/GitHub/promptshot/src/components/WaterGlass.tsx) | Procedural water glass filling visualization for score footprint. | - |
| AnimatedGridBackground | [AnimatedGridBackground.tsx](file:///Users/smriti/Documents/GitHub/promptshot/src/components/AnimatedGridBackground.tsx) | Interactive Canvas-based background grid with cursor tracking and drifting particle dots. | - |
| PromptDiff | [PromptDiff.tsx](file:///Users/smriti/Documents/GitHub/promptshot/src/components/PromptDiff.tsx) | Visual side-by-side prompt diffing editor component (reused across results and history). | - |
| LoadingSkeleton | [LoadingSkeleton.tsx](file:///Users/smriti/Documents/GitHub/promptshot/src/components/LoadingSkeleton.tsx) | Pulse skeleton loaders for screen state changes. | - |
| LeaderboardModal | [LeaderboardModal.tsx](file:///Users/smriti/Documents/GitHub/promptshot/src/components/LeaderboardModal.tsx) | Container/portal coordinating the leaderboard popup modal lifecycle and authentication state. | - |
| GateScreen | [GateScreen.tsx](file:///Users/smriti/Documents/GitHub/promptshot/src/components/leaderboard/GateScreen.tsx) | Auth sign-in / registration screen in the leaderboard modal when guest/unauthenticated. | - |
| LeaderboardScreen | [LeaderboardScreen.tsx](file:///Users/smriti/Documents/GitHub/promptshot/src/components/leaderboard/LeaderboardScreen.tsx) | Main leaderboard ranked lists table displaying player scores and personal/community records. | - |
| ImpactRow | [ImpactRow.tsx](file:///Users/smriti/Documents/GitHub/promptshot/src/components/impact/ImpactRow.tsx) | Clickable interactive environmental savings detail triggers. | [impact-card.md](impact-card.md) |
| ImpactExplainerModal | [ImpactExplainerModal.tsx](file:///Users/smriti/Documents/GitHub/promptshot/src/components/impact/ImpactExplainerModal.tsx) | Step-by-step formula explanation popup modal for environmental metrics calculations. | - |
| LearnPanel | [LearnPanel.tsx](file:///Users/smriti/Documents/GitHub/promptshot/src/components/LearnPanel.tsx) | Coordinator panel for the Prompting 101 guide overlay. | [learn-panel.md](learn-panel.md) |
| Learn Anatomy/Myths/Examples/FAQ Sections | [learn/](file:///Users/smriti/Documents/GitHub/promptshot/src/components/learn/) | Subfolder comprising the distinct modular sections of the Learn Panel. | - |

## Component Decision Tree
- **Where are global navigation, Streak, and Volume/Mute controls?**
  - Inside `Topbar` component.
- **What component renders the interactive tech background grid?**
  - `AnimatedGridBackground` component.
- **How is the difference between a user prompt and ideal prompt shown?**
  - Via the shared responsive `PromptDiff` component.
- **Where are the leaderboard and auth gates handled?**
  - Coordinated by `LeaderboardModal` using `GateScreen` and `LeaderboardScreen`.
- **Where are the eco-impact details and calculation steps handled?**
  - Renders via `ImpactRow` which triggers the `ImpactExplainerModal`.
- **Where is the prompting guide panel and its sections?**
  - Handled by `LearnPanel` delegating to `AnatomySection`, `MythsSection`, `ExamplesSection`, and `FAQSection`.