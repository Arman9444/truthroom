const ADJECTIVES = [
  "Shadow", "Veiled", "Crimson", "Silent", "Mystic",
  "Hidden", "Wandering", "Twilight", "Phantom", "Ember",
  "Lunar", "Crystal", "Storm", "Frost", "Iron",
  "Golden", "Silver", "Cobalt", "Onyx", "Jade",
];

const NOUNS = [
  "Oracle", "Wanderer", "Raven", "Phoenix", "Sphinx",
  "Sage", "Cipher", "Specter", "Falcon", "Nomad",
  "Wolf", "Hawk", "Fox", "Bear", "Owl",
  "Flame", "Tide", "Echo", "Drift", "Spark",
];

const MASKS = [
  "🎭", "🦊", "🐺", "🦉", "🐦‍⬛",
  "🦅", "🐻", "🦁", "🐯", "🦋",
  "🌙", "⭐", "🔮", "🗿", "🎪",
  "🌊", "🔥", "❄️", "⚡", "🌿",
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateIdentity(existingAliases: string[]): {
  alias: string;
  mask: string;
} {
  const existingSet = new Set(existingAliases);
  const adjectives = shuffleArray(ADJECTIVES);
  const nouns = shuffleArray(NOUNS);
  const masks = shuffleArray(MASKS);

  for (const adj of adjectives) {
    for (const noun of nouns) {
      const alias = `${adj} ${noun}`;
      if (!existingSet.has(alias)) {
        const mask = masks[Math.floor(Math.random() * masks.length)];
        return { alias, mask };
      }
    }
  }

  // Fallback: add a number suffix
  const adj = adjectives[0];
  const noun = nouns[0];
  let counter = 2;
  while (existingSet.has(`${adj} ${noun} ${counter}`)) {
    counter++;
  }
  return {
    alias: `${adj} ${noun} ${counter}`,
    mask: masks[Math.floor(Math.random() * masks.length)],
  };
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
