import { useEffect, useState } from "react";
import { LEARN_CONTENT } from "../../data/learnContent";

interface LearnPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const C = {
  bg: "#0B1610",
  surface: "#121C14",
  primary: "#D4E8D4",
  secondary: "#4A6B4A",
  mint: "#6EE09B",
  amber: "#F5C518",
  red: "#FF5F5F",
  border: "#243B27",
  font: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

function AnatomySection({ items }: { items: typeof LEARN_CONTENT.sections[0]["items"] }) {
  const anatomyItems = items as { label: string; description: string; example: string }[];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {anatomyItems.map((item) => (
        <div
          key={item.label}
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            paddingBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--ps-teal)", fontFamily: C.font }}>
              {item.label}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--ps-text-secondary)", margin: "0 0 8px", lineHeight: 1.5, fontFamily: C.font }}>
            {item.description}
          </p>
          <div
            style={{
              background: "rgba(20, 184, 166, 0.04)",
              borderRadius: "6px",
              padding: "8px 12px",
              fontFamily: C.mono,
              fontSize: "12px",
              color: "var(--ps-teal)",
              border: "1px solid rgba(20, 184, 166, 0.08)",
              display: "inline-block",
            }}
          >
            {item.example}
          </div>
        </div>
      ))}
    </div>
  );
}

function MythsSection({ items }: { items: typeof LEARN_CONTENT.sections[1]["items"] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const mythItems = items as { myth: string; reality: string; verdict: string }[];
  return (
    <div>
      {mythItems.map((item, i) => (
        <div key={i} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", padding: "12px 0" }}>
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              textAlign: "left",
              padding: "4px 0",
            }}
          >
            <span style={{ fontSize: "14px", color: "var(--ps-text-primary)", fontWeight: 500, fontFamily: C.font }}>
              <span style={{ color: C.red, marginRight: "8px", fontWeight: 700 }}>✗</span>
              "{item.myth}"
            </span>
            <span style={{ fontSize: "12px", color: "var(--ps-text-secondary)", fontFamily: C.font }}>
              {expanded === i ? "Hide Fact" : "Reveal Fact"}
            </span>
          </button>
          {expanded === i && (
            <div
              style={{
                fontSize: "13px",
                color: "var(--ps-text-secondary)",
                lineHeight: "1.6",
                marginTop: "8px",
                paddingLeft: "16px",
                borderLeft: "2px solid var(--ps-teal)",
                fontFamily: C.font,
              }}
            >
              <span style={{ color: "var(--ps-teal)", fontWeight: 700, marginRight: "4px" }}>✓ Fact:</span>
              {item.reality}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExamplesSection({ items }: { items: typeof LEARN_CONTENT.sections[2]["items"] }) {
  const exampleItems = items as {
    category: string;
    bad: { label: string; prompt: string; why: string };
    good: { label: string; prompt: string; why: string };
  }[];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {exampleItems.map((item) => (
        <div key={item.category}>
          <span
            style={{
              background: "rgba(20, 184, 166, 0.08)",
              color: "var(--ps-teal)",
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "10px",
              fontWeight: 700,
              display: "inline-block",
              marginBottom: "10px",
              fontFamily: C.mono,
              letterSpacing: "0.05em",
            }}
          >
            {item.category}
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "rgba(255, 255, 255, 0.02)",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.04)",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: C.red, fontWeight: 700, fontFamily: C.mono, textTransform: "uppercase", marginBottom: "2px" }}>
                ✗ Weak Prompt
              </div>
              <div style={{ fontFamily: C.mono, fontSize: "13px", color: "var(--ps-text-primary)", marginBottom: "4px", lineHeight: 1.5 }}>
                "{item.bad.prompt}"
              </div>
              <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", fontFamily: C.font, lineHeight: 1.4 }}>
                {item.bad.why}
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.04)", paddingTop: "12px" }}>
              <div style={{ fontSize: "11px", color: "var(--ps-teal)", fontWeight: 700, fontFamily: C.mono, textTransform: "uppercase", marginBottom: "2px" }}>
                ✓ Strong Prompt
              </div>
              <div style={{ fontFamily: C.mono, fontSize: "13px", color: "var(--ps-text-primary)", marginBottom: "4px", lineHeight: 1.5 }}>
                "{item.good.prompt}"
              </div>
              <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", fontFamily: C.font, lineHeight: 1.4 }}>
                {item.good.why}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FAQSection({ items }: { items: typeof LEARN_CONTENT.sections[4]["items"] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const faqItems = items as { question: string; answer: string }[];
  return (
    <div>
      {faqItems.map((item, i) => (
        <div key={i} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", padding: "12px 0" }}>
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              textAlign: "left",
              padding: "4px 0",
            }}
          >
            <span style={{ fontSize: "14px", color: "var(--ps-text-primary)", fontWeight: 500, fontFamily: C.font, lineHeight: 1.4 }}>
              {item.question}
            </span>
            <span style={{ fontSize: "14px", color: "var(--ps-text-secondary)", fontFamily: C.font }}>
              {expanded === i ? "−" : "+"}
            </span>
          </button>
          {expanded === i && (
            <div style={{ fontSize: "13px", color: "var(--ps-text-secondary)", lineHeight: "1.6", marginTop: "8px", fontFamily: C.font }}>
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
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

  const [anatomy, myths, examples, impact, faq] = LEARN_CONTENT.sections;

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
          <AnatomySection items={anatomy.items} />
          
          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "24px 0" }} />
          
          <SectionHeader title={myths.title} subtitle={myths.subtitle} />
          <MythsSection items={myths.items} />
          
          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "24px 0" }} />
          
          <SectionHeader title={examples.title} subtitle={examples.subtitle} />
          <ExamplesSection items={examples.items} />
          
          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "24px 0" }} />
          
          <SectionHeader title={impact.title} subtitle={impact.subtitle} />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {impact.items.map((item: any) => (
              <div key={item.metric} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--ps-text-primary)", fontFamily: C.font, marginBottom: "4px" }}>
                  {item.metric}
                </div>
                <div style={{ fontSize: "13px", color: "var(--ps-teal)", fontWeight: 600, fontFamily: C.font, marginBottom: "4px" }}>
                  {item.point}
                </div>
                <div style={{ fontSize: "12px", color: "var(--ps-text-secondary)", fontFamily: C.font, lineHeight: "1.5" }}>
                  {item.detail}
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "24px 0" }} />
          
          <SectionHeader title={faq.title} subtitle={faq.subtitle} />
          <FAQSection items={faq.items} />
          <div style={{ height: "20px" }} />
        </div>


      </div>
    </div>
  );
}
