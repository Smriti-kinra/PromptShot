export interface Challenge {
  id: string;
  category:
    | "PARAGRAPH"
    | "CODE"
    | "LIST"
    | "ROLE"
    | "TONE"
    | "CONSTRAINTS";
  difficulty: "BEGINNER" | "PRO" | "EXPERT";
  skill: string;
  impactLesson: string;
  targetOutput: string;
  idealPrompt: string;
  charCount: number;
}

export const DAILY_CHALLENGES: Challenge[] = [
  {
    id: "001",
    category: "TONE",
    difficulty: "BEGINNER",
    skill: "Polite meeting denial",
    impactLesson: "Perfecting tone on the first try saves the energy of drafting multiple apologetic correction emails.",
    targetOutput: "Hi Dave, thanks for the invite. Since my calendar is fully booked this week, could you send over the key questions or agenda via Slack/email? I'll review them and reply asynchronously by end of day today so we can save time.",
    idealPrompt: "Write a polite but direct response to a coworker named Dave, declining a sync invite because your calendar is booked. Ask him to send the agenda/questions via Slack/email instead, and promise an async reply by end of day. Keep it under 45 words.",
    charCount: 218
  },
  {
    id: "002",
    category: "CODE",
    difficulty: "PRO",
    skill: "Git disaster mitigation",
    impactLesson: "Detailed technical status reports prevent endless clarification pings on Slack, saving database and server roundtrips.",
    targetOutput: "Hey team, my local branch is out of sync after an interactive rebase mismatch. I am force-pushing the origin branch from yesterday to reset it. No other branches are affected, and I will have the clean PR ready in 30 minutes.",
    idealPrompt: "Write a brief Slack update to your dev team. Explain that your branch is out of sync due to a rebase mismatch, you are force-pushing yesterday's origin branch to reset it, and no other branches are affected. State the PR will be ready in 30 minutes. Keep it professional and direct.",
    charCount: 224
  },
  {
    id: "003",
    category: "CONSTRAINTS",
    difficulty: "EXPERT",
    skill: "LinkedIn reality check",
    impactLesson: "Exclusion boundaries help the model translate fluff directly without wandering off on secondary details.",
    targetOutput: "Translation: I was laid off along with 15% of the staff. The corporate pivot failed, the culture was toxic, and my equity is worth zero. I am now unemployed and looking for a job that pays actual money.",
    idealPrompt: "Translate a hype-filled corporate announcement into a raw, brutally honest summary: mention being laid off in a 15% cut, the failed corporate pivot, toxic culture, worthless equity, and looking for a new role. Prefix with 'Translation: '.",
    charCount: 204
  },
  {
    id: "004",
    category: "ROLE",
    difficulty: "PRO",
    skill: "Gym-bro motivation",
    impactLesson: "Role directives give the model an exact behavioral template, hitting style constraints in a single shot.",
    targetOutput: "Listen up, champ! Those failing unit tests are just mental blocks. We don't skip debug day. Put your developer belt on, stack those print statements, and push that refactored commit. No excuses, let's get those green checkmarks!",
    idealPrompt: "Act as a passionate, hyperactive gym bro personal trainer. Write a short motivational paragraph urging a software developer to fix their failing unit tests. Use phrases like 'debug day', 'green checkmarks', and 'no excuses'.",
    charCount: 226
  },
  {
    id: "005",
    category: "LIST",
    difficulty: "BEGINNER",
    skill: "Zoom survival checklist",
    impactLesson: "Setting structural expectations prevents multiple retries to fix bullet style and layout.",
    targetOutput: "Survival Checklist:\n1. Mute button checked twice (safety first)\n2. Camera on 'thoughtful nod' loop\n3. Coffee mug filled to the brim\n4. Dual-monitor setup hides actual work\n5. Pre-drafted Slack update ready for the end",
    idealPrompt: "Create a 5-item survival checklist for surviving a long, boring Zoom meeting. Use bullet numbers. Focus on mute checks, camera nods, coffee, hiding work, and pre-drafted status updates. Start with the title 'Survival Checklist:'.",
    charCount: 216
  },
  {
    id: "006",
    category: "TONE",
    difficulty: "EXPERT",
    skill: "Firm landlord notice",
    impactLesson: "Writing a firm legal notice once avoids long back-and-forth negotiations, saving human and machine bandwidth.",
    targetOutput: "Dear Landlord, this is a formal notice regarding active water damage in the living room ceiling. Per state tenancy guidelines, this requires urgent mitigation to prevent structural mold. Please confirm when the repair team will arrive today.",
    idealPrompt: "Write a formal email notice to your landlord about active ceiling water damage. Reference state tenancy guidelines, request urgent mitigation to prevent mold, and ask for repair confirmation today. Sound firm, legal, and professional.",
    charCount: 243
  },
  {
    id: "007",
    category: "TONE",
    difficulty: "PRO",
    skill: "Overdue payment follow-up",
    impactLesson: "Polite yet demanding follow-ups avoid the need for manual escalation or repeated drafts.",
    targetOutput: "Hi team, I am following up on invoice #1042 which is now 60 days overdue. Please reply with the payment confirmation status by Friday. A late fee of 5% will be applied starting next week per our contract terms.",
    idealPrompt: "Write a professional follow-up email to a client for invoice #1042 that is 60 days overdue. Request a payment confirmation status by Friday. Mention a 5% late fee starting next week based on contract terms. Keep it direct and firm.",
    charCount: 212
  }
];

export function getTodaysChallenge(): Challenge {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = dayOfYear % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index];
}
