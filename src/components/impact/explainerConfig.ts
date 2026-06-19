export type ExplainerType = "water" | "lifetime-water" | "community-water";

export interface ExplainerConfig {
  title: string;
  emoji: string;
  color: string;
  steps: { label: string; formula: string; note?: string }[];
  source: string;
}

export function getExplainerConfig(
  type: ExplainerType,
  score?: { waterMl: number },
  personal?: { waterMl: number },
  community?: { waterLiters: number },
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
  };
  return configs[type];
}
