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

The pipeline evaluates three dimensions, scoring each to sum to 100:

1. **Accuracy (0-50)**: Measures semantic similarity (0-40) and keyword match (0-10) against target output.
2. **Format (0-20)**: Evaluates whether the prompt enforces structural constraints (e.g. lists, code, paragraphs).
3. **Brevity (0-30)**: Measures token economy (0-15) and speed/latency (0-15) mathematically.

* **Relevance Scaling**: Format and Brevity scores scale by the accuracy percentage. Unrelated/absurd prompts receive a score of `0` across all criteria.

---

## 3. API Output Schema

The edge function returns a structured JSON payload:

```json
{
  "accuracy": 45,
  "format": 18,
  "brevity": 27,
  "total": 90,
  "waterMl": 10,
  "co2Grams": 0.1,
  "justification": "Text matched meaning perfectly but omitted one minor structural layout.",
  "feedback": "Try adding explicit lists instruction in your prompt to capture structure."
}
```
