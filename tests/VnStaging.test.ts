import { describe, expect, it } from 'vitest';
import { actorForStorySpeaker, resolveVnStaging } from '../src/ui/vnStaging';

const line = (id: string, speaker: string) => ({ id, speaker, emotion: 'нейтрально', text: 'Тест.' });

describe('ANM-016A VN character staging', () => {
  it('maps production and placeholder speakers without changing art assets', () => {
    expect(actorForStorySpeaker('МИКУ')).toBe('miku');
    expect(actorForStorySpeaker('МИКУ (МЫСЛИ)')).toBe('miku');
    expect(actorForStorySpeaker('ОНОЭ')).toBe('onoe');
    expect(actorForStorySpeaker('АЮКИ')).toBe('ayuki');
    expect(actorForStorySpeaker('ЭМИ')).toBe('emi');
    expect(actorForStorySpeaker('РЕЖИССУРА')).toBeNull();
  });

  it('keeps Miku and Onoe on opposite stable dialogue lanes', () => {
    const story = [line('VN0001', 'МИКУ'), line('VN0002', 'ОНОЭ'), line('VN0003', 'МИКУ')];
    expect(resolveVnStaging(story, 0)?.side).toBe('left');
    expect(resolveVnStaging(story, 1)?.side).toBe('right');
    expect(resolveVnStaging(story, 2)?.side).toBe('left');
  });

  it('keeps Onoe and Ayuki on opposite lanes even without Miku', () => {
    const story = [line('VN0010', 'ОНОЭ'), line('VN0011', 'АЮКИ')];
    expect(resolveVnStaging(story, 0)?.side).toBe('left');
    expect(resolveVnStaging(story, 1)?.side).toBe('right');
  });

  it('places external interviewees opposite the detective team', () => {
    const story = [line('VN0020', 'МИКУ'), line('VN0021', 'ЭМИ'), line('VN0022', 'ОНОЭ')];
    expect(resolveVnStaging(story, 0)?.side).toBe('left');
    expect(resolveVnStaging(story, 1)?.side).toBe('right');
    expect(resolveVnStaging(story, 2)?.side).toBe('left');
  });

  it('uses a centered close internal shot for Miku thoughts', () => {
    const story = [line('VN0030', 'МИКУ (МЫСЛИ)')];
    expect(resolveVnStaging(story, 0)).toEqual({ actor: 'miku', counterpart: null, side: 'center' });
  });
});
