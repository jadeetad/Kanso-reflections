export const WRITING_PROMPTS = [
  "What are you not saying?",
  "What did today ask of you?",
  "What are you carrying that isn't yours?",
  "What would you tell yourself from a year ago?",
  "What are you pretending not to know?",
  "What does rest look like right now?",
  "What are you waiting for permission to do?",
  "What felt true today?",
  "What are you holding loosely?",
  "What do you keep returning to?",
  "What surprised you about yourself recently?",
  "What are you ready to let go of?",
  "What does your body know that your mind hasn't caught up to?",
  "What are you most afraid to write about?",
  "What is asking for your attention?",
];

export function getRandomPrompt(): string {
  return WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
}