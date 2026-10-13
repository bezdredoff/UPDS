import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { godotSaveCases, saveContract } from './fixtures/godotSaveCases';

describe('Godot campaign save parity', () => {
  it('keeps keys, schema versions, IDs and app metadata aligned with the web source', () => {
    expect(JSON.parse(readFileSync('godot/data/save_contract.json', 'utf8'))).toEqual(saveContract());
  });

  it('keeps native-engine fixture expectations derived from the actual web codecs', () => {
    expect(JSON.parse(readFileSync('godot/tests/save_format_cases.json', 'utf8'))).toEqual(godotSaveCases());
  });
});
