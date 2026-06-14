# Brevity & Efficiency Math

The Brevity and Resource Footprints are evaluated mathematically on the server to prevent LLM hallucinations. Format and Brevity scores are then scaled based on relevance.

---

## 1. Score Dependency Scaling

To prevent users from obtaining high scores for irrelevant, garbage, or short greeting-only prompts (e.g. formatting nonsense correctly, or submitting a tiny prompt that says nothing of substance), the final Format and Brevity scores scale with the Accuracy score.

$$\text{Accuracy Ratio} = \frac{\text{Accuracy}}{50}$$
$$\text{Final Format} = \text{Math.round}(\text{Raw Format} \times \text{Accuracy Ratio})$$
$$\text{Final Brevity} = \text{Math.round}(\text{Raw Brevity} \times \text{Accuracy Ratio})$$

* **Zero Relevance**: If $\text{Accuracy} = 0$, then $\text{Final Format}$ and $\text{Final Brevity}$ are forced to $0$.

---

## 2. Token Economy (0–15 points)

Rewards players for drafting concise prompts compared to a benchmark "ideal prompt" length.

* **Baseline Ideal Tokens**: Calculated as `Math.max(15, Math.round(ideal_prompt.length / 4))`
* **Formula**:
  $$\text{Token Penalty} = \text{Math.round}\left(\frac{\max(0, \text{user\_tokens} - \text{ideal\_tokens})}{3}\right)$$
  $$\text{Token Score} = \max(0, 15 - \text{Token Penalty})$$

---

## 3. Speed / Latency (0–15 points)

Rewards fast executions and penalizes conversational looping or heavy generations.

* **Formula**:
  $$\text{Latency (sec)} = \frac{\text{sandbox\_latency\_ms}}{1000}$$
  $$\text{Latency Penalty} = \text{Math.round}(\max(0, \text{Latency} - 1.5) \times 2)$$
  $$\text{Speed Score} = \max(0, 15 - \text{Latency Penalty})$$

---

## 4. Resource Footprint Estimation

The server estimates cooling water evaporated and carbon dioxide generated dynamically based on the sandbox token volume (input + output tokens):

* **Water Footprint**: 
  $$\text{waterMl} = \max(1, \text{Math.round}(\text{total\_tokens} \times 0.033))$$
* **Carbon Footprint**: 
  $$\text{co2Grams} = \max(0.01, \text{total\_tokens} \times 0.00033)$$
