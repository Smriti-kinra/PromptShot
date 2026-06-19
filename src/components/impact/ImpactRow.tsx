import { useState } from "react";
import { ExplainerType } from "./explainerConfig";
import { ImpactExplainerModal } from "./ImpactExplainerModal";

interface ImpactRowProps {
  emoji: string;
  value: string;
  label: string;
  explainerType: ExplainerType;
  score?: { waterMl: number };
  personal?: { waterMl: number };
  community?: { waterLiters: number };
  size?: "sm" | "md";
}

export function ImpactRow({
  emoji,
  value,
  label,
  explainerType,
  score,
  personal,
  community,
  size = "md",
}: ImpactRowProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fontSize = size === "sm" ? "12px" : "14px";
  const valueFontSize = size === "sm" ? "11px" : "13px";

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
          padding: "3px 0",
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
          transform: pressed ? "scale(0.97)" : hovered ? "scale(1.01)" : "scale(1)",
          transition: "transform 0.12s ease",
        }}
      >
        <span style={{ fontSize: size === "sm" ? "13px" : "16px" }}>{emoji}</span>
        <span style={{ fontSize, color: "var(--ps-text-primary)", fontWeight: 600 }}>{value}</span>
        <span style={{ fontSize: valueFontSize, color: "var(--ps-text-secondary)" }}>{label}</span>
        <span
          style={{
            fontSize: "10px",
            color: "var(--ps-teal)",
            opacity: hovered ? 1 : 0.4,
            transition: "opacity 0.2s, transform 0.2s",
            transform: hovered ? "translateX(2px)" : "translateX(0)",
            marginLeft: "2px",
          }}
        >
          ⓘ
        </span>
      </button>

      {showModal && (
        <ImpactExplainerModal
          type={explainerType}
          onClose={() => setShowModal(false)}
          score={score}
          personal={personal}
          community={community}
        />
      )}
    </>
  );
}
export type { ExplainerType };
