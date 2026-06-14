import type { Challenge } from "../lib/supabase";
import { getBrevityColor } from "../lib/gameUtils";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { soundManager } from "../lib/sounds";

interface ChallengeScreenProps {
  challenge: Challenge | null;
  gameState: string;
  userPrompt: string;
  isLoading: boolean;
  onPromptChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function ChallengeScreen({
  challenge,
  gameState,
  userPrompt,
  isLoading,
  onPromptChange,
  onSubmit,
  onBack,
}: ChallengeScreenProps) {
  return (
    <>
      {/* Back button */}
      <button
        onClick={() => {
          soundManager.playClick();
          onBack();
        }}
        style={{
          background: "none",
          border: "none",
          color: "var(--ps-text-secondary)",
          fontSize: "14px",
          cursor: "pointer",
          padding: "8px 0",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontFamily: "Space Grotesk",
          marginBottom: "16px",
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ps-text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ps-text-secondary)")}
      >
        ‹ Back to Home Menu
      </button>

      {/* Wordmark */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <span style={{ fontFamily: "Space Grotesk", fontSize: "22px", fontWeight: 850, letterSpacing: "-0.04em", color: "var(--ps-text-primary)" }}>Prompt</span>
          <span style={{ fontFamily: "Space Grotesk", fontSize: "22px", fontWeight: 300, fontStyle: "italic", letterSpacing: "-0.03em", color: "var(--ps-teal)", paddingRight: "4px" }}>Shot</span>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--ps-amber)", alignSelf: "flex-end", marginBottom: "5px" }} />
        </div>
      </div>

      {isLoading && <LoadingSkeleton />}

      {/* Target output card */}
      {challenge && (
        <div className="ps-glass-panel" style={{ padding: "24px", marginBottom: "24px", background: "rgba(18, 28, 20, 0.4)" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <span style={{ background: "rgba(245,158,11,0.15)", color: "var(--ps-amber)", padding: "4px 12px", borderRadius: "9999px", fontSize: "var(--ps-text-caption)", fontWeight: 600 }}>
              {challenge.difficulty}
            </span>
          </div>
          <div style={{ color: "var(--ps-text-secondary)", fontSize: "var(--ps-text-secondary-size)", marginBottom: "8px" }}>
            Today's target output
          </div>
          <div
            style={{
              maxHeight: "240px",
              overflow: "auto",
              background: "#0A0A0A",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "8px",
              fontFamily: challenge.category === "CODE" ? "var(--ps-font-mono)" : "Space Grotesk",
              fontSize: "var(--ps-text-secondary-size)",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
            }}
          >
            {challenge.target_output}
          </div>
          <div style={{ color: "var(--ps-text-secondary)", fontSize: "var(--ps-text-caption)" }}>
            {challenge.char_count} characters
          </div>
        </div>
      )}

      {/* Prompt input */}
      {gameState === "challenge" && challenge && (
        <>
          <div style={{ color: "var(--ps-text-secondary)", fontSize: "var(--ps-text-secondary-size)", marginBottom: "8px" }}>
            Write the prompt that generates this:
          </div>
          <textarea
            value={userPrompt}
            onChange={(e) => {
              onPromptChange(e.target.value);
              soundManager.playClick();
            }}
            placeholder="Describe exactly what you want the AI to produce..."
            style={{
              width: "100%",
              minHeight: "140px",
              background: "#0A0A0A",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "16px",
              color: "var(--ps-text-primary)",
              fontSize: "var(--ps-text-body)",
              fontFamily: "var(--ps-font-mono)",
              resize: "vertical",
              marginBottom: "8px",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "var(--ps-text-caption)", color: getBrevityColor(userPrompt.length) }}>
              {userPrompt.length} characters
            </span>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onSubmit();
            }}
            disabled={!userPrompt.trim()}
            style={{
              width: "100%",
              height: "48px",
              background: userPrompt.trim() ? "var(--ps-amber)" : "#444",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "var(--ps-text-body)",
              fontWeight: 600,
              cursor: userPrompt.trim() ? "pointer" : "not-allowed",
              transition: "background 0.2s, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (userPrompt.trim()) {
                e.currentTarget.style.transform = "scale(1.01)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Shoot →
          </button>
        </>
      )}

      {/* Loading spinner */}
      {gameState === "loading" && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 16px",
              border: "3px solid var(--ps-amber)",
              borderRadius: "50%",
              borderTopColor: "transparent",
              animation: "spin 1.2s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ color: "var(--ps-text-secondary)", fontSize: "var(--ps-text-secondary-size)" }}>
            Shooting your prompt...
          </div>
        </div>
      )}
    </>
  );
}
