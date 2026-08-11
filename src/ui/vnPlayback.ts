import type { StoryLine } from '../data/narrative';

export type AutoSpeed = 'slow' | 'normal' | 'fast';
export type TextScale = 'normal' | 'large';

export const AUTO_SPEED_DELAYS: Readonly<Record<AutoSpeed, number>> = {
  slow: 3400,
  normal: 2500,
  fast: 1750,
};

export const autoDelayForLine = (text: string, speed: AutoSpeed): number => {
  const base = AUTO_SPEED_DELAYS[speed];
  const readingAllowance = Math.min(1800, Math.max(0, text.trim().length - 28) * 18);
  return base + readingAllowance;
};

export const nextUnreadIndex = (
  story: readonly StoryLine[],
  startIndex: number,
  readLines: readonly string[],
  stopLineId = 'VN0040',
): number => {
  const read = new Set(readLines);
  let index = Math.max(0, startIndex);
  while (index < story.length) {
    const line = story[index];
    if (line.id === stopLineId || !read.has(line.id)) break;
    index += 1;
  }
  return index;
};
