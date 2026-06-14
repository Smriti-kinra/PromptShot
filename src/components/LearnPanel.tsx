import { useEffect, useState } from "react";
import { LEARN_CONTENT } from "../data/learnContent";
import { AnatomySection } from "./learn/AnatomySection";
import { MythsSection } from "./learn/MythsSection";
import { ExamplesSection } from "./learn/ExamplesSection";
import { FAQSection } from "./learn/FAQSection";
import { C } from "./learn/constants";

interface LearnPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string | null }) {
  return (
    <div style={{ marginBottom: "16px", marginTop: "8px" }}>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--ps-teal)",
          marginBottom: subtitle ? "4px" : 0,
          fontFamily: C.mono,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {title}
      </div>
      {subtitle && <div style={{ fontSize: "13px", color: "var(--ps-text-secondary)", fontFamily: C.font }}>{subtitle}</div>}
    </div>
  );
}

export function LearnPanel({ isOpen, onClose }: LearnPanelProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setRendered(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!rendered) return null;

  const [anatomy, myths, examples, faq] = LEARN_CONTENT.sections;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        opacity: visible ? 1 : 0,
        transition: "opacity 280ms ease",
      }}
    >
      <style>{`
        .learn-panel-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .learn-panel-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .learn-panel-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          border: 2px solid ${C.surface};
        }
        .learn-panel-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          borderRadius: "16px",
          width: "94%",
          maxWidth: "800px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "transform 280ms ease, width 0.3s, max-width 0.3s",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: `1px solid var(--ps-border)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <span style={{
              fontFamily: C.font,
              fontSize: "18px",
              fontWeight: 850,
              letterSpacing: "-0.04em",
              color: "var(--ps-text-primary)",
            }}>
              Prompt
            </span>
            <span style={{
              fontFamily: C.font,
              fontSize: "18px",
              fontWeight: 300,
              fontStyle: "italic",
              letterSpacing: "-0.03em",
              color: "var(--ps-teal)",
              paddingRight: "2px",
            }}>
              Shot
            </span>
            <span style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: "var(--ps-amber)",
              alignSelf: "center",
              marginTop: "4px",
              marginRight: "6px",
            }} />
            <span style={{
              fontFamily: C.font,
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--ps-text-primary)",
            }}>
              101
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--ps-text-secondary)",
              fontSize: "24px",
              cursor: "pointer",
              lineHeight: 1,
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        <div className="learn-panel-scroll" style={{ overflowY: "auto", padding: "20px 24px 32px", flex: 1 }}>
          <SectionHeader title={anatomy.title} subtitle={anatomy.subtitle} />
          <AnatomySection items={anatomy.items as any} />
          
          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "24px 0" }} />
          
          <SectionHeader title={myths.title} subtitle={myths.subtitle} />
          <MythsSection items={myths.items as any} />
          
          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "24px 0" }} />
          
          <SectionHeader title={examples.title} subtitle={examples.subtitle} />
          <ExamplesSection items={examples.items as any} />
          
          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "24px 0" }} />
          

          
          <SectionHeader title={faq.title} subtitle={faq.subtitle} />
          <FAQSection items={faq.items as any} />
          <div style={{ height: "20px" }} />
        </div>
      </div>
    </div>
  );
}
