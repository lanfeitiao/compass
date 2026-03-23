export const PROMPTS: string[] = [
  "When did you last feel completely in your element?",
  "What would you do if you could start your career over from scratch?",
  "What activities make you lose track of time?",
  "What are you most proud of in the last 6 months?",
  "What drains you most — and why do you keep doing it?",
  "If a close friend described you at your best, what would they say?",
  "What does a meaningful Monday look like to you?",
  "What fear is quietly holding you back right now?",
  "What would you pursue if you knew you couldn't fail?",
  "Who do you admire most, and what specifically do you admire?",
  "What would your ideal workday feel like from start to finish?",
  "What have you learned about yourself in the past year?",
  "What legacy do you want to leave behind?",
  "What are you tolerating that you shouldn't be?",
  "What energizes you more — leading, creating, helping, or building?",
  "What problem in the world do you wish you could solve?",
  "When did you last feel genuinely excited about something?",
  "What would you tell your 20-year-old self?",
  "What does success look like to you — not to others?",
  "What are your top 3 values, and are your actions aligned with them?",
  "What chapter of your life are you in right now?",
  "What would you do with an extra 10 hours a week?",
  "What skill do you most want to develop this year?",
  "What are you most grateful for today?",
  "What decision have you been avoiding?",
  "What relationship in your life needs more attention?",
  "What does freedom mean to you?",
  "What would your life look like in 5 years if nothing changed?",
  "What small thing brought you unexpected joy recently?",
  "What does 'enough' look like for you?",
]

export function getDailyPrompt(dateStr: string): string {
  const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return PROMPTS[hash % PROMPTS.length]
}
