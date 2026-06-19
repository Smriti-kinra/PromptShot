# Brevity & Efficiency Math

The Brevity and Resource Footprints are evaluated mathematically on the server to prevent LLM hallucinations. Format and Brevity scores are then scaled based on relevance.

---

## 1. Score Dependency Scaling

To prevent users from obtaining high scores for irrelevant, garbage, or short greeting-only prompts, the final Format and Brevity scores scale with the Accuracy score.

$$\text{Accuracy Ratio} = \frac{\text{Accuracy}}{50}$$
$$\text{Scaling Factor} = \max(0.4, \text{Accuracy Ratio})$$
$$\text{Final Format} = \text{Math.round}(\text{Raw Format} \times \text{Scaling Factor})$$
$$\text{Final Brevity} = \text{Math.round}(\text{Raw Brevity} \times \text{Scaling Factor})$$

* **Zero Relevance**: If $\text{Accuracy} = 0$, then the entire score is forced to $0$.

---

## 2. Token Economy & Brevity (0–30 points)

Rewards players for drafting concise prompts compared to a benchmark "ideal prompt" length.

* **Token Estimation**: Calculated as:
  $$\text{User Tokens} = \max(1, \text{Math.round}(\text{user\_prompt.length} / 4))$$
  $$\text{Ideal Tokens} = \max(15, \text{Math.round}(\text{ideal\_prompt.length} / 4))$$
* **Token Ratio**:
  $$\text{Token Ratio} = \frac{\text{User Tokens}}{\text{Ideal Tokens}}$$
* **Brevity Scoring Rules**:
  - $\text{Token Ratio} \le 0.8$: **30 pts** (Meaningfully shorter / efficient)
  - $0.8 < \text{Token Ratio} \le 1.0$: **24 to 30 pts** (linear scale: $30 - \frac{\text{Token Ratio} - 0.8}{0.2} \times 6$)
  - $1.0 < \text{Token Ratio} \le 2.0$: **0 to 24 pts** (linear scale: $24 \times (1 - (\text{Token Ratio} - 1.0))$)
  - $\text{Token Ratio} > 2.0$: **0 pts** (Twice as long as the ideal baseline)

---

## 3. Speed / Latency (Removed from scoring)

Latency/response speed is no longer factored into the player's brevity score to avoid penalizing players for transient server/network delays. However, response speed is still tracked in milliseconds for the ecological footprint estimates.

---

## 4. Resource Footprint Estimation

The server estimates cooling water evaporated and carbon dioxide generated dynamically based on the sandbox token volume (input + output tokens):

* **Water Footprint**: 
  $$\text{waterMl} = \max(1, \text{Math.round}(\text{total\_tokens} \times 0.033))$$
* **Carbon Footprint**: 
  $$\text{co2Grams} = \max(0.01, \text{total\_tokens} \times 0.00033)$$
