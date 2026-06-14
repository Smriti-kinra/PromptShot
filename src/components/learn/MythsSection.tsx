import { useState } from "react";
import { C } from "./constants";

interface MythsSectionProps {
  items: { myth: string; reality: string; verdict: string }[];
}

export function MythsSection({ items }: MythsSectionProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div>
      {items.map((item, i) => (
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
