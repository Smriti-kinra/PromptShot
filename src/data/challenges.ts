export interface Challenge {
  id: string;
  category:
    | "PARAGRAPH"
    | "CODE"
    | "LIST"
    | "ROLE"
    | "TONE"
    | "CONSTRAINTS";
  difficulty: "BEGINNER" | "PRO" | "EXPERT";
  skill: string;
  impactLesson: string;
  targetOutput: string;
  idealPrompt: string;
  charCount: number;
  idealWaterMl?: number;
  idealCo2Grams?: number;
}

export const DAILY_CHALLENGES: Challenge[] = [
  // BEGINNER
  {
    id: "b001",
    category: "PARAGRAPH",
    difficulty: "BEGINNER",
    skill: "Physics explanation",
    impactLesson: "Setting strict length limits like 'three sentences' prevents the model from generating long, unnecessary paragraphs.",
    targetOutput: "Black holes are regions of space where gravity is so strong that nothing, not even light, can escape. The boundary surrounding a black hole is called the event horizon. Once anything crosses this line, it cannot return.",
    idealPrompt: "Explain what a black hole and its event horizon are in three sentences. Mention that gravity prevents light from escaping.",
    charCount: 251,
    idealWaterMl: 11,
    idealCo2Grams: 0.111
  },
  {
    id: "b002",
    category: "TONE",
    difficulty: "BEGINNER",
    skill: "Friendly text cancellation",
    impactLesson: "Using short bulleted instructions instead of full sentence descriptions yields clean results with less input tokens.",
    targetOutput: "Hey Priya, I'm so sorry but I have to bail tonight 😞 I've had the worst headache all day and I know I'd be terrible company. Can we reschedule for next weekend? I'll make it up to you!",
    idealPrompt: "Text to Priya canceling tonight, headache, apologize, suggest rescheduling next weekend.",
    charCount: 184,
    idealWaterMl: 10,
    idealCo2Grams: 0.105
  },
  {
    id: "b003",
    category: "ROLE",
    difficulty: "BEGINNER",
    skill: "Analogy builder",
    impactLesson: "Role directives like 'to a kid' establish default formatting and vocabulary assumptions, reducing description length.",
    targetOutput: "Imagine a clock on a super fast spaceship. To us watching from Earth, that clock ticks slower than ours. This happens because time bends when you travel close to the speed of light. It is called time dilation.",
    idealPrompt: "Explain time dilation on a fast spaceship to a kid. Mention clocks ticking slower and speed of light in 3 sentences.",
    charCount: 226,
    idealWaterMl: 11,
    idealCo2Grams: 0.109
  },
  {
    id: "b004",
    category: "LIST",
    difficulty: "BEGINNER",
    skill: "Structured list generation",
    impactLesson: "Specifying exact separators like 'separated by commas' prevents the model from adding extra bullet formatting.",
    targetOutput: "Edrik Stormweaver, Edrik Valerius, Edrik Blackwood, Edrik Thorn, Edrik Ironwood, Edrik Shadowend, Edrik Dawnrunner, Edrik Frostfield, Edrik Kingslayer, Edrik Wyrmbreaker.",
    idealPrompt: "List exactly 10 fantasy last names starting with capital letters, paired with first name Edrik, separated by commas.",
    charCount: 180,
    idealWaterMl: 11,
    idealCo2Grams: 0.106
  },
  {
    id: "b005",
    category: "TONE",
    difficulty: "BEGINNER",
    skill: "Polite request",
    impactLesson: "Direct and polite framing avoids the need for rewriting prompts to correct passive-aggressive outputs.",
    targetOutput: "Hey roommates, could we please make sure to wash all pots and pans tonight? The sink is completely full and it's getting hard to prep breakfast in the morning. Thanks for understanding!",
    idealPrompt: "Roommate text politely asking to wash pots and pans tonight because sink is full and morning breakfast prep is hard.",
    charCount: 211,
    idealWaterMl: 11,
    idealCo2Grams: 0.107
  },
  {
    id: "b006",
    category: "PARAGRAPH",
    difficulty: "BEGINNER",
    skill: "Logic riddle solver",
    impactLesson: "Asking the model to explain its reasoning in the first prompt saves you from prompting it for clarification later.",
    targetOutput: "It would still take 30 minutes. All 10 shirts can dry at the same time on the clothesline. Putting more shirts out to dry does not increase the drying time for each individual shirt.",
    idealPrompt: "Answer the riddle: if it takes 30 mins to dry 5 shirts, how long to dry 10? Explain that they dry at the same time.",
    charCount: 198,
    idealWaterMl: 11,
    idealCo2Grams: 0.107
  },
  {
    id: "b007",
    category: "TONE",
    difficulty: "BEGINNER",
    skill: "Copywriting rewrite",
    impactLesson: "Providing key facts to compile in a rewrite task keeps the output focused and prevents hallucinated details.",
    targetOutput: "Baking soda is a natural, non-toxic cleaner. It absorbs tough odors, scrubs away kitchen stains without scratching surfaces, and balances pH levels, making it safe for kids and pets.",
    idealPrompt: "Rewrite dry technical baking soda details into a warm, feature-focused blurb highlighting safety for kids and pets.",
    charCount: 190,
    idealWaterMl: 11,
    idealCo2Grams: 0.107
  },

  // PRO
  {
    id: "p001",
    category: "CONSTRAINTS",
    difficulty: "PRO",
    skill: "Technical comparison",
    impactLesson: "Word constraints like 'under 50 words' force high information density, minimizing both prompt and output tokens.",
    targetOutput: "CUDA is Nvidia's proprietary platform, offering deep integration and maximum performance on Nvidia hardware. OpenCL is an open, cross-platform standard supporting AMD, Intel, and Nvidia chips, but with less optimization. Choose CUDA for Nvidia GPUs, and OpenCL for heterogeneous hardware.",
    idealPrompt: "Compare CUDA and OpenCL programming models. Highlight hardware compatibility and performance, and provide a recommendation. Under 50 words.",
    charCount: 298,
    idealWaterMl: 12,
    idealCo2Grams: 0.118
  },
  {
    id: "p002",
    category: "LIST",
    difficulty: "PRO",
    skill: "Creative ideas brainstorming",
    impactLesson: "Requesting structured elements (like bold titles and descriptions) in one go avoids incremental layout edits.",
    targetOutput: "Here are 3 ways to monetize a high-end PC:\n1. 3D Rendering & Video Editing: Rent your GPU power on decentralized networks.\n2. Game Server Hosting: Host multiplayer game servers for a small monthly fee.\n3. AI Model Tuning: Run local low-rank adaptation training runs for clients.",
    idealPrompt: "List 3 creative, legal ways a student can earn income using a gaming PC. Use numbered list with bold titles and short descriptions.",
    charCount: 292,
    idealWaterMl: 12,
    idealCo2Grams: 0.116
  },
  {
    id: "p003",
    category: "CODE",
    difficulty: "PRO",
    skill: "Bash scripting",
    impactLesson: "Outlining logic details (loops, files, intervals) upfront ensures the code works on compile without debug iteration.",
    targetOutput: "```bash\n#!/bin/bash\n# Continually ping Google DNS and log failures\nwhile true; do\n  if ! ping -c 1 8.8.8.8 >/dev/null 2>&1; then\n    echo \"[$(date)] Ping failed!\" >> ping_errors.log\n  fi\n  sleep 5\ndone\n```",
    idealPrompt: "Write a bash script containing a while loop that pings 8.8.8.8. If it fails, log timestamped failure message to ping_errors.log. Sleep 5s.",
    charCount: 227,
    idealWaterMl: 11,
    idealCo2Grams: 0.111
  },
  {
    id: "p004",
    category: "ROLE",
    difficulty: "PRO",
    skill: "Conceptual explanation",
    impactLesson: "Using explicit analogies like 'mailbox' grounds the model's concepts, keeping explanation length compact.",
    targetOutput: "Public key cryptography is like a mailbox. Anyone can put a letter in through the slot using the public key, which is open to everyone. But only the owner of the mailbox can open it and read the letters using the private key, which is kept secret. This keeps messages safe.",
    idealPrompt: "Explain public key cryptography using a mailbox lock-and-key analogy. Cover how public and private keys operate to secure messages.",
    charCount: 294,
    idealWaterMl: 12,
    idealCo2Grams: 0.116
  },
  {
    id: "p005",
    category: "CODE",
    difficulty: "PRO",
    skill: "CSS Glassmorphism design",
    impactLesson: "Using design terms like 'glassmorphism' lets the model reference its preset definitions, saving syntax guidelines.",
    targetOutput: "```css\n.card {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  border-radius: 16px;\n  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);\n  padding: 24px;\n  color: #fff;\n}\n```",
    idealPrompt: "Write a clean CSS .card block with glassmorphism (translucent background, blur), white border, rounded corners, drop shadow, and padding.",
    charCount: 232,
    idealWaterMl: 11,
    idealCo2Grams: 0.114
  },
  {
    id: "p006",
    category: "TONE",
    difficulty: "PRO",
    skill: "Casual message coordinator",
    impactLesson: "Setting casual but urgent tone parameters avoids multiple edits to sound 'just right' in group communications.",
    targetOutput: "Hey everyone 👋 For the Airbnb deposit we each owe $47.50 — can everyone Venmo Zara by Wednesday? We need to confirm the booking by Thursday night so please don't leave her hanging. Let me know ASAP if you can't make it work!",
    idealPrompt: "Group chat: 4 people Venmo Zara $47.50 for Airbnb deposit by Wednesday, booking deadline Thursday night, casual but urgent.",
    charCount: 236,
    idealWaterMl: 11,
    idealCo2Grams: 0.111
  },
  {
    id: "p007",
    category: "ROLE",
    difficulty: "PRO",
    skill: "Academic outreach",
    impactLesson: "Providing personal context like 'sophomore in economics' yields authentic phrasing on the first try.",
    targetOutput: "Hi Professor Okafor, I'm a sophomore in Intro to Economics. I found your recent talk on decision fatigue fascinating. Do you have any openings for undergraduate research assistants next semester? I would love to learn more and discuss how I could contribute to your project.",
    idealPrompt: "Polite cold email to Professor Okafor: sophomore, loved his decision fatigue talk, ask about undergraduate research assistant openings next semester.",
    charCount: 297,
    idealWaterMl: 12,
    idealCo2Grams: 0.117
  },

  // EXPERT
  {
    id: "e001",
    category: "CONSTRAINTS",
    difficulty: "EXPERT",
    skill: "Entertainment curation",
    impactLesson: "Stating parenthetical syntax constraints yields exact structure, saving post-generation edits.",
    targetOutput: "If you love the mind-bending time travel of Dark, check out: 1. Alan Wake 2 (cosmic horror, shifting realities), 2. Outer Wilds (time loop exploration, stellar mystery), and 3. BioShock Infinite (parallel dimensions, rich narrative). All match the dark, mysterious atmosphere you want.",
    idealPrompt: "Recommend 3 video games (with short parenthetical descriptions) for a fan of the TV show Dark, focusing on mystery, time-travel, and dark atmosphere. Under 60 words.",
    charCount: 298,
    idealWaterMl: 12,
    idealCo2Grams: 0.119
  },
  {
    id: "e002",
    category: "ROLE",
    difficulty: "EXPERT",
    skill: "Creative writing parody",
    impactLesson: "Setting artist style emulation guidelines captures voice features immediately.",
    targetOutput: "Midnights in the kitchen, sweating in my jeans / Underpants are soggy, if you know what I mean / Running through the heatwave, crying in the park / These damp cotton fabrics leaving their wet mark / Oh, it's a cruel summer, but my drawers are cold and wet.",
    idealPrompt: "Write Swift-style song lyrics about soggy/sweaty underpants during a hot summer. Incorporate dramatic Midnights/Cruel Summer themes. Under 55 words.",
    charCount: 298,
    idealWaterMl: 12,
    idealCo2Grams: 0.116
  },
  {
    id: "e003",
    category: "CONSTRAINTS",
    difficulty: "EXPERT",
    skill: "Technical math explanation",
    impactLesson: "Setting precise keywords forces technical accuracy, eliminating vocabulary tuning iterations.",
    targetOutput: "L2 regularization prevents overfitting by adding a penalty proportional to the square of weight magnitudes to the loss function. This discourages weights from growing excessively large, smoothing the model's decision boundaries and ensuring it doesn't overfit to training noise.",
    idealPrompt: "Explain how L2 regularization prevents machine learning overfitting. Focus on the penalty term, weight magnitudes, and decision boundary smoothing. Keep it precise and technical.",
    charCount: 296,
    idealWaterMl: 12,
    idealCo2Grams: 0.12
  },
  {
    id: "e004",
    category: "CODE",
    difficulty: "EXPERT",
    skill: "Python code optimization",
    impactLesson: "Defining logic features (efficiency rules, comment limits) prevents post-generation cleanups.",
    targetOutput: "```python\ndef get_primes(numbers):\n    # Filter and return list of prime numbers\n    def is_prime(n):\n        if n < 2: return False\n        for i in range(2, int(n**0.5) + 1):\n            if n % i == 0: return False\n        return True\n    return [num for num in numbers if is_prime(num)]\n```",
    idealPrompt: "Write a Python function get_primes(numbers) that filters a list for primes. Include a helper function is_prime, use square root limit for efficiency, and add a single comment.",
    charCount: 301,
    idealWaterMl: 12,
    idealCo2Grams: 0.121
  },
  {
    id: "e005",
    category: "TONE",
    difficulty: "EXPERT",
    skill: "Urgent notice formulation",
    impactLesson: "Specifying immediate property damage causes keeps tone appropriately urgent.",
    targetOutput: "Dear Landlord, I am writing to report that the bathroom sink has been leaking since last week. Water is starting to pool and damage the cabinet beneath. Please send maintenance to fix this as soon as possible to prevent further water damage. Thank you for your prompt attention.",
    idealPrompt: "Polite but urgent maintenance request to landlord: bathroom sink leaking since last week, water pooling and cabinet damage, ask for quick fix to prevent further damage.",
    charCount: 292,
    idealWaterMl: 12,
    idealCo2Grams: 0.119
  },
  {
    id: "e006",
    category: "PARAGRAPH",
    difficulty: "EXPERT",
    skill: "Physics riddle logic",
    impactLesson: "Asking the model to explain system states yields robust logic paths.",
    targetOutput: "The soup is ice. Even though the refrigeration truck is at 0 degrees, the soup starts warm or liquid, and over time in a sealed box with ice, the system reaches thermal equilibrium. Since 0°C is the freezing point of water, the soup will eventually freeze solid, and the ice remains.",
    idealPrompt: "Solve this riddle: a warm bowl of soup and ice cube are put in a box in a 0°C truck. What happens to the soup and ice? Explain thermal equilibrium and freezing point.",
    charCount: 299,
    idealWaterMl: 12,
    idealCo2Grams: 0.12
  },
  {
    id: "e007",
    category: "CONSTRAINTS",
    difficulty: "EXPERT",
    skill: "Historical summary",
    impactLesson: "Length boundaries coupled with factual constraints enforce efficient coding from the model.",
    targetOutput: "The Rosetta Stone, discovered in 1799 by French soldiers in Egypt, is a granodiorite stele inscribed with three scripts: Hieroglyphic, Demotic, and Ancient Greek. This trilingual decree allowed scholars like Champollion to decode Egyptian hieroglyphs by comparing them to the Greek text.",
    idealPrompt: "Explain how the Rosetta Stone was discovered and used to decode hieroglyphs. Mention the three scripts, the year of discovery, and Champollion's contribution. Under 55 words.",
    charCount: 296,
    idealWaterMl: 12,
    idealCo2Grams: 0.121
  }
];

export function getTodaysChallenge(): Challenge {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = dayOfYear % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index];
}
