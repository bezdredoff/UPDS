import { levels, type LevelDefinition } from '../../src/data/levels';

/** Test reference to the unaccepted M3_06 7×9 production pilot; not a second campaign level. */
export function workshopRectanglePrototype(): LevelDefinition {
  const source = levels.find((level) => level.shortId === 'M3_06');
  if (!source) throw new Error('M3_06 production source missing');
  return source;
}
