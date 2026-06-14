export const C = {
  bg: "#0B1610",
  surface: "#121C14",
  surface2: "#1A2E1C",
  primary: "#D4E8D4",
  secondary: "#4A6B4A",
  mint: "#6EE09B",
  amber: "var(--ps-amber)",
  red: "#FF5F5F",
  border: "#243B27",
  font: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  total: number;
  accuracy: number;
  format: number;
  brevity: number;
  userPrompt: string | null;
  isCurrentUser: boolean;
}
