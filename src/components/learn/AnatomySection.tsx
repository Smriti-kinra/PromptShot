import { C } from "./constants";

interface AnatomySectionProps {
  items: { label: string; description: string; example: string }[];
}

export function AnatomySection({ items }: AnatomySectionProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {items.map((item) => (
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
