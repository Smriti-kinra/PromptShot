# Backend Scoring Agent

The PromptShot game server delegates the scoring of user prompts to an LLM agent pipeline.

---

## 1. Engine Details

* **Sandbox Model**: Gemini 2.5 Flash (`gemini-2.5-flash`) with `temperature: 0.0` and `seed: 42`
* **Judge Model**: Gemini 2.5 Flash (`gemini-2.5-flash`) with `temperature: 0.0`
* **Endpoint**: Hosted as a Supabase Edge Function (`/functions/v1/make-server-488928a2/score`)
* **Implementation**: Defined in [supabase/functions/server/index.ts](file:///Users/smriti/Documents/GitHub/promptshot/supabase/functions/server/index.ts)

> [!NOTE]
> The judge system prompt was originally designed and calibrated for Claude's response patterns. When running on Gemini models, ensure JSON schema constraints are tightly enforced and monitor response variance. The judge prompt should be re-evaluated any time the underlying LLM model is upgraded or changed.

---

## 2. Evaluation Metrics

The pipeline evaluates three dimensions, scoring each to sum to 100 before applying difficulty bonus adjustments:

1. **Accuracy (0-50)**: Measures semantic similarity (0-40) and constraint coverage (0-10) against the target output (evaluating whether the prompt captures critical names, dates, or constraints).
2. **Format (0-20)**: Evaluates whether the prompt enforces structural constraints (e.g. lists, code, paragraphs).
3. **Brevity (0-30)**: Measures token economy mathematically based on a character-length token ratio compared to the ideal baseline prompt.

* **Dependency Scaling**: Format and Brevity scores scale by the accuracy scaling factor (with a floor of `0.4` of their raw values). Unrelated/absurd prompts (where accuracy = 0) receive a score of `0` across all criteria.
* **Difficulty Bonus Pool**: Flat bonus points are added to the final score to reward play in harder modes:
  - **BEGINNER**: +0 pts
  - **PRO**: +5 pts
  - **EXPERT**: +10 pts
  - *Note: The final total is capped at 100.*

---

## 3. API Output Schema

The edge function returns a structured JSON payload:

```json
{
  "accuracy": 45,
  "format": 18,
  "brevity": 24,
  "total": 87,
  "waterMl": 10,
  "co2Grams": 0.1,
  "justification": "Text matched meaning perfectly but omitted one minor structural layout.",
  "feedback": "Try adding explicit lists instruction in your prompt to capture structure.",
  "sandboxOutput": "Polished text result.",
  "promptTokens": 120,
  "completionTokens": 50,
  "totalTokens": 170
}
```
