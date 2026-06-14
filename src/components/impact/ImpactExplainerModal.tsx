import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ExplainerType, getExplainerConfig } from "./explainerConfig";

interface ImpactExplainerModalProps {
  type: ExplainerType;
  onClose: () => void;
  score?: { waterMl: number; co2Grams: number };
  personal?: { waterMl: number; co2Grams: number };
  community?: { waterLiters: number; co2Kg: number };
}

export function ImpactExplainerModal({
  type,
  onClose,
  score,
  personal,
  community,
}: ImpactExplainerModalProps) {
  const [visible, setVisible] = useState(false);
  const config = getExplainerConfig(type, score, personal, community);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 240);
  };

  return createPortal(
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        opacity: visible ? 1 : 0,
        transition: "opacity 240ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--ps-surface)",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "440px",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "0 0 24px",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.92) translateY(12px)",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          border: `1px solid ${config.color}`,
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px 24px 20px", borderBottom: "1px solid var(--ps-border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>{config.emoji}</span>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--ps-text-primary)", fontFamily: "var(--ps-font-ui)" }}>
                {config.title}
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{ background: "none", border: "none", color: "var(--ps-text-secondary)", fontSize: "22px", cursor: "pointer", lineHeight: 1, padding: "4px", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ps-text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ps-text-secondary)")}
            >
              ×
            </button>
          </div>
        </div>

        {/* Steps */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "0" }}>
          {config.steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "16px",
                opacity: 0,
                animation: `fadeInUp 0.3s ease-out ${0.1 + i * 0.08}s forwards`,
              }}
            >
              {/* Step connector */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: `rgba(20, 184, 166, 0.15)`,
                  border: `1.5px solid ${config.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: config.color,
                  fontFamily: "var(--ps-font-mono)",
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                {i < config.steps.length - 1 && (
                  <div style={{ width: "1.5px", flex: 1, background: "var(--ps-border)", margin: "4px 0", minHeight: "20px" }} />
                )}
              </div>

              {/* Step content */}
              <div style={{ paddingBottom: i < config.steps.length - 1 ? "20px" : "0", flex: 1 }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--ps-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px", fontFamily: "var(--ps-font-ui)" }}>
                  {step.label}
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--ps-border)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontFamily: "var(--ps-font-mono)",
                  fontSize: "13px",
                  color: config.color,
                  fontWeight: 500,
                  lineHeight: "1.5",
                  marginBottom: step.note ? "6px" : "0",
                }}>
                  {step.formula}
                </div>
                {step.note && (
                  <div style={{ fontSize: "11px", color: "var(--ps-text-secondary)", lineHeight: "1.5", paddingLeft: "4px" }}>
                    {step.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
}
