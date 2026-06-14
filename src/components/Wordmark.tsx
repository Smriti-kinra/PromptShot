import React from "react";

/**
 * PromptShot wordmark — single source of truth.
 *
 * size="lg"  → 36px  (LandingScreen, AdmireScreen)
 * size="md"  → 24px  (ChallengeScreen, ResultsScreen header)
 * size="sm"  → 18px  (compact / inline use)
 */
interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

const sizes = {
  lg: 36,
  md: 24,
  sm: 18,
};

export function Wordmark({ size = "md", style }: WordmarkProps) {
  const px = sizes[size];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "var(--ps-font-ui)",
          fontSize: `${px}px`,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: "var(--ps-text-primary)",
          lineHeight: 1,
        }}
      >
        Prompt
      </span>
      <span
        style={{
          fontFamily: "var(--ps-font-ui)",
          fontSize: `${px}px`,
          fontWeight: 400,
          fontStyle: "italic",
          letterSpacing: "-0.03em",
          color: "var(--ps-teal)",
          lineHeight: 1,
        }}
      >
        Shot
      </span>
      <span
        className="ps-wordmark-dot"
        style={{
          width: `${Math.round(px * 0.18)}px`,
          height: `${Math.round(px * 0.18)}px`,
          borderRadius: "50%",
          background: "var(--ps-amber)",
          marginLeft: `${Math.round(px * 0.45)}px`,
          flexShrink: 0,
          alignSelf: "center",
        }}
      />
    </div>
  );
}
