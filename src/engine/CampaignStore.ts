import type { ChoiceId } from '../data/narrative';
import type { ClueId } from '../data/levels';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type CampaignSave = {
  scene: number;
  line: number;
  choice: ChoiceId;
  clues: ClueId[];
  completed: number[];
  attempts: Record<string, number>;
  readLines: string[];
};

export const ANM009_SAVE_KEY = 'seiran-detectives-anm009-v1';

export const freshSave = (): CampaignSave => ({
  scene: 0,
  line: 0,
  choice: 'A',
  clues: [],
  completed: [],
  attempts: {},
  readLines: [],
});

const isChoice = (value: unknown): value is ChoiceId => value === 'A' || value === 'B' || value === 'C';
const clueIds: readonly ClueId[] = ['CUE_001', 'CUE_002', 'CUE_003', 'CUE_004'];

export function normalizeSave(value: unknown): CampaignSave {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return freshSave();
  const candidate = value as Partial<CampaignSave>;
  const scene = Number(candidate.scene);
  const line = Number(candidate.line);
  const attempts = candidate.attempts && typeof candidate.attempts === 'object' && !Array.isArray(candidate.attempts)
    ? Object.fromEntries(Object.entries(candidate.attempts).map(([key, count]) => [key, Math.max(0, Math.floor(Number(count) || 0))]))
    : {};

  return {
    scene: Number.isInteger(scene) ? Math.max(0, Math.min(8, scene)) : 0,
    line: Number.isInteger(line) ? Math.max(0, line) : 0,
    choice: isChoice(candidate.choice) ? candidate.choice : 'A',
    clues: Array.isArray(candidate.clues)
      ? [...new Set(candidate.clues.filter((clue): clue is ClueId => clueIds.includes(clue as ClueId)))]
      : [],
    completed: Array.isArray(candidate.completed)
      ? [...new Set(candidate.completed.map(Number).filter((index) => Number.isInteger(index) && index >= 0 && index < 4))]
      : [],
    attempts,
    readLines: Array.isArray(candidate.readLines)
      ? [...new Set(candidate.readLines.filter((lineId): lineId is string => typeof lineId === 'string' && /^VN\d{4}[ABC]?$/.test(lineId)))]
      : [],
  };
}

export class CampaignStore {
  constructor(private readonly storage: StorageLike, private readonly key = ANM009_SAVE_KEY) {}

  load(): CampaignSave {
    try {
      const raw = this.storage.getItem(this.key);
      return raw ? normalizeSave(JSON.parse(raw)) : freshSave();
    } catch {
      return freshSave();
    }
  }

  save(state: CampaignSave): void {
    this.storage.setItem(this.key, JSON.stringify(normalizeSave(state)));
  }

  reset(): CampaignSave {
    const state = freshSave();
    this.storage.removeItem(this.key);
    return state;
  }
}

export const isPreMatchScene = (scene: number): boolean => scene === 1 || scene === 3 || scene === 5 || scene === 7;
export const levelForPreMatchScene = (scene: number): number => Math.floor(scene / 2);
export const postSceneForLevel = (level: number): number => level * 2 + 2;
