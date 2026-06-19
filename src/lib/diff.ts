// text      → display text for the user panel (and ideal panel when idealText is absent)
// idealText → display text for the ideal panel when it differs from text (abbrev expansion)
// type      → "same" | "removed" | "added"
export type DiffToken = { text: string; idealText?: string; type: "same" | "removed" | "added" };

// Strip leading/trailing punctuation for comparison only (keep original text for display)
function normalize(word: string): string {
  return word.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
}

// ── Synonym groups ────────────────────────────────────────────────────────────
// Words in the same group are treated as equivalent in the diff.
const SYNONYM_GROUPS: string[][] = [
  ["explain", "describe", "write", "draft", "create", "generate", "compose", "produce"],
  ["mention", "include", "add", "note", "state", "specify"],
  ["brief", "short", "concise", "quick"],
  ["polite", "professional", "formal", "friendly", "kind"],
  ["urgent", "immediately", "asap", "quickly", "promptly"],
];

const CANONICAL_MAP = new Map<string, string>();
for (const group of SYNONYM_GROUPS) {
  const canonical = group[0];
  for (const word of group) CANONICAL_MAP.set(word, canonical);
}

function canonicalize(word: string): string {
  const norm = normalize(word);
  return CANONICAL_MAP.get(norm) ?? norm;
}

// ── Abbreviation expansions ───────────────────────────────────────────────────
// Maps lowercase abbreviation → array of expanded comparison words.
const ABBREVIATIONS: Record<string, string[]> = {
  "ml":   ["machine", "learning"],
  "ai":   ["artificial", "intelligence"],
  "nlp":  ["natural", "language", "processing"],
  "llm":  ["large", "language", "model"],
  "llms": ["large", "language", "models"],
  "dl":   ["deep", "learning"],
  "rl":   ["reinforcement", "learning"],
  "api":  ["application", "programming", "interface"],
  "gpu":  ["graphics", "processing", "unit"],
  "cpu":  ["central", "processing", "unit"],
  "ui":   ["user", "interface"],
  "ux":   ["user", "experience"],
  "os":   ["operating", "system"],
  "db":   ["database"],
  "css":  ["cascading", "style", "sheets"],
  "html": ["hypertext", "markup", "language"],
  "sql":  ["structured", "query", "language"],
};

// ── Text expander ─────────────────────────────────────────────────────────────
interface ExpandedText {
  originalWords: string[];      // raw words for display
  compareWords:  string[];      // canonicalized / expanded words for LCS
  compareToOrig: number[];      // compareWords[i] came from originalWords[compareToOrig[i]]
}

function expandText(text: string): ExpandedText {
  const originalWords = text.trim().split(/\s+/);
  const compareWords:  string[] = [];
  const compareToOrig: number[] = [];

  for (let i = 0; i < originalWords.length; i++) {
    const norm = normalize(originalWords[i]);
    const expansion = ABBREVIATIONS[norm];
    if (expansion) {
      for (const expWord of expansion) {
        compareWords.push(canonicalize(expWord));
        compareToOrig.push(i);
      }
    } else {
      compareWords.push(canonicalize(originalWords[i]));
      compareToOrig.push(i);
    }
  }

  return { originalWords, compareWords, compareToOrig };
}

