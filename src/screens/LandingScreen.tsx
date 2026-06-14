import { soundManager } from "../lib/sounds";
import { Wordmark } from "../components/Wordmark";

type GameState = "challenge" | "loading" | "results" | "impact" | "already-played";

import { useCountdownToMidnight } from "../hooks/useCountdownToMidnight";

function CountdownTimer() {
  const { h, m, s } = useCountdownToMidnight();
  return (
    <div style={{ fontSize: "20px", color: "var(--ps-text-primary)", fontWeight: 700, fontFamily: "var(--ps-font-mono)", letterSpacing: "1px" }}>
      {h}h {String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s
    </div>
  );
}

interface LandingScreenProps {
  difficulty: string;
  hasPlayedToday: boolean;
  onDifficultyChange: (d: string) => void;
  onPlay: () => void;
}

export function LandingScreen({
  difficulty,
  hasPlayedToday,
  onDifficultyChange,
  onPlay,
}: LandingScreenProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 180px)",
        textAlign: "center",
        padding: "24px",
      }}
    >
      {/* Animated SVG Target & Arrow */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
        <svg className="ps-target-svg" viewBox="0 0 160 160" style={{ overflow: "visible" }}>
          <circle
            cx="80" cy="80" r="14"
            fill="none" stroke="var(--ps-amber)"
            style={{ animation: "ripple-expand 4.5s ease-out infinite", transformOrigin: "80px 80px" }}
          />
          <g style={{ animation: "target-wobble 4.5s ease-out infinite", transformOrigin: "80px 80px" }}>
            <circle cx="80" cy="80" r="56" fill="none" stroke="rgba(20, 184, 166, 0.15)" strokeWidth="1.5" strokeDasharray="6 4" />
            <circle cx="80" cy="80" r="42" fill="none" stroke="var(--ps-teal)" strokeWidth="3" />
            <circle cx="80" cy="80" r="28" fill="none" stroke="var(--ps-text-primary)" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="80" cy="80" r="14" fill="var(--ps-amber)" />
            <circle cx="80" cy="80" r="5" fill="#000" />
          </g>
          <g id="arrow-group" style={{ animation: "arrow-shoot 4.5s infinite", transformOrigin: "0px 0px" }}>
            <line x1="-32" y1="0" x2="-2" y2="0" stroke="var(--ps-text-primary)" strokeWidth="2" strokeLinecap="round" />
            <path d="M -32 -5 L -24 0 L -32 5 L -37 5 L -30 0 L -37 -5 Z" fill="var(--ps-teal)" />
            <polygon points="0,0 -8,-4 -6,0 -8,4" fill="var(--ps-amber)" />
          </g>
        </svg>
      </div>

      <Wordmark size="lg" style={{ marginBottom: "12px" }} />

      <p style={{ fontSize: "var(--ps-text-body)", color: "var(--ps-text-secondary)", maxWidth: "320px", lineHeight: "1.6", marginBottom: "32px" }}>
        Can you shoot a perfect prompt??
        <br />
        <br />
        Stop chatting with AI like it's your therapist and get the output in one clean shot. Thirsty data centers are counting on you.
      </p>

      {/* Difficulty selector */}
      <div style={{ marginBottom: "24px", width: "100%", maxWidth: "280px" }}>
        <div className="ps-glass-panel" style={{ display: "flex", background: "rgba(255, 255, 255, 0.01)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "4px", gap: "4px" }}>
          {(["BEGINNER", "PRO", "EXPERT"] as const).map((d) => {
            const isSelected = difficulty === d;
            return (
              <button
                key={d}
                onClick={() => {
                  soundManager.playClick();
                  onDifficultyChange(d);
                }}
                style={{
                  flex: 1,
                  height: "32px",
                  background: isSelected ? "var(--ps-amber)" : "transparent",
                  color: isSelected ? "#000" : "var(--ps-text-secondary)",
                  border: "none",
                  borderRadius: "20px",
                  fontSize: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "Space Grotesk",
                  letterSpacing: "0.05em",
                }}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA buttons */}
      {hasPlayedToday ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "6px", 
            padding: "6px 16px", 
            borderRadius: "9999px", 
            border: "1px solid var(--ps-teal)", 
            color: "var(--ps-teal)", 
            fontSize: "13px", 
            fontWeight: 500,
            marginBottom: "8px",
            fontFamily: "Space Grotesk"
          }}>
            <span>✓</span> You already played today
          </div>

          <div style={{ fontSize: "14px", color: "var(--ps-text-secondary)", marginBottom: "4px", fontFamily: "Space Grotesk" }}>
            come back tomorrow~
          </div>

          <CountdownTimer />
        </div>
      ) : (
        <button
          onClick={() => {
            soundManager.playClick();
            onPlay();
          }}
          style={{ width: "100%", maxWidth: "280px", height: "52px", background: "var(--ps-amber)", color: "#000", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 700, cursor: "pointer", transition: "transform 0.15s ease", fontFamily: "Space Grotesk" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Play Today's Challenge
        </button>
      )}

      <div style={{ marginTop: "40px", fontSize: "var(--ps-text-caption)", color: "var(--ps-text-secondary)", fontFamily: "var(--ps-font-mono)", lineHeight: "1.6" }}>
        💡 Fun Fact: A clear prompt and a vague one take the same effort to type. They don't take the same effort to run.
      </div>
    </div>
  );
}
