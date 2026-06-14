import { C } from "./constants";

interface ExamplesSectionProps {
  items: {
    category: string;
    bad: { label: string; prompt: string; why: string };
    good: { label: string; prompt: string; why: string };
  }[];
}

export function ExamplesSection({ items }: ExamplesSectionProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {items.map((item) => (
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