// ── Main diff function ────────────────────────────────────────────────────────
export function computeWordDiff(userText: string, idealText: string): DiffToken[] {
  const user = expandText(userText);
  const ideal = expandText(idealText);

  const m = user.compareWords.length;
  const n = ideal.compareWords.length;

  // LCS on canonicalized / expanded comparison words
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = user.compareWords[i - 1] === ideal.compareWords[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack on expanded words, tracking which ideal orig-index each user orig-index matched
  type Label = "same" | "removed" | "added";
  const userExpandedLabels:  Label[]  = new Array(m).fill("removed");
  const idealExpandedLabels: Label[]  = new Array(n).fill("added");
  // For "same" pairs: remember the ideal compare-index that matched each user compare-index
  const userMatchedIdealOrig: (number | null)[] = new Array(m).fill(null);

  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && user.compareWords[i - 1] === ideal.compareWords[j - 1]) {
      userExpandedLabels[i - 1]  = "same";
      idealExpandedLabels[j - 1] = "same";
      userMatchedIdealOrig[i - 1] = ideal.compareToOrig[j - 1];
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      j--;
    } else {
      i--;
    }
  }

  // Collapse expanded labels → original-word labels
  // user: orig word is "same" only if ALL its expanded compare-tokens are "same"
  const userOrigLabel: Label[]   = new Array(user.originalWords.length).fill("same");
  // For same user orig words, collect which ideal orig words they matched
  const userOrigMatchedIdeal: Set<number>[] = Array.from(
    { length: user.originalWords.length }, () => new Set<number>()
  );

  for (let k = 0; k < m; k++) {
    const origIdx = user.compareToOrig[k];
    if (userExpandedLabels[k] !== "same") {
      userOrigLabel[origIdx] = "removed";
    } else if (userMatchedIdealOrig[k] !== null) {
      userOrigMatchedIdeal[origIdx].add(userMatchedIdealOrig[k]!);
    }
  }

  const idealOrigLabel: Label[] = new Array(ideal.originalWords.length).fill("same");
  for (let k = 0; k < n; k++) {
    if (idealExpandedLabels[k] !== "same") {
      idealOrigLabel[ideal.compareToOrig[k]] = "added";
    }
  }

  // Build merged token list.
  // We interleave user-removed, same, and ideal-added tokens in document order.
  // For "same" user words that matched ideal words: if the ideal display differs
  // (e.g. "ML" matched "machine learning"), capture idealText for the ideal panel.
  const tokens: DiffToken[] = [];

  // Walk through user original words in order, interleaving ideal "added" words
  // that appear between matches using the ideal original index ordering.

  let idealPtr = 0; // next ideal original word to emit

  // Helper: flush ideal "added" words up to (but not including) idealStopIdx
  const flushIdealAdded = (idealStopIdx: number) => {
    while (idealPtr < idealStopIdx) {
      if (idealOrigLabel[idealPtr] === "added") {
        tokens.push({ text: ideal.originalWords[idealPtr], type: "added" });
      }
      idealPtr++;
    }
  };

  for (let u = 0; u < user.originalWords.length; u++) {
    if (userOrigLabel[u] === "removed") {
      tokens.push({ text: user.originalWords[u], type: "removed" });
    } else {
      // "same" — find the lowest ideal orig index this user word matched
      const matchedIdealSet = userOrigMatchedIdeal[u];
      const minIdealOrig = matchedIdealSet.size > 0
        ? Math.min(...matchedIdealSet)
        : idealPtr;

      // Flush any ideal words that come before this match point
      flushIdealAdded(minIdealOrig);

      // Determine the ideal display text for this match group.
      // If the user wrote "ML" and ideal has "machine learning" (two words), join them.
      const matchedIdealWords = [...matchedIdealSet]
        .sort((a, b) => a - b)
        .map(idx => ideal.originalWords[idx]);

      const idealDisplay = matchedIdealWords.join(" ");
      const userDisplay  = user.originalWords[u];

      const token: DiffToken = { text: userDisplay, type: "same" };
      if (idealDisplay && idealDisplay.toLowerCase() !== userDisplay.toLowerCase()) {
        token.idealText = idealDisplay;
      }
      tokens.push(token);

      // Advance idealPtr past all matched ideal words
      if (matchedIdealSet.size > 0) {
        idealPtr = Math.max(...matchedIdealSet) + 1;
      }
    }
  }

  // Flush any remaining ideal "added" words at the end
  flushIdealAdded(ideal.originalWords.length);

  return tokens;
}
