import { computeWordDiff } from "../lib/diff";

interface PromptDiffProps {
  userPrompt: string;
  idealPrompt: string;
}

export function PromptDiff({ userPrompt, idealPrompt }: PromptDiffProps) {
  const tokens = computeWordDiff(userPrompt, idealPrompt);
  const hasRemovals = tokens.some((t) => t.type === "removed");
  const hasAdditions = tokens.some((t) => t.type === "added");

  if (!hasRemovals && !hasAdditions) {
    return (
      <div>
        <div
          className="ps-glass-panel"
          style={{
            background: "rgba(20, 184, 166, 0.03)",
            border: "1px solid rgba(20, 184, 166, 0.12)",
            padding: "16px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "var(--ps-text-secondary)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "block",
              marginBottom: "8px",
              fontFamily: "var(--ps-font-mono)",
            }}
          >
            Your Prompt
          </span>
          <div
            style={{
              fontFamily: "var(--ps-font-mono)",
              fontSize: "13px",
              lineHeight: "1.75",
              color: "var(--ps-text-primary)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {userPrompt}
          </div>
        </div>
        <div style={{ fontSize: "13px", color: "var(--ps-teal)", fontStyle: "italic", textAlign: "center", padding: "8px", fontWeight: 500 }}>
          ✓ Your prompt matched the ideal instructions almost exactly!
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Legend intentionally removed — visual diff only */}

      {/* Grid container */}
      <div className="ps-diff-container">
        {/* Yours (Left) */}
        <div
          className="ps-glass-panel"
          style={{
            background: "rgba(255, 95, 95, 0.03)",
            border: "1px solid rgba(255, 95, 95, 0.12)",
            padding: "16px",
            minHeight: "100px",
            maxHeight: "280px",
            overflowY: "auto",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "var(--ps-text-secondary)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "block",
              marginBottom: "8px",
              fontFamily: "var(--ps-font-mono)",
            }}
          >
            Your Prompt
          </span>
          <div
            style={{
              fontFamily: "var(--ps-font-mono)",
              fontSize: "13px",
              lineHeight: "1.75",
              color: "var(--ps-text-primary)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {tokens
              .filter((t) => t.type !== "added")
              .map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    background:
                      t.type === "removed" ? "rgba(255, 95, 95, 0.18)" : "transparent",
                    color:
                      t.type === "removed" ? "var(--ps-red)" : "var(--ps-text-primary)",
                    textDecoration: t.type === "removed" ? "line-through" : "none",
                    marginRight: "4px",
                    marginBottom: "6px",
                    borderRadius: "3px",
                    padding: t.type === "removed" ? "0 2px" : "0",
                    display: "inline-block",
                  }}
                >
                  {t.text}
                </span>
              ))}
          </div>
        </div>

        {/* Ideal (Right) */}
        <div
          className="ps-glass-panel"
          style={{
            background: "rgba(20, 184, 166, 0.03)",
            border: "1px solid rgba(20, 184, 166, 0.12)",
            padding: "16px",
            minHeight: "100px",
            maxHeight: "280px",
            overflowY: "auto",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "var(--ps-text-secondary)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "block",
              marginBottom: "8px",
              fontFamily: "var(--ps-font-mono)",
            }}
          >
            Ideal Prompt
          </span>
          <div
            style={{
              fontFamily: "var(--ps-font-mono)",
              fontSize: "13px",
              lineHeight: "1.75",
              color: "var(--ps-text-primary)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {tokens
              .filter((t) => t.type !== "removed")
              .map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    background:
                      t.type === "added" ? "rgba(20, 184, 166, 0.15)" : "transparent",
                    color:
                      t.type === "added" ? "var(--ps-teal)" : "var(--ps-text-primary)",
                    fontWeight: t.type === "added" ? 600 : 400,
                    marginRight: "4px",
                    marginBottom: "6px",
                    borderRadius: "3px",
                    padding: t.type === "added" ? "0 3px" : "0",
                    display: "inline-block",
                  }}
                >
                  {t.idealText ?? t.text}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
