# PromptShot 🎯

### *Stop talking to AI like it's your therapist. Get your output in one clean shot.*

Every time you write a lazy, wordy prompt and hit enter 5 times to correct the AI, a massive data center server drinks a cup of water to cool down. 

**PromptShot** is a daily prompt engineering game where you learn to write concise, structured, "one-shot" prompts. Save the planet, save API compute costs, and climb the developer leaderboard. **Better prompts = less AI usage = less resource consumption.**

---

## 🚀 How to Play

1. **See the Target**: You get today's target AI output (a block of code, a structured list, or formatted text).
2. **Write Your Prompt**: Write a single instruction to generate that output in **one shot**.
3. **Get Your Score**: Our isolated AI judge grades you out of 100 on:
   - 🎯 **Accuracy (50 pts)**: Did the output match the target meaning?
   - 📋 **Format (20 pts)**: Did you enforce structural rules?
   - ⚡ **Brevity (30 pts)**: How short and efficient was your prompt?
4. **See the Eco-Impact**: Watch your prompt's water consumption and carbon footprint calculate in real-time.

---

## 🎨 Vector Canvas to React Frontend

PromptShot's premium dark glassmorphism interface was created directly inside a collaborative vector design canvas.
- **Pixel-Perfect Vector Frames**: The styling, layout grids, and visual elements were exported directly from vector layers into clean React components.
- **Embedded Sandbox Ready**: Built with custom iframe fallbacks (`safeStorage.ts`) so it loads and saves player progress seamlessly even when run inside sandboxed web preview players or design site embeds.
- **Dynamic Micro-interactions**: Includes procedural synthesizer click ticks and loading scan hums built via the browser Web Audio API, paired with canvas particle celebrations for high scores.

---

## 📂 Project Structure

```
├── README.md               # You are here!
├── src/
│   ├── App.tsx             # Main coordinator and layout router
│   ├── main.tsx            # Main app entrypoint
│   ├── components/         # Reusable widgets (Topbar, WaterGlass, AnimatedGridBackground, PromptDiff)
│   │   ├── impact/         # Explainer row, configs, and details modal
│   │   ├── leaderboard/    # Leaderboard view panel, row, and auth screens
│   │   └── learn/          # Guidelines sections (Anatomy, Myths, Examples, FAQs)
│   ├── screens/            # Main game views (Landing, Challenge, Results, AlreadyPlayed, Return)
│   ├── data/               # Daily challenges, static lessons, and content
│   ├── hooks/              # Custom React hooks (game state, countdown timers)
│   ├── lib/
│   │   ├── safeStorage.ts  # Sandboxed iframe memory storage fallback
│   │   ├── sounds.ts       # Procedural audio generator (Web Audio API)
│   │   ├── gameUtils.ts    # Game formatting, calculation, and UI color helpers
│   │   ├── streak.ts       # Player daily streak tracking logic
│   │   ├── supabase.ts     # Supabase client configurations and types
│   │   ├── diff.ts         # Shared LCS word-level diff utility
│   │   └── scorer.ts       # Client-side fallback scoring algorithms
│   └── styles/
│       ├── theme.css       # Glassmorphic tokens, Space Grotesk, JetBrains Mono CSS
│       └── ...             # Component and application styling files
└── supabase/               # Secure Hono sandbox execution edge function Scorer
```

---

## 🛠️ Let's Run It!

Get up and running in under a minute:

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the local server**:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) and take your best shot!

---

## 🤖 Play with Agents
Want to automate it? You can build autonomous solver scripts using the **Python SDK** that play the challenge programmatically and iteratively learn from prompt score feedback. Check out [agents.md](agents.md) to get started!