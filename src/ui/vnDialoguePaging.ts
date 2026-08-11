export type DialogueTextScale = 'normal' | 'large';

export type DialoguePageProfile = Readonly<{
  width: number;
  height: number;
  textScale: DialogueTextScale;
}>;

/**
 * Deterministic fallback only. The browser runtime does not use this as the
 * source of truth once a real dialogue viewport can be measured.
 */
export type DialoguePageBudget = Readonly<{
  maxWords: number;
  maxChars: number;
}>;

export type DialogueFitPredicate = (candidate: string) => boolean;

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

const normalize = (value: string): string => value.replace(/\s+/g, ' ').trim();
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
  for (let candidate = end - 1; candidate >= minimumNaturalCut - 1; candidate -= 1) {
    if (endsSentence(words[candidate])) return candidate + 1;
  }
  return Math.max(start + 1, end);
};

/** Deterministic non-DOM fallback used by headless tests and non-browser runtimes. */
export const paginateDialogueText = (text: string, profile: DialoguePageProfile): string[] => {
  const normalized = normalize(text);
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

type SegmenterGranularity = 'sentence' | 'word' | 'grapheme';
type SegmentEntry = Readonly<{ segment: string }>;
type SegmenterLike = Readonly<{ segment(input: string): Iterable<SegmentEntry> }>;
type SegmenterConstructor = new (locale?: string | string[], options?: { granularity?: SegmenterGranularity }) => SegmenterLike;

const segmenterConstructor = (): SegmenterConstructor | null => {
  if (typeof Intl === 'undefined') return null;
  const intlWithSegmenter = Intl as typeof Intl & { Segmenter?: SegmenterConstructor };
  return typeof intlWithSegmenter.Segmenter === 'function' ? intlWithSegmenter.Segmenter : null;
};

const segmentSentences = (text: string, locale: string): string[] => {
  const Segmenter = segmenterConstructor();
  if (Segmenter) {
    const segmenter = new Segmenter(locale, { granularity: 'sentence' });
    const segments = Array.from(segmenter.segment(text), (entry) => normalize(entry.segment)).filter(Boolean);
    if (segments.length > 0) return segments;
  }

  const matches = text.match(/[^.!?…]+(?:[.!?…]+[»”"')\]]*|$)/g);
  return (matches ?? [text]).map(normalize).filter(Boolean);
};

const segmentWords = (text: string, locale: string): string[] => {
  const Segmenter = segmenterConstructor();
  if (Segmenter) {
    const segmenter = new Segmenter(locale, { granularity: 'word' });
    const segments = Array.from(segmenter.segment(text), (entry) => normalize(entry.segment)).filter(Boolean);
    if (segments.length > 0) return segments;
  }
  const words = text.split(/\s+/).map(normalize).filter(Boolean);
  return words.length > 1 ? words : Array.from(text);
};

const segmentGraphemes = (text: string, locale: string): string[] => {
  const Segmenter = segmenterConstructor();
  if (Segmenter) {
    const segmenter = new Segmenter(locale, { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(text), (entry) => entry.segment).filter(Boolean);
    if (segments.length > 0) return segments;
  }
  return Array.from(text);
};

const joinSegments = (segments: readonly string[]): string => {
  let result = '';
  for (const segment of segments) {
    if (!result) {
      result = segment;
      continue;
    }
    const noSpaceBefore = /^[,.;:!?…%)\]}>»”'’]/u.test(segment);
    const noSpaceAfterPrevious = /[(\[{<«“'’]$/u.test(result);
    const cjkBoundary = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]$/u.test(result)
      || /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(segment);
    result += noSpaceBefore || noSpaceAfterPrevious || cjkBoundary ? segment : ` ${segment}`;
  }
  return normalize(result);
};

const maxFittingPrefix = (segments: readonly string[], fits: DialogueFitPredicate): number => {
  if (segments.length === 0) return 0;
  let low = 1;
  let high = segments.length;
  let best = 0;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (fits(joinSegments(segments.slice(0, middle)))) {
      best = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return best;
};

const splitOversizedUnit = (unit: string, fits: DialogueFitPredicate, locale: string): string[] => {
  const words = segmentWords(unit, locale);
  if (words.length > 1) {
    const pages: string[] = [];
    let remaining = [...words];
    while (remaining.length > 0) {
      const count = maxFittingPrefix(remaining, fits);
      if (count > 0) {
        pages.push(joinSegments(remaining.splice(0, count)));
        continue;
      }
      const first = remaining.shift() ?? '';
      pages.push(...splitOversizedUnit(first, fits, locale));
    }
    return pages;
  }

  const graphemes = segmentGraphemes(unit, locale);
  if (graphemes.length <= 1) return [unit];
  const pages: string[] = [];
  let remaining = [...graphemes];
  while (remaining.length > 0) {
    const count = maxFittingPrefix(remaining, (candidate) => fits(candidate.replace(/\s+/g, '')));
    const safeCount = Math.max(1, count);
    pages.push(remaining.splice(0, safeCount).join(''));
  }
  return pages;
};

/**
 * Browser/runtime paginator. `fits` must answer whether candidate text fits in
 * the actual rendered dialogue text viewport. Sentence boundaries are kept
 * whenever possible; an oversized sentence falls back to locale-aware word
 * segmentation and finally grapheme segmentation.
 */
export const paginateDialogueTextMeasured = (
  text: string,
  fits: DialogueFitPredicate,
  locale = 'ru',
): string[] => {
  const normalized = normalize(text);
  if (!normalized) return [''];
  if (fits(normalized)) return [normalized];

  const sentences = segmentSentences(normalized, locale);
  const pages: string[] = [];
  let pending = '';

  for (const sentence of sentences) {
    const combined = pending ? joinSegments([pending, sentence]) : sentence;
    if (fits(combined)) {
      pending = combined;
      continue;
    }

    if (pending) {
      pages.push(pending);
      pending = '';
    }

    if (fits(sentence)) {
      pending = sentence;
      continue;
    }

    const fragments = splitOversizedUnit(sentence, fits, locale);
    if (fragments.length > 1) pages.push(...fragments.slice(0, -1));
    pending = fragments.length > 0 ? fragments[fragments.length - 1] : '';
  }

  if (pending) pages.push(pending);
  return pages.length > 0 ? pages : [normalized];
};

export const dialogueLocale = (): string => {
  if (typeof document !== 'undefined') {
    const lang = document.documentElement?.lang?.trim();
    if (lang) return lang;
  }
  return 'ru';
};

export const currentDialogueProfile = (textScale: DialogueTextScale): DialoguePageProfile => ({
  width: typeof window !== 'undefined' && typeof window.innerWidth === 'number' ? window.innerWidth : 390,
  height: typeof window !== 'undefined' && typeof window.innerHeight === 'number' ? window.innerHeight : 844,
  textScale,
});
