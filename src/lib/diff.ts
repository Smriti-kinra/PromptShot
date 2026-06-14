export type DiffToken = { text: string; type: "same" | "removed" | "added" };

export function computeWordDiff(userText: string, idealText: string): DiffToken[] {
  const userWords = userText.trim().split(/\s+/);
  const idealWords = idealText.trim().split(/\s+/);

  // Longest Common Subsequence (LCS) on words
  const m = userWords.length;
  const n = idealWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (userWords[i - 1].toLowerCase() === idealWords[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to produce aligned tokens
  const tokens: DiffToken[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && userWords[i - 1].toLowerCase() === idealWords[j - 1].toLowerCase()) {
      tokens.unshift({ text: userWords[i - 1], type: "same" });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.unshift({ text: idealWords[j - 1], type: "added" });
      j--;
    } else {
      tokens.unshift({ text: userWords[i - 1], type: "removed" });
      i--;
    }
  }

  return tokens;
}
