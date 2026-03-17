const TARGETING_PATTERNS = [
  /the person who/i,
  /you know who you are/i,
  /someone in this room/i,
  /one of you/i,
  /we all know who/i,
  /everyone knows you/i,
  /I know it'?s you/i,
  /the one who/i,
];

export function detectTargeting(text: string): boolean {
  return TARGETING_PATTERNS.some((pattern) => pattern.test(text));
}

export const INPUT_PLACEHOLDERS = [
  "Share what's true for you...",
  "What needs to be said?",
  "What would you say if no one knew it was you?",
  "What's been on your mind?",
  "What truth have you been holding back?",
  "Say what you mean...",
  "What do you wish someone would say?",
  "What's real right now?",
];

export function getRandomPlaceholder(): string {
  return INPUT_PLACEHOLDERS[Math.floor(Math.random() * INPUT_PLACEHOLDERS.length)];
}

export const ROOM_RULES = `Welcome to this anonymous space. Before entering, please agree to these principles:

• Share honestly — this space exists for truth, not performance
• Speak from your own experience — use "I" statements
• Do not attempt to identify or target other participants
• Do not harass, threaten, or deliberately cause harm
• What's shared here stays here

Anonymous spaces work best when everyone commits to honesty AND kindness. You can be both.`;
