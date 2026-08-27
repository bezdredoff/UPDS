import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';

const protocol = readFileSync(
  new URL('../docs/process/MATCH3_HUMAN_PLAYTEST_PROTOCOL_RU.md', import.meta.url),
  'utf8',
);
const template = readFileSync(
  new URL('../docs/templates/MATCH3_PLAYTEST_SESSION_RU.md', import.meta.url),
  'utf8',
);
const feature = readFileSync(
  new URL('../docs/features/ANM025E6B_MATCH3_HUMAN_PLAYTEST_PROTOCOL_RU.md', import.meta.url),
  'utf8',
);

const cohort = ['M3_00', 'M3_02', 'M3_04', 'M3_06', 'M3_11', 'M3_12', 'M3_17', 'M3_21'] as const;
const dimensions = [
  'Понятность цели',
  'Визуальная читаемость',
  'Причинность',
  'Осмысленный выбор',
  'Fun / желание продолжать',
] as const;

describe('ANM-025E6B Match-3 human playtest protocol', () => {
  it('keeps the representative E4B + E4C cohort valid and ordered', () => {
    const productionShortIds = new Set(levels.map((level) => level.shortId));
    for (const shortId of cohort) expect(productionShortIds.has(shortId)).toBe(true);

    const positions = cohort.map((shortId) => protocol.indexOf(`\`${shortId}\``));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it('locks repeatable seed, reset and export procedure', () => {
    expect(protocol).toContain('seed `120000`');
    expect(protocol).toContain('seed `120004`');
    expect(protocol).toContain('Очистить playtest data');
    expect(protocol).toContain('Экспорт playtest report');
    expect(protocol).toContain('?qa=1');
    expect(protocol).toContain('Level Lab');
    expect(protocol).toContain('Retry same seed');
  });

  it('keeps the same subjective dimensions in protocol and session template', () => {
    for (const dimension of dimensions) {
      expect(protocol).toContain(dimension);
      expect(template).toContain(dimension);
    }

    for (const shortId of cohort) expect(template).toContain(`— ${shortId}`);
    expect(template).toContain('Хотелось бы продолжить играть ещё 10 минут');
    expect(template).toContain('Telemetry exported: `да / нет`');
  });

  it('records Reporting & QA closeout without adding browser-test scope', () => {
    expect(feature).toContain('E6A Match-3 Playtest Summary');
    expect(feature).toContain('Chromium full E2E');
    expect(feature).toContain('Mobile WebKit Golden Samples');
    expect(feature).toContain('playtest protocol');
    expect(feature).toContain('remediation plan A–E можно считать реализованным');
    expect(feature).toContain('Новый Playwright spec не добавляется');
  });
});
