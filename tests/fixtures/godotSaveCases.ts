import { APP_VERSION } from '../../src/appVersion';
import { levels } from '../../src/data/levels';
import { storySceneIds } from '../../src/data/storyGraph';
import { storyChoiceGateIds } from '../../src/data/storyChoices';
import { match3TutorialConceptIds } from '../../src/data/match3Tutorials';
import * as Story from '../../src/engine/CampaignSaveFormat';
import * as Match3 from '../../src/engine/Match3CampaignSaveFormat';

export const saveContract = () => ({
  storyKey: Story.ANM009_SAVE_KEY, storySchema: Story.SAVE_SCHEMA_VERSION,
  manualKey: Story.MANUAL_SAVE_KEY, recoveryKey: Story.SAVE_RECOVERY_KEY,
  match3Key: Match3.MATCH3_CAMPAIGN_SAVE_KEY, match3Schema: Match3.MATCH3_CAMPAIGN_SCHEMA_VERSION,
  appVersion: APP_VERSION, storySceneIds, levelIds: levels.map((level) => level.id),
  clueIds: levels.map((level) => level.clueId), storyChoiceGateIds, tutorialConceptIds: match3TutorialConceptIds,
});

type Operation = 'normalize_story' | 'normalize_match3' | 'decode_story' | 'decode_match3' | 'encode_story' | 'encode_match3' | 'export_story' | 'parse_json';
const timestamp = '2026-10-13T00:00:00.000Z';

export function godotSaveCases() {
  const cases: { name: string; operation: Operation; input: unknown; expected: unknown }[] = [];
  const evaluate = (operation: Operation, input: unknown): unknown => {
    switch (operation) {
      case 'normalize_story': return Story.normalizeSave(input);
      case 'normalize_match3': return Match3.normalizeMatch3CampaignSave(input);
      case 'decode_story': return Story.decodeCampaignSave(input);
      case 'decode_match3': return Match3.decodeMatch3CampaignSave(input);
      case 'encode_story': return Story.persistedSave(Story.normalizeSave(input), timestamp);
      case 'encode_match3': return Match3.encodeMatch3CampaignSave(Match3.normalizeMatch3CampaignSave(input), timestamp);
      case 'export_story': return Story.createSaveExportBundle(Story.normalizeSave(input), timestamp);
      case 'parse_json': {
        try { return { ok: true, value: JSON.parse(String(input)) }; }
        catch { return { ok: false }; }
      }
    }
  };
  const add = (operation: Operation, input: unknown) => cases.push({
    name: `${operation}-${cases.length}`, operation, input, expected: evaluate(operation, input),
  });
  const values: unknown[] = [null, '', ' 2 ', true, false, 1, 2.5, -7, 'bad', '0x10', '0b10', '0o10', [], [2], [[3]], [null], [true], {}, { value: 2 }, 'Infinity', '-Infinity', '2e2', '+4.0', 'inf', '\u00a02\ufeff', [1.0000000000000002], 1e20, '1e309', '1e-400', [null, null]];
  const inputs: unknown[] = [...values, { scene: 0 }, { schemaVersion: 2 }, { scene: 0, schemaVersion: 3 },
    { scene: 0, saveKey: 'other-game' }, { scene: 0, saveKey: null },
    { ...Story.freshSave(), scene: 44, line: 900, choice: 'C',
      clues: [levels[0].clueId, levels[0].clueId, 'bad'], completed: [0, '1', true, -1, 22, 1.2],
      attempts: { level: '2.8', other: -2, empty: '', bad: 'bad' },
      readLines: ['VN0001', 'VN0001', 'VN0250A', 'VN0964', 'VN12345', 'VN１２３４', 'VN0002\n', 2],
      tutorialsCompleted: [...match3TutorialConceptIds, 'bad'], storyChoices: { 'final-strategy': 'C', 'meeting-tone': 'A', bad: 'B' } },
    { completed: levels.map((level) => level.id), attempts: { [levels[0].id]: '3.7', bad: 8 }, bestMovesLeft: { [levels[1].id]: 7.9 } },
    Story.createSaveExportBundle({ ...Story.freshSave(), scene: 12, line: 3, choice: 'B' }, timestamp),
  ];
  for (const value of values) {
    inputs.push({ scene: value, line: value, choice: value, schemaVersion: value,
      clues: value, completed: value, attempts: { [levels[0].id]: value, extra: value },
      bestMovesLeft: { [levels[0].id]: value }, readLines: value, tutorialsCompleted: value,
      storyChoices: { 'final-strategy': value } });
    inputs.push({ format: 'upds-campaign-save', saveKey: Story.ANM009_SAVE_KEY, schemaVersion: value, state: { scene: 2 } });
  }
  inputs.push({ format: 'upds-campaign-save', saveKey: Story.ANM009_SAVE_KEY, state: {} },
    { format: 'upds-campaign-save', saveKey: Story.ANM009_SAVE_KEY, schemaVersion: 2, state: [] });
  for (const input of inputs) {
    for (const operation of ['normalize_story', 'normalize_match3', 'decode_story', 'decode_match3'] as const) add(operation, input);
  }
  for (const input of inputs.slice(-8)) {
    for (const operation of ['encode_story', 'encode_match3', 'export_story'] as const) add(operation, input);
  }
  for (const text of ['null', '{}', '[]', 'false', '  {"scene": 1} \n', '{"scene":1,}', '[1,]',
    '{"scene":01}', '{"scene":.5}', '{"scene":+1}', '{"scene":1.}', '{"scene":NaN}',
    '"line\nbreak"', '"line\tbreak"', '{"scene":1} trailing', '{"scene":"a\\x20"}', '\ufeff{"scene":1}',
    '{"scene":1,"readLines":["VN0001",]}', '{"scene":1e309}', '{"scene":2,"note":"\\u0410\\n"}',
    '{"a":[],"b":{},"c":[true, false, null, -1.2e+3]}', '[,]', '{"a" 1}', 'true false',
    '{"a":1,"a":2}', '{"a":"\\\\\\\""}', '{"a":{"b":[{"c":1}]}}', '[ ]', ' { } ', '{"a":[ \n ]}']) add('parse_json', text);
  // Serialize exactly as the web storage/export boundary (including Infinity -> null).
  return JSON.parse(JSON.stringify({ timestamp, cases })) as { timestamp: string; cases: typeof cases };
}
