export const LEARN_CONTENT = {
  sections: [
    {
      id: 'anatomy',
      title: 'Anatomy of a good prompt',
      subtitle: 'Every strong prompt has these five core parts',
      items: [
        {
          label: 'Instruction / Task',
          color: 'amber',
          description: 'The specific action you want the AI to perform. Use clear, direct action verbs like "write", "translate", "summarize", "debug", or "calculate" rather than vague requests.',
          example: '→ "Write a Python function called `factorial`..."'
        },
        {
          label: 'Context',
          color: 'amber',
          description: 'Background information, target audience, or scenario constraints. Setting a specific role/persona (e.g., tech writer, professional chef) and target audience (e.g., non-technical managers) shapes the output depth.',
          example: '→ "...explaining the concept to a non-technical product manager"'
        },
        {
          label: 'Input Data',
          color: 'amber',
          description: 'The specific text, database query, or source code the model needs to process. Isolate input content from instructions using clear delimiters (such as triple backticks or XML tags) to prevent parsing confusion.',
          example: '→ "...using only the customer reviews enclosed in <reviews> tags..."'
        },
        {
          label: 'Output Format',
          color: 'amber',
          description: 'The exact layout, structure, or output schema. Explicitly specify formats like bulleted lists, markdown tables, JSON, code blocks, or specific paragraph limits to avoid default formatting styles.',
          example: '→ "...formatted as a markdown table with columns for metric name, value, and unit"'
        },
        {
          label: 'Tone & Persona (Style)',
          color: 'amber',
          description: 'The emotional target, voice, or style constraints. Specify tone targets (e.g., empathetic, formal, sarcastic, or casual) and character behaviors to match the context.',
          example: '→ "...using a formal, data-backed tone as a senior analyst"'
        }
      ]
    },
    {
      id: 'myths',
      title: 'Prompt myths that waste your time',
      subtitle: 'Common assumptions that are just wrong',
      items: [
        {
          myth: 'Longer prompts produce better outputs',
          reality: 'Extra words add noise and dilute instructions. A 50-word precise prompt using structured anatomy beats a 250-word rambling one every time.',
          verdict: 'FALSE'
        },
        {
          myth: 'Negative instructions (don\'t write X) always work',
          reality: 'AI models struggle with raw negative commands like "don\'t include Y". Frame instructions positively explaining what to focus on, or pair directives with explicit exclusions (e.g., "focus on X, without Y").',
          verdict: 'FALSE'
        },
        {
          myth: 'Prompt engineering is only about words, not parameters',
          reality: 'Think of AI like a dial between "strict and literal" and "creative and unpredictable." Your words tell the AI *what* to do, but behind the scenes there\'s a creativity setting. Turn it low and the AI gives safe, consistent answers. Turn it high and it gets inventive — but might wander. Good prompting means knowing which mode you\'re writing for.',
          verdict: 'FALSE'
        },
        {
          myth: 'Vague prompts give more creative results',
          reality: 'Vagueness produces generic, safe defaults. True creativity comes from specifying the creative direction—defining explicit constraints, tone, and style.',
          verdict: 'FALSE'
        },
        {
          myth: 'Saying "please" or "as an AI" affects the response',
          reality: 'Politeness does not affect response quality. Redundant phrases like "as an AI" waste character counts and token budgets without providing any benefit.',
          verdict: 'FALSE'
        },
        {
          myth: 'Repeating the same prompt differently will fix it',
          reality: 'If the output is wrong, repeating the exact prompt will yield similar errors. Diagnose which component (instruction, context, or format) failed, and adjust that specific element instead of a full rewrite.',
          verdict: 'WASTEFUL'
        },
        {
          myth: 'You need to explain the whole background',
          reality: 'The AI knows general knowledge. Only explain what is specific to your situation that it cannot infer.',
          verdict: 'FALSE'
        }
      ]
    },
    {
      id: 'examples',
      title: 'Good vs bad — side by side',
      subtitle: 'The same request, two very different prompts',
      items: [
        {
          category: 'PARAGRAPH',
          bad: {
            label: 'Weak',
            prompt: 'Write about climate change',
            why: 'Lacks format, length limit, target audience, tone guidelines, and specific topic angle.'
          },
          good: {
            label: 'Strong',
            prompt: 'Act as a science educator. In 3 sentences, explain how melting Arctic ice affects global ocean currents. Use a curious, engaging tone. Target audience: 14-year-olds. Exclude chemical formulas.',
            why: 'Specifies persona (science educator), task (explain ice/currents), format (3 sentences), audience (14-year-olds), and a positive focus with a clear exclusion constraint.'
          }
        },
        {
          category: 'CODE',
          bad: {
            label: 'Weak',
            prompt: 'Make code for a toggle button',
            why: 'No language, no framework, no state description, no output constraints.'
          },
          good: {
            label: 'Strong',
            prompt: 'Write a React functional component for a button toggling between "Start" and "Stop" labels on click. Use TypeScript and useState hook. Return ONLY the code in a single markdown block without styling or explanations.',
            why: 'Specifies language (TypeScript), framework (React), exact behavior (useState toggle), and format constraint (code only, no explanation).'
          }
        },
        {
          category: 'LIST',
          bad: {
            label: 'Weak',
            prompt: 'Give me tips for better sleep',
            why: 'Lacks list size, specific structure per item, tone guidelines, and source constraints.'
          },
          good: {
            label: 'Strong',
            prompt: 'As a health advisor, list 5 science-backed tips for improving sleep routine. Format: Bullet list, each starting with a bold 3-word action followed by a single sentence explanation. Focus on habits, without recommending supplements.',
            why: 'Specifies persona (health advisor), count (5), format (bullet list + specific structure), source (science-backed), and explicit focus/exclusion parameter.'
          }
        }
      ]
    },
    {
      id: 'impact',
      title: 'Why efficient prompts matter',
      subtitle: 'Based on "Making AI Less Thirsty" — Li et al., UC Riverside (2023). All values are modelled estimates, not exact measurements.',
      items: [
        {
          metric: 'One-shot accuracy',
          point: 'The cleanest environmental win is not needing a second or third attempt.',
          detail: 'The UCR study estimates that a single conversational round (20–50 queries) evaporates roughly 500ml of water for cooling. That implies ~10–25ml per query — so multi-step follow-ups multiply the footprint. Importantly, these are modelled averages: real usage varies significantly by data center, cooling method, and energy grid.'
        },
        {
          metric: 'Constraint density',
          point: 'Useful constraints reduce wandering output.',
          detail: 'Format, audience, tone, inclusions, and exclusions give the model a narrower target. That means less wasted generation, fewer tokens processed, and fewer correction loops — each of which carries an approximate resource cost.'
        },
        {
          metric: 'Right-sized context',
          point: 'Context should be specific, not encyclopedic.',
          detail: 'The model already has general knowledge. Add only the facts it cannot infer: audience, goal, source material, and what would make the answer unusable. Every extra sentence in your prompt is extra tokens processed.'
        },
        {
          metric: 'Negative space',
          point: 'Saying what to avoid is often cheaper than cleaning it up later.',
          detail: 'Negative constraints prevent common failure modes: jargon, sales language, unsafe advice, extra sections, unsupported claims, or code dependencies. One exclusion clause can prevent two rounds of corrections.'
        }
      ]
    },
    {
      id: 'faq',
      title: 'FAQ',
      subtitle: null,
      items: [
        {
          question: 'How is my score calculated?',
          answer: 'Three dimensions: Accuracy (Semantic Similarity 0–40 pts and Keyword Match 0–10 pts = 0–50 pts max), Format (Structural Match = 0–20 pts max), and Brevity (Green Efficiency: Token Economy 0–15 pts and Speed/Latency 0–15 pts = 0–30 pts max). Summing to 100 max.'
        },
        {
          question: 'Why does brevity matter if the output is accurate?',
          answer: 'Every word you send to an AI model increases the computational load and thus energy and water usage. The 2023 paper "Making AI Less Thirsty" by Li et al. (UC Riverside) modelled that a conversational round consumes ~500ml of water. While this varies significantly by infrastructure and model, the directional insight holds: shorter, more precise prompts reduce the token workload per query. Achieving the same result with 40 words instead of 200 means less processing — and less resource use.'
        },
        {
          question: 'How does AI actually use water?',
          answer: 'AI models run in massive data centers that generate significant heat. A 2023 study by researchers at the University of California, Riverside (UCR) titled "Making AI Less Thirsty" estimates that a single conversational round (20-50 queries) evaporates roughly 500ml (half a liter) of water for server cooling and electricity generation. That means each query directly consumes 10-25ml of freshwater. Writing accurate, one-shot prompts avoids multi-step chat loops, directly conserving water resources.'
        },
        {
          question: 'Why show environmental impact in a game?',
          answer: 'Because the skill gap in prompting doesn\'t feel real until you see its cost. A person who needs 5 follow-up prompts to get the same output as someone who got it in one used 5× the resources. Prompt engineering is not just a productivity skill — it\'s a conservation behaviour.'
        },
        {
          question: 'What should I optimize for first?',
          answer: 'First-shot success. A short prompt that misses the target is not efficient if it creates three retries. The best prompt is clear enough to land the output once, then brief enough to avoid unnecessary tokens.'
        },
        {
          question: 'What is a perfect prompt?',
          answer: 'The shortest sequence of words that produces the target output with no follow-ups needed. It specifies task, format, context, and constraints — but nothing extra. Perfect prompts are rarely discovered on the first try. That\'s why this is a skill, not a trick.'
        },
        {
          question: 'Can I replay today\'s challenge?',
          answer: 'No — the game is once-per-day by design, like Wordle. This creates the social moment: everyone is working from the same target. A new challenge unlocks at midnight.'
        },
        {
          question: 'Is reverse-engineering a real prompt engineering skill?',
          answer: 'Yes — and a particularly demanding one. In production, engineers often work backwards from a required output format (a JSON schema, a report template, a test fixture) to a prompt that reliably generates it. PromptShot trains exactly this: given a precise output, can you write the minimal instruction that produces it? This teaches output-first thinking — the same discipline used when writing prompts for structured data extraction, code generation, and content pipelines.'
        },
        {
          question: 'How do BEGINNER, PRO, and EXPERT challenges differ?',
          answer: 'BEGINNER challenges have short, unambiguous target outputs with clear structural signals — a function definition, a list, a simple paragraph. PRO challenges add multi-constraint targets: specific tone + structure + length simultaneously. EXPERT challenges require the player to infer implicit constraints from the output itself, such as a specific voice, a domain-specific schema, or a precise technical format that isn\'t explicitly described.'
        },
        {
          question: 'Does this help with Generative AI prompt writing or Agentic AI?',
          answer: 'PromptShot is designed specifically for Generative AI prompt writing (prompt engineering). It teaches you how to write clear, high-quality instructions to get the exact output you want on the first attempt (one-shot). It is not for Agentic AI (which involves building autonomous agent loops), though mastering precise prompt writing is also a core skill needed to instruct agents effectively.'
        },
        {
          question: 'Why not just use an AI to write my prompts for me?',
          answer: 'Using an AI to write prompts for basic, everyday tasks is a humorous exercise in over-engineering. If we require machine intelligence to draft the instructions for another machine just to produce a simple list or paragraph, we have added redundant middleware to our own thoughts. Setting environmental footprints aside, direct human-authored instructions preserve authentic intent, voice, and stylistic nuances. The human touch remains essential; delegating basic prompt crafting is simply outsourcing what our own minds can write in seconds.'
        }
      ]
    }
  ]
};
