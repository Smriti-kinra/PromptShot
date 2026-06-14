# PromptShot 🎯

PromptShot is a daily prompt engineering game. Built on a premium, game-focused **Forest Green system**, PromptShot teaches developers to write concise, structured, "one-shot" prompts that generate target outputs immediately—cutting API iterations and data center resource usage by 80%.

Most developers perform 4–6 iterative chat turns due to vague prompting, with each API call consuming ~10ml of water for cooling and generating carbon emissions. PromptShot turns prompt design into a game, proving that **better prompts = less AI usage = less resource consumption**.

> **Built with Figma Make.** The scoring backend server was scaffolded using [Figma Make](https://www.figma.com/make/), which generated the unique server slug (`make-server-488928a2`) and the initial Hono/Deno edge function structure. The frontend was designed in Figma and exported into the React codebase. The `safeStorage` iframe fallback was specifically engineered to support PromptShot running embedded inside Figma's sandbox preview at `figma.site`.

---

## 🌟 Key Features

### 1. 5-State Game Machine with View Transitions
PromptShot enforces a strict, single-container state machine:
* `challenge` ➜ Target output and JetBrains Mono input editor.
* `loading` ➜ Spinning radar loader while the scorer processes.
* `results` ➜ Hero visual concentric scoring rings.
* `impact` ➜ Sliding environmental cost report with animated water glass.
* `already-played` ➜ Daily lock, countdown to midnight, and review resources.
Transitions between these states use the browser's native **View Transitions API** (`document.startViewTransition`) for fluid layout morphing.

### 2. SVG Scoring Bullseye & Interactive Breakdown
* Concentric SVG circles clockwise-fill to represent Accuracy (outer ring), Format (middle ring), and Brevity (inner ring) scores.
* Interactive breakdown rows feature custom hover tooltips explaining the scoring criteria.
* SVG rings support hover descriptions detailing exact sub-scores.

### 3. Dynamic Environmental Estimator
* Resource footprints are calculated dynamically on the backend based on Anthropic API token volume (`input_tokens` + `output_tokens`).
* Milliliter footprints are dynamically resolved to physical equivalents (e.g. `"roughly a teaspoon"`, `"roughly a tablespoon"`, `"a small shot glass"`, `"a quarter cup"`).

### 4. Lifetime & Community Savings Dashboard
* **Lifetime savings**: Aggregates the volume of water saved (ml/L) and CO₂ prevented (g/kg) by the user across all prompt shots compared to standard 5-iteration chat sessions.
* **Global Community Impact**: Queries and displays the collective environmental savings of the entire developer community in real-time.

### 5. Sandboxed Iframe Fallback (`figma.sit` compatibility)
* Incorporates a standard-compliant `MemoryStorage` backend in the client that intercepts restricted `localStorage` environments (like Figma's iframe preview sandbox).
* Guarantees that authentication and game sessions initialize gracefully without crashing.

### 6. Secure & Cheat-Resistant Backend
* Hono/Deno server hosted on Supabase Edge Functions.
* Verifies bearer JWT sessions via `supabase.auth.getUser()`.
* Challenge ideal prompts are hidden from initial payload fetches and returned only *after* score submission to prevent browser DevTools cheating.

---

## 📂 Project Architecture

```
├── README.md               # Core project documentation
├── agents.md               # AI Orchestration and Google Antigravity SDK guide
├── index.html              # HTML shell loading fonts and viewport config
├── package.json            # Node project configuration
├── src/
│   ├── app/
│   │   ├── App.tsx         # Main application coordinator & layout views
│   │   ├── challenges.ts   # Fallback list of daily challenges
│   │   └── components/     # App sub-components (Topbar, LearnPanel)
│   ├── hooks/
│   │   └── useGameState.ts # Game state storage, streak counters, local migrations
│   ├── lib/
│   │   ├── safeStorage.ts  # Iframe-safe localStorage memory fallback (figma.site compatible)
│   │   ├── scorer.ts       # Unified API query client (scorePrompt, simulateScore)
│   │   ├── streak.ts       # Supabase client streak metrics calculator
│   │   └── supabase.ts     # Supabase DB client and type interfaces
│   └── styles/
│       ├── theme.css       # Color tokens, JetBrains Mono font-faces, animation keys
│       └── index.css       # Core styling entry point
└── supabase/
    └── functions/
        └── server/
            ├── index.ts    # Deno scorer route on Figma Make server (Claude Haiku via tool-calling)
            └── kv_store.tsx# Database-backed key-value store interface
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
Ensure you have Node.js 18+ installed. Run:
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Deploy/Serve Edge Functions
To serve the Deno scorer function locally:
```bash
supabase functions serve server
```
To deploy the function to production:
```bash
supabase functions deploy server
```

---

## 🤖 Autonomous Solver Agents

PromptShot supports play by autonomous AI solver agents. Developers can write scripts using the **Google Antigravity SDK** to fetch challenges, score prompts, parse feedback, and iteratively refine prompts in a feedback loop.

See [agents.md](agents.md) for full solver configurations, API contract details, and python solver examples.

---

## 🎨 Built with Figma Make

The PromptShot backend was scaffolded using **Figma Make**, Figma's AI-powered full-stack code generation tool.

### What Figma Make generated
- The Hono/Deno edge function server skeleton, including the unique server identifier slug (`make-server-488928a2`) embedded in all API route paths.
- Initial route scaffolding for the `/score` and `/score-guest` endpoints.
- The Supabase integration boilerplate (admin client, CORS headers, and Deno environment variable access patterns).

### What was built on top of Figma Make
After Make scaffolded the server, the following production-grade enhancements were layered in:
- **Claude Tool Calling** to force structured JSON output from the LLM (eliminating hallucinated formats).
- **Brevity calculated in code** — not by the LLM — since LLMs are poor at counting characters.
- **`max_tokens: 100` cap** on the Claude API call, reducing latency and cost by ~5×.
- **Model downgrade to Claude 3.5 Haiku** from Sonnet, preserving accuracy at a fraction of the cost.
- **JWT authentication** via `supabase.auth.getUser()` on the authenticated scoring route.
- **Ideal prompt withholding** from the initial challenge fetch, only returned post-submission to prevent DevTools cheating.

### figma.site Sandbox Compatibility
The frontend is designed to run embedded as a Figma prototype at `figma.site`. The [`safeStorage.ts`](src/lib/safeStorage.ts) module wraps all `localStorage` access and transparently falls back to an in-memory `MemoryStorage` buffer when the browser sandbox blocks persistent storage — ensuring the game initialises cleanly in Figma's iframe preview without any crashes or console errors.