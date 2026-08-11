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

function usesCjkLocale(locale: string): boolean {
  return /^(?:ja|zh|ko)(?:-|$)/iu.test(locale);
}

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
  // Whitespace languages are safest when we preserve each original token
  // byte-for-byte (apart from collapsed inter-token whitespace). This avoids
  // Intl word segmentation inventing spaces inside things like quoted words,
  // variable expressions or German compounds.
  if (!usesCjkLocale(locale)) {
    const words = text.trim().split(/\s+/u).filter(Boolean);
    return words.length > 0 ? words : [text];
  }

  const Segmenter = segmenterConstructor();
  if (Segmenter) {
    const segmenter = new Segmenter(locale, { granularity: 'word' });
    const segments = Array.from(segmenter.segment(text), (entry) => normalize(entry.segment)).filter(Boolean);
    if (segments.length > 0) return segments;
  }
  return Array.from(text);
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

const CONTINUATION_MARKER = '…';
const PREFERRED_CONTINUATION_WORDS = 4;
const MIN_CONTINUATION_WORDS = 3;
const PREFERRED_CONTINUATION_CJK_GRAPHEMES = 6;
const MIN_CONTINUATION_CJK_GRAPHEMES = 4;

export const dialogueContinuationText = (page: string, hasContinuation: boolean): string => {
  if (!hasContinuation) return page;
  const trimmed = page.trimEnd();
  if (!trimmed) return CONTINUATION_MARKER;
  if (trimmed.endsWith(CONTINUATION_MARKER)) return trimmed;
  if (/[.;:。；：]$/u.test(trimmed)) return `${trimmed.slice(0, -1)}${CONTINUATION_MARKER}`;
  return `${trimmed}${CONTINUATION_MARKER}`;
};

const visibleWordCount = (text: string): number => text
  .trim()
  .split(/\s+/u)
  .filter((token) => /[\p{L}\p{N}]/u.test(token))
  .length;

const cjkGraphemeCount = (text: string, locale: string): number => segmentGraphemes(text, locale)
  .filter((segment) => /[\p{L}\p{N}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(segment))
  .length;

const meaningfulUnitCount = (text: string, locale: string, forceGrapheme = false): number => forceGrapheme || usesCjkLocale(locale)
  ? cjkGraphemeCount(text, locale)
  : visibleWordCount(text);

const minimumContinuationUnits = (locale: string, preferred: boolean, forceGrapheme = false): number => forceGrapheme || usesCjkLocale(locale)
  ? (preferred ? PREFERRED_CONTINUATION_CJK_GRAPHEMES : MIN_CONTINUATION_CJK_GRAPHEMES)
  : (preferred ? PREFERRED_CONTINUATION_WORDS : MIN_CONTINUATION_WORDS);

const hasHealthyContinuation = (remaining: string, locale: string, preferred: boolean, forceGrapheme = false): boolean => {
  if (!remaining.trim()) return true;
  return meaningfulUnitCount(remaining, locale, forceGrapheme) >= minimumContinuationUnits(locale, preferred, forceGrapheme);
};

const hasHealthyPageBody = (candidate: string, locale: string, forceGrapheme = false): boolean => {
  const minimum = forceGrapheme || usesCjkLocale(locale) ? 4 : 3;
  return meaningfulUnitCount(candidate, locale, forceGrapheme) >= minimum;
};

type SplitCandidate = Readonly<{ head: string; tail: string }>;

const hasAwkwardPunctuationBoundary = (head: string, tail: string): boolean => {
  const left = head.trimEnd();
  const right = tail.trimStart();
  if (!left || !right) return true;
  if (/[(\[{<«“]$/u.test(left)) return true;
  if (/^[,.;:!?…%)\]}>»”]/u.test(right)) return true;
  return false;
};

const largestHealthyBoundary = (
  units: readonly string[],
  fits: DialogueFitPredicate,
  locale: string,
  options: Readonly<{ allowSmallHead?: boolean; preferredTail?: boolean; ignoreTailMinimum?: boolean; forceGrapheme?: boolean; join?: (parts: readonly string[]) => string }> = {},
): SplitCandidate | null => {
  if (units.length < 2) return null;
  const join = options.join ?? joinSegments;
  for (let cut = units.length - 1; cut >= 1; cut -= 1) {
    const head = join(units.slice(0, cut));
    const tail = join(units.slice(cut));
    if (!head || !tail) continue;
    if (hasAwkwardPunctuationBoundary(head, tail)) continue;
    if (!options.ignoreTailMinimum && !hasHealthyContinuation(tail, locale, options.preferredTail ?? true, options.forceGrapheme ?? false)) continue;
    if (!options.allowSmallHead && !hasHealthyPageBody(head, locale, options.forceGrapheme ?? false)) continue;
    if (fits(dialogueContinuationText(head, true))) return { head, tail };
  }
  return null;
};

const splitAtPreferredBoundary = (
  remaining: string,
  fits: DialogueFitPredicate,
  locale: string,
): SplitCandidate | null => {
  const sentences = segmentSentences(remaining, locale);
  const sentenceBoundary = largestHealthyBoundary(sentences, fits, locale);
  if (sentenceBoundary) return sentenceBoundary;
  const sentenceBoundaryHardMin = largestHealthyBoundary(sentences, fits, locale, { preferredTail: false });
  if (sentenceBoundaryHardMin) return sentenceBoundaryHardMin;

  const words = segmentWords(remaining, locale);
  const wordBoundary = largestHealthyBoundary(words, fits, locale);
  if (wordBoundary) return wordBoundary;
  const wordBoundaryHardMin = largestHealthyBoundary(words, fits, locale, { preferredTail: false });
  if (wordBoundaryHardMin) return wordBoundaryHardMin;
  const wordBoundarySmallHead = largestHealthyBoundary(words, fits, locale, { allowSmallHead: true, preferredTail: false });
  if (wordBoundarySmallHead) return wordBoundarySmallHead;
  const wordBoundaryAnyTail = largestHealthyBoundary(words, fits, locale, { allowSmallHead: true, ignoreTailMinimum: true });
  if (wordBoundaryAnyTail) return wordBoundaryAnyTail;

  // Grapheme splitting is a last resort for CJK or a genuinely unbreakable
  // single word/identifier. Do not use it to manufacture one-word tails in
  // normal whitespace-separated dialogue.
  if (!usesCjkLocale(locale) && visibleWordCount(remaining) > 1) return null;
  const graphemes = segmentGraphemes(remaining, locale);
  const graphemeJoin = (parts: readonly string[]): string => parts.join('');
  return largestHealthyBoundary(graphemes, fits, locale, { allowSmallHead: true, preferredTail: false, forceGrapheme: true, join: graphemeJoin });
};

const rebalanceContinuationTails = (pages: readonly string[], fits: DialogueFitPredicate, locale: string): string[] => {
  const balanced = [...pages];
  if (balanced.length < 2) return balanced;

  if (usesCjkLocale(locale)) {
    for (let index = balanced.length - 1; index >= 1; index -= 1) {
      while (cjkGraphemeCount(balanced[index], locale) < MIN_CONTINUATION_CJK_GRAPHEMES) {
        const previous = segmentGraphemes(balanced[index - 1], locale);
        if (previous.length <= 1) break;
        const moved = previous.pop() ?? '';
        const candidate = `${moved}${balanced[index]}`;
        if (!fits(dialogueContinuationText(candidate, index < balanced.length - 1))) break;
        balanced[index - 1] = previous.join('');
        balanced[index] = candidate;
      }
    }
    return balanced;
  }

  for (let index = balanced.length - 1; index >= 1; index -= 1) {
    while (visibleWordCount(balanced[index]) < MIN_CONTINUATION_WORDS) {
      // If both sides are single no-space fragments, they may be two halves
      // of one intentionally grapheme-split compound word. Never insert a
      // synthetic space between those fragments while balancing page tails.
      if (!/\s/u.test(balanced[index - 1]) && !/\s/u.test(balanced[index])) break;
      const previous = balanced[index - 1].trim().split(/\s+/u).filter(Boolean);
      if (previous.length <= 1) break;
      const moved = previous.pop() ?? '';
      const candidate = joinSegments([moved, balanced[index]]);
      if (!fits(dialogueContinuationText(candidate, index < balanced.length - 1))) break;
      balanced[index - 1] = previous.join(' ');
      balanced[index] = candidate;
    }
  }
  return balanced;
};

/**
 * Browser/runtime paginator. `fits` measures the real two-line dialogue
 * viewport. Continuation pages reserve room for a presentation ellipsis,
 * prefer sentence/word boundaries and avoid orphan tails of one or two words.
 * Raw authored text remains untouched: the ellipsis is applied only by
 * `dialogueContinuationText` when a non-final internal page is displayed.
 */
export const paginateDialogueTextMeasured = (
  text: string,
  fits: DialogueFitPredicate,
  locale = 'ru',
): string[] => {
  const normalized = normalize(text);
  if (!normalized) return [''];
  if (fits(normalized)) return [normalized];

  const pages: string[] = [];
  let remaining = normalized;
  let guard = 0;

  while (remaining && guard < 256) {
    guard += 1;
    if (fits(remaining)) {
      pages.push(remaining);
      remaining = '';
      break;
    }

    const split = splitAtPreferredBoundary(remaining, fits, locale);
    if (!split || split.head === remaining || !split.head) {
      // Measurement can still encounter a single enormous unbreakable token.
      // Keep progress deterministic, but never emit 1–2 grapheme pages when a
      // healthy fallback exists in the caller.
      const graphemes = segmentGraphemes(remaining, locale);
      let best = 0;
      for (let cut = graphemes.length - 1; cut >= 1; cut -= 1) {
        const head = graphemes.slice(0, cut).join('');
        const tail = graphemes.slice(cut).join('');
        if (!hasHealthyContinuation(tail, locale, false, true)) continue;
        if (fits(dialogueContinuationText(head, true))) { best = cut; break; }
      }
      if (best <= 0) return pages.length > 0 ? [...pages, remaining] : [normalized];
      pages.push(graphemes.slice(0, best).join(''));
      remaining = normalize(graphemes.slice(best).join(''));
      continue;
    }

    pages.push(split.head);
    remaining = split.tail;
  }

  return pages.length > 0 ? rebalanceContinuationTails(pages, fits, locale) : [normalized];
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
