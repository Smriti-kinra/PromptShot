# Autonomous Solver Agent

You can build an autonomous agent to play PromptShot using the **PromptShot Solver SDK**. The agent operates in a feed-forward evaluation loop: it receives the target output and iteratively refines its candidate prompt based on edge function scores and feedback.

---

## 1. Python SDK Integration Example

Below is a complete implementation using the PromptShot Solver SDK, configured to target the **100-point scale**:

```python
import asyncio
import aiohttp
from promptshot_sdk import Agent, LocalAgentConfig, ToolContext

# Define configuration constants
SUPABASE_FUNCTIONS_URL = "https://fvtaoeunqeqnuotydrtv.supabase.co/functions/v1/make-server-488928a2"

# ---------------------------------------------------------
# Custom Tools for the Solver Agent
# ---------------------------------------------------------

async def get_challenge_target_output(difficulty: str) -> str:
    """Fetches the target output for today's active PromptShot challenge.

    Args:
        difficulty: The level of the challenge, e.g., 'BEGINNER', 'PRO', or 'EXPERT'.
    """
    return (
        "Hi Dave, thanks for the invite. Since my calendar is fully booked this week, "
        "could you send over the key questions or agenda via Slack/email? I'll review "
        "them and reply asynchronously by end of day today so we can save time."
    )

async def submit_prompt_attempt(user_prompt: str, target_output: str, ctx: ToolContext) -> str:
    """Submits a candidate prompt to the scoring agent and returns the score breakdown.

    Args:
        user_prompt: The prompt you want to test.
        target_output: The expected output that needs to be generated.
    """
    url = f"{SUPABASE_FUNCTIONS_URL}/score-guest"
    payload = {
        "userPrompt": user_prompt,
        "targetOutput": target_output,
        "idealPrompt": "Write polite sync denial reply to Dave asking for email agenda because calendar is booked, async reply by end of day."
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as response:
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
        model="gemini-3.5-flash",
        tools=[get_challenge_target_output, submit_prompt_attempt],
        system_instructions=(
            "You are an expert Prompt Engineer and an autonomous PromptShot solver agent. "
            "Your objective is to find a prompt that generates the target output with the highest "
            "possible score (aim for at least 90/100 total). "
            "\n\n"
            "Follow this execution flow:\n"
            "1. Retrieve the target output using `get_challenge_target_output`.\n"
            "2. Formulate an initial candidate prompt. Focus on describing details, layout, and constraints precisely.\n"
            "3. Submit the candidate prompt using `submit_prompt_attempt`.\n"
            "4. Analyze the returned score breakdown. If Accuracy or Format are low, add details to guide content/structure.\n"
            "   If Brevity is low, refactor the prompt to be more concise while preserving essential directives.\n"
            "5. Iterate until you achieve a score >= 90 or complete 5 attempts."
        )
    )

    print("Initializing PromptShot Solver Agent...")
    async with Agent(config=config) as agent:
        response = await agent.chat(
            "Solve today's BEGINNER PromptShot challenge. Begin by fetching the challenge target output."
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
