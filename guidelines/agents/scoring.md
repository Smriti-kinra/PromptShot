# Backend Scoring Agent

The PromptShot game server delegates the scoring of user prompts to an LLM agent pipeline.

---

## 1. Engine Details

* **Sandbox Model**: Claude 3.5 Haiku (`claude-3-5-haiku-20241022`)
* **Judge Model**: Claude 3.5 Haiku (`claude-3-5-haiku-20241022`) with `temperature: 0.0`
* **Endpoint**: Hosted as a Supabase Edge Function (`/functions/v1/make-server-488928a2/score`)
* **Implementation**: Defined in [supabase/functions/server/index.ts](file:///Users/smriti/Documents/GitHub/promptshot/supabase/functions/server/index.ts)

---

## 2. Evaluation Metrics

The pipeline evaluates three dimensions, scoring each to sum to 100 before applying difficulty scaling:

1. **Accuracy (0-50)**: Measures semantic similarity (0-40) and specificity match (0-10) against the target output (replacing simple keyword presence with semantic specificity grading).
2. **Format (0-20)**: Evaluates whether the prompt enforces structural constraints (e.g. lists, code, paragraphs).
3. **Brevity (0-30)**: Measures token economy mathematically based on a character-length token heuristic compared to the ideal baseline prompt (response speed/latency is no longer factored into the score).

* **Dependency Scaling**: Format and Brevity scores scale by the accuracy ratio (out of 50). Unrelated/absurd prompts receive a score of `0` across all criteria.
* **Difficulty Multiplier**: An adjustment multiplier is applied to the final sum of the sub-scores to reward play in harder modes:
  - **BEGINNER**: 1.0x
  - **PRO**: 1.15x
  - **EXPERT**: 1.30x
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
  "feedback": "Try adding explicit lists instruction in your prompt to capture structure."
}
```
