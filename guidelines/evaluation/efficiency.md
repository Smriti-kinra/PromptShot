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

## 2. Token Economy & Brevity (0–30 points)

Rewards players for drafting concise prompts compared to a benchmark "ideal prompt" length.

* **Ideal Tokens Baseline**: Calculated as:
  $$\text{Ideal Tokens} = \max(15, \text{Math.round}(\text{ideal\_prompt.length} / 4))$$
* **Difficulty Ceiling Clamping**: The ideal baseline is clamped by a difficulty ceiling to prevent AI-generated challenges with highly variable ideal prompt lengths from distorting the score:
  - **BEGINNER**: Ceiling of 40 tokens (~160 chars)
  - **PRO**: Ceiling of 55 tokens (~220 chars)
  - **EXPERT**: Ceiling of 70 tokens (~280 chars)
  $$\text{Ideal Tokens Clamped} = \min(\text{Ceiling}, \text{Ideal Tokens})$$
* **User Tokens**:
  $$\text{User Tokens} = \max(1, \text{Math.round}(\text{user\_prompt.length} / 4))$$
* **Token Efficiency Formula (0–15 scale)**:
  $$\text{Token Penalty} = \text{Math.round}\left(\frac{\max(0, \text{User Tokens} - \text{Ideal Tokens Clamped})}{3}\right)$$
  $$\text{Token Efficiency} = \max(0, 15 - \text{Token Penalty})$$
* **Raw Brevity Score (0-30 scale)**:
  $$\text{Raw Brevity} = \min(30, \text{Token Efficiency} \times 2)$$

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
