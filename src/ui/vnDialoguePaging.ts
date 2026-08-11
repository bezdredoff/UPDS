export type DialogueTextScale = 'normal' | 'large';

export type DialoguePageProfile = Readonly<{
  width: number;
  height: number;
  textScale: DialogueTextScale;
}>;

export type DialoguePageBudget = Readonly<{
  maxWords: number;
  maxChars: number;
}>;

const clampViewport = (value: number, fallback: number): number => Number.isFinite(value) && value > 0 ? value : fallback;

export const dialoguePageBudget = ({ width, height, textScale }: DialoguePageProfile): DialoguePageBudget => {
  const safeWidth = clampViewport(width, 390);
  const safeHeight = clampViewport(height, 844);
  const compact = safeHeight <= 650 || safeWidth <= 340;
  const medium = !compact && (safeHeight <= 760 || safeWidth <= 375);

  if (compact) {
    return textScale === 'large'
      ? { maxWords: 11, maxChars: 82 }
      : { maxWords: 14, maxChars: 104 };
  }
  if (medium) {
    return textScale === 'large'
      ? { maxWords: 14, maxChars: 104 }
      : { maxWords: 17, maxChars: 126 };
  }
  return textScale === 'large'
    ? { maxWords: 18, maxChars: 132 }
    : { maxWords: 22, maxChars: 158 };
};

const endsSentence = (word: string): boolean => /[.!?…][»”"')\]]?$/.test(word);

const chooseCut = (words: readonly string[], start: number, budget: DialoguePageBudget): number => {
  let end = start;
  let chars = 0;
  while (end < words.length) {
    const nextLength = words[end].length + (end > start ? 1 : 0);
    if (end > start && (end - start >= budget.maxWords || chars + nextLength > budget.maxChars)) break;
    chars += nextLength;
    end += 1;
  }

  if (end >= words.length) return end;

  const minimumNaturalCut = start + Math.max(4, Math.floor((end - start) * 0.58));
  // minimumNaturalCut is an exclusive word-count position, while candidate is
  // a zero-based word index. Include the word immediately before that cut.
  for (let candidate = end - 1; candidate >= minimumNaturalCut - 1; candidate -= 1) {
    if (endsSentence(words[candidate])) return candidate + 1;
  }
  return Math.max(start + 1, end);
};

export const paginateDialogueText = (text: string, profile: DialoguePageProfile): string[] => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [''];

  const words = normalized.split(' ');
  const budget = dialoguePageBudget(profile);
  const pages: string[] = [];
  let start = 0;
  while (start < words.length) {
    const end = chooseCut(words, start, budget);
    pages.push(words.slice(start, end).join(' '));
    start = end;
  }
  return pages;
};

export const currentDialogueProfile = (textScale: DialogueTextScale): DialoguePageProfile => ({
  width: typeof window !== 'undefined' && typeof window.innerWidth === 'number' ? window.innerWidth : 390,
  height: typeof window !== 'undefined' && typeof window.innerHeight === 'number' ? window.innerHeight : 844,
  textScale,
});
