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
          myth: 'Longer prompts with full background history are better',
          reality: 'Adding noise dilutes core instructions. Models already possess general knowledge — only specify the facts and constraints unique to your task.',
          verdict: 'FALSE'
        },
        {
          myth: 'Negative instructions (don\'t write X) always work',
          reality: 'AI models struggle with raw negative commands like "don\'t include Y". Frame instructions positively explaining what to focus on, or pair directives with explicit exclusions (e.g., "focus on X, without Y").',
          verdict: 'FALSE'
        },
        {
          myth: 'Prompt engineering is only about words, not parameters',
          reality: 'Your words define "what" to generate, but model parameters (like temperature) dictate creativity and predictability. Match your prompt structure to the model\'s active settings.',
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
      id: 'faq',
      title: 'FAQ',
      subtitle: null,
      items: [
        {
          question: 'What motivated creating PromptShot?',
          answer: 'Every time we ask AI a question, massive computer servers work in the background to generate answers. This process consumes electricity and requires fresh water to cool the hot servers down. PromptShot was created to show this resource impact and motivate writing accurate, one-shot prompts.'
        },
        {
          question: 'How is my score calculated?',
          answer: 'Three dimensions: Accuracy (Semantic Similarity 0–40 pts and Keyword Match 0–10 pts = 0–50 pts max), Format (Structural Match = 0–20 pts max), and Brevity (Green Efficiency: Token Economy 0–15 pts and Speed/Latency 0–15 pts = 0–30 pts max). Summing to 100 max.'
        },

        {
          question: 'Can I replay today\'s challenge?',
          answer: 'No — the game is once-per-day by design, like Wordle. This creates the social moment: everyone is working from the same target. A new challenge unlocks at midnight.'
        },
        {
          question: 'Is reverse-engineering a real prompt engineering skill?',
          answer: 'Yes — in production, engineers often work backwards from a required output format (a JSON schema, a report template, a test fixture) to a prompt that reliably generates it. PromptShot trains exactly this output-first thinking.'
        },
        {
          question: 'How do BEGINNER, PRO, and EXPERT challenges differ?',
          answer: 'BEGINNER challenges have short, unambiguous target outputs with clear structural signals. PRO challenges add multi-constraint targets: specific tone + structure + length simultaneously. EXPERT challenges require the player to infer implicit constraints from the output itself, such as a specific voice or technical format.'
        },
        {
          question: 'Does this help with Generative AI prompt writing or Agentic AI?',
          answer: 'PromptShot is designed specifically for Generative AI prompt writing. It teaches you how to write clear, high-quality instructions to get the exact output you want on the first attempt (one-shot). That skill is also a core pre-requisite for instructing autonomous agents effectively.'
        },
        {
          question: 'Why not just use an AI to write my prompts for me?',
          answer: 'Using an AI to write prompts for basic, everyday tasks is a humorous exercise in over-engineering. If we require machine intelligence to draft the instructions for another machine just to produce a simple list or paragraph, we have added redundant middleware to our own thoughts. Human-authored instructions preserve authentic intent, voice, and stylistic nuances.'
        }
      ]
    }
  ]
};
