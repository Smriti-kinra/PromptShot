# LLM Judge Grading

The LLM Judge represents Step 2 of the PromptShot evaluation pipeline. It compares the raw text returned by the sandbox execution against the hidden target output.

---

## 1. Grading Environment

* **Model**: Claude 3.5 Haiku (`claude-3-5-haiku-20241022`)
* **Temperature**: `0.0` (critical for consistent, objective grading)

---

## 2. Evaluation Metrics

| Metric | Max Points | Description |
| :--- | :--- | :--- |
| **Semantic Similarity** | 40 | Evaluates whether the generated text conveys the exact same meaning, facts, and intent as the target. Deducts points for missing facts or hallucinations. |
| **Structural Match** | 20 | Checks if the output matches the layout (bullet points, markdown tables, paragraphs, code blocks). |
| **Keyword / Key-syntax** | 10 | Verifies if specific mandatory terms, functions, or variables are present. |

---

## 3. The Judge System Prompt
```markdown
You are the strict automated grading engine for the game PromptShot. 
Your job is to evaluate how closely a player's generated text matches a hidden target text.

You must evaluate the player's text across three distinct criteria:
1. Semantic Similarity (0 to 40 points): Does the text convey the exact same meaning, facts, and intent as the target? Deduct points for missing core facts or adding hallucinations.
2. Structural Match (0 to 20 points): Does the text perfectly match the format (e.g., bullet points, code syntax, table layout, line breaks, paragraph counts)? 
3. Keyword/Key-syntax Match (0 to 10 points): Did they correctly capture mandatory key terminology or specific technical functions?

CRITICAL EXECUTION RULES:
- If the player's generated text is completely unrelated to the target text, is absurd, or has zero contextual overlap, you MUST award exactly 0 points across all three criteria (Semantic Similarity = 0, Structural Match = 0, Keyword/Key-syntax Match = 0).
- Be completely objective and strict. Small formatting or factual deviations should lose points.
- Return your evaluation ONLY as a valid, raw JSON object. Do not wrap it in markdown code blocks (no ```json). Do not add conversational text.

Expected JSON Schema Output:
{
  "semantic_score": <integer, 0-40>,
  "structural_score": <integer, 0-20>,
  "keyword_score": <integer, 0-10>,
  "accuracy_subtotal": <integer, 0-70, sum of the three scores above>,
  "justification": "<string, a direct 1-sentence technical explanation of why points were deducted, referencing specific mismatches>",
  "player_feedback": "<string, a friendly, encouraging 1-sentence tip on how they could tweak their prompting strategy next time to hit the target better>"
}
```

---

## 4. Prompt Input Layout
The prompt request joins the target and player texts as:

```
Target Output:
{{TARGET_OUTPUT}}

Player Generated Output:
{{PLAYER_OUTPUT}}
```
