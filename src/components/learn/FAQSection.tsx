import { useState } from "react";
import { C } from "./constants";

interface FAQSectionProps {
  items: { question: string; answer: string }[];
}

export function FAQSection({ items }: FAQSectionProps) {
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
