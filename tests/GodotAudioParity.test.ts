import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { audioCueNames, getCueDefinition } from '../src/audio/AudioCues';
import { getMusicTheme } from '../src/audio/MusicTheme';

describe('Godot menu audio source parity', () => {
  const definitions = JSON.parse(readFileSync('godot/data/menu_audio.json', 'utf8'));

  it('preserves the authored menu melody, timing, waveforms and gains', () => {
    expect(definitions.menu).toEqual(getMusicTheme('menu'));
    expect(definitions.vn).toEqual(getMusicTheme('vn'));
    expect(definitions.ending).toEqual(getMusicTheme('ending'));
  });

  it('preserves the settings preview and menu click effects', () => {
    expect(definitions.match).toEqual(getCueDefinition('match'));
    expect(definitions.uiClick).toEqual(getCueDefinition('uiClick'));
  });

  it.each(audioCueNames)('preserves the complete %s cue, including its vibration pattern', (cue) => {
    expect(definitions[cue]).toEqual(getCueDefinition(cue));
  });
});
