import { useState, useEffect } from "react";

// ── Calculation explainer popup ────────────────────────────────────────────────

type ExplainerType = "water" | "co2" | "lifetime-water" | "lifetime-co2" | "community-water" | "community-co2";

interface ExplainerConfig {
  title: string;
  emoji: string;
  color: string;
  steps: { label: string; formula: string; note?: string }[];
  source: string;
}

function getExplainerConfig(
  type: ExplainerType,
  score?: { waterMl: number; co2Grams: number },
  personal?: { waterMl: number; co2Grams: number },
  community?: { waterLiters: number; co2Kg: number },
): ExplainerConfig {
  const configs: Record<ExplainerType, ExplainerConfig> = {
    water: {
      title: "How water usage is calculated",
      emoji: "💧",
      color: "var(--ps-teal)",
      steps: [
        {
          label: "Count tokens processed",
          formula: `Input tokens + Output tokens = total tokens`,
          note: "Claude tracks exact token counts via the API response",
        },
        {
          label: "Apply UCR water factor",
          formula: `total_tokens × 0.033 ml/token ≈ ${score?.waterMl ?? "—"}ml`,
          note: 'Li et al. "Making AI Less Thirsty" (UC Riverside, 2023) estimates 10–25ml per conversational round of ~20–50 queries, implying ~0.033ml per 100 tokens for modern LLMs',
        },
        {
          label: "Result",
          formula: `~${score?.waterMl ?? "—"}ml water evaporated for cooling`,
          note: "Real usage varies by data center, cooling system, and energy grid — this is a modelled estimate",
        },
      ],
      source: 'Li et al., "Making AI Less Thirsty: Uncovering and Addressing the Secret Water Footprint of AI Models," UC Riverside (2023). arXiv:2304.03271',
    },
    co2: {
      title: "How CO₂ is calculated",
      emoji: "🌲",
      color: "var(--ps-teal)",
      steps: [
        {
          label: "Count tokens processed",
          formula: "Input tokens + Output tokens = total tokens",
          note: "Sourced from Claude API usage metadata",
        },
        {
          label: "Apply carbon intensity factor",
          formula: `total_tokens × 0.00033 g/token ≈ ${score?.co2Grams?.toFixed(2) ?? "—"}g CO₂`,
          note: "Derived from average US data center PUE of 1.5 and average grid carbon intensity of ~0.45 kg CO₂/kWh",
        },
        {
          label: "Result",
          formula: `~${score?.co2Grams?.toFixed(2) ?? "—"}g of CO₂ emitted`,
          note: "This is equivalent to driving a car approximately 0.001km — small per query, significant at scale",
        },
      ],
      source: "Patterson et al., \"Carbon Emissions and Large Neural Network Training,\" Google & UC Berkeley (2021). IEA Data Center Energy Efficiency (2023).",
    },
    "lifetime-water": {
      title: "Your lifetime water savings",
      emoji: "💧",
      color: "var(--ps-teal)",
      steps: [
        {
          label: "Baseline assumption",
          formula: "50ml per attempt (average 5-turn chat session)",
          note: "A typical user without prompt training makes 4–6 follow-up corrections, multiplying water usage",
        },
        {
          label: "Your actual usage per game",
          formula: "Measured from your real token counts via Claude API",
        },
        {
          label: "Savings formula",
          formula: "50ml − actual_usage = water_saved per game",
          note: "Summed across all your PromptShot games",
        },
        {
          label: "Your total",
          formula: `~${personal?.waterMl ?? 0}ml saved across all sessions`,
          note: "Modelled estimate. If you scored above 80/100 consistently, you consistently out-performed the average user",
        },
      ],
      source: 'Li et al., "Making AI Less Thirsty," UC Riverside (2023). Baseline derived from industry average multi-turn session analysis.',
    },
    "lifetime-co2": {
      title: "Your lifetime CO₂ savings",
      emoji: "🌲",
      color: "var(--ps-teal)",
      steps: [
        {
          label: "Baseline CO₂ per 5-turn session",
          formula: "~0.5g CO₂ (5 × 0.1g per query average)",
        },
        {
          label: "Your actual CO₂",
          formula: "Measured from your token counts via Claude API",
        },
        {
          label: "Savings formula",
          formula: "0.5g − actual_co2 = co2_saved per game",
        },
        {
          label: "Your total",
          formula: `~${personal?.co2Grams?.toFixed(2) ?? "0"}g CO₂ prevented`,
          note: "Equivalent to approximately 0.1m of car travel not taken",
        },
      ],
      source: "Patterson et al., Carbon Emissions and Large Neural Network Training (2021). IEA Data Center Energy Efficiency (2023).",
    },
    "community-water": {
      title: "Community water savings",
      emoji: "💧",
      color: "var(--ps-teal)",
      steps: [
        {
          label: "Seed baseline",
          formula: "12,450L starting value (launch day estimation)",
          note: "Based on estimated 830 average users × 15ml savings each",
        },
        {
          label: "Live tracking",
          formula: "Each game submission adds: 50ml − player's actual usage",
          note: "Pulled from the Supabase scores table in real-time",
        },
        {
          label: "Community total",
          formula: `~${community?.waterLiters?.toLocaleString(undefined, { maximumFractionDigits: 1 }) ?? "—"}L saved`,
          note: "This is a modelled estimate based on the UCR research framework",
        },
      ],
      source: 'Li et al., "Making AI Less Thirsty," UC Riverside (2023). Community data from live Supabase scores table.',
    },
    "community-co2": {
      title: "Community CO₂ savings",
      emoji: "🌲",
      color: "var(--ps-teal)",
      steps: [
        {
          label: "Seed baseline",
          formula: "124.5kg starting value",
          note: "Equivalent to ~500km of car travel",
        },
        {
          label: "Live tracking",
          formula: "Each game adds: 0.5g − player's actual CO₂",
          note: "Pulled from the Supabase scores table",
        },
        {
          label: "Community total",
          formula: `~${community?.co2Kg?.toLocaleString(undefined, { maximumFractionDigits: 1 }) ?? "—"}kg CO₂ prevented`,
        },
      ],
      source: "Patterson et al., Carbon Emissions and Large Neural Network Training (2021).",
    },
  };
  return configs[type];
}

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

  return (
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
    </div>
  );
}

// ── Clickable impact metric row ────────────────────────────────────────────────

interface ImpactRowProps {
  emoji: string;
  value: string;
  label: string;
  explainerType: ExplainerType;
  score?: { waterMl: number; co2Grams: number };
  personal?: { waterMl: number; co2Grams: number };
  community?: { waterLiters: number; co2Kg: number };
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
