# Autonomous Solver Agent

You can build an autonomous agent to play PromptShot using the **PromptShot Solver SDK**. The agent operates in a feed-forward evaluation loop: it receives the target output and iteratively refines its candidate prompt based on edge function scores and feedback.

---

## 1. Python SDK Integration Example

Below is a complete implementation using the PromptShot Solver SDK, configured to target the **100-point scale**:

```python
import asyncio
import aiohttp
import os
from promptshot_sdk import Agent, LocalAgentConfig, ToolContext

# Define configuration constants
SUPABASE_FUNCTIONS_URL = "https://fvtaoeunqeqnuotydrtv.supabase.co/functions/v1/make-server-488928a2"
# Default public anon key mapped in utils/supabase/info.tsx
SUPABASE_ANON_KEY = os.environ.get(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2dGFvZXVucWVxbnVvdHlkcnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwODM5OTcsImV4cCI6MjA5NjY1OTk5N30.ijjmRCE4GkZcu6h5y2xfBWZ4DunEM1jAMXqRIk68-Mk"
)

# ---------------------------------------------------------
# Custom Tools for the Solver Agent
# ---------------------------------------------------------

async def get_challenge_details(difficulty: str) -> dict:
    """Fetches today's active PromptShot challenge details.

    Args:
        difficulty: The level of the challenge, e.g., 'BEGINNER', 'PRO', or 'EXPERT'.
    """
    # Returns the beginner physics challenge details from the static challenges pool
    return {
        "id": "b001",
        "target_output": (
            "Black holes are regions of space where gravity is so strong that nothing, "
            "not even light, can escape. The boundary surrounding a black hole is called "
            "the event horizon. Once anything crosses this line, it cannot return."
        )
    }

async def submit_prompt_attempt(challenge_id: str, user_prompt: str, difficulty: str, ctx: ToolContext) -> str:
    """Submits a candidate prompt to the scoring agent and returns the score breakdown.

    Args:
        challenge_id: The ID of the challenge being played.
        user_prompt: The prompt you want to test.
        difficulty: The difficulty level (e.g. 'BEGINNER').
    """
    url = f"{SUPABASE_FUNCTIONS_URL}/score-guest"
    payload = {
        "challengeId": challenge_id,
        "userPrompt": user_prompt,
        "difficulty": difficulty
    }
    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    # Store history in agent context state
                    history = ctx.get_state("attempts", [])
                    history.append({"prompt": user_prompt, "scores": data})
                    ctx.set_state("attempts", history)
                    
                    return (
                        f"Attempt Submitted!\n"
                        f"- Accuracy: {data.get('accuracy')}/50\n"
                        f"- Format: {data.get('format')}/20\n"
                        f"- Brevity: {data.get('brevity')}/30\n"
                        f"- Total Score: {data.get('total')}/100"
                    )
                else:
                    return f"Error: Received status code {response.status} from scorer."
    except Exception as e:
        return f"Failed to connect to scoring endpoint: {str(e)}"

# ---------------------------------------------------------
# Agent Orchestration
# ---------------------------------------------------------

async def main():
    # Setup configuration with Gemini and register tools
    config = LocalAgentConfig(
        model="gemini-2.5-flash",
        tools=[get_challenge_details, submit_prompt_attempt],
        system_instructions=(
            "You are an expert Prompt Engineer and an autonomous PromptShot solver agent. "
            "Your objective is to find a prompt that generates the target output with the highest "
            "possible score (aim for at least 90/100 total). "
            "\n\n"
            "Follow this execution flow:\n"
            "1. Retrieve the challenge details using `get_challenge_details` with difficulty 'BEGINNER'.\n"
            "2. Formulate an initial candidate prompt. Focus on describing details, layout, and constraints precisely.\n"
            "3. Submit the candidate prompt using `submit_prompt_attempt` with the retrieved challenge id, difficulty 'BEGINNER', and your candidate prompt.\n"
            "4. Analyze the returned score breakdown. If Accuracy or Format are low, add details to guide content/structure.\n"
            "   If Brevity is low, refactor the prompt to be more concise while preserving essential directives.\n"
            "5. Iterate until you achieve a score >= 90 or complete 5 attempts."
        )
    )

    print("Initializing PromptShot Solver Agent...")
    async with Agent(config=config) as agent:
        response = await agent.chat(
            "Solve today's BEGINNER PromptShot challenge. Begin by fetching the challenge details."
        )
        async for chunk in response:
            print(chunk, end="", flush=True)
        print()

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 2. How to Run the Solver Agent

1. **Set Up Python Environment**:
   Ensure Python 3.10+ is installed. Install the SDK package:
   ```bash
   pip install promptshot-sdk aiohttp
   ```

2. **Configure API Credentials**:
   To authenticate the SDK with Gemini, set the environment variable:
   ```bash
   export GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Execute the Script**:
   Save as `solve_promptshot.py` and run:
   ```bash
   python solve_promptshot.py
   ```
