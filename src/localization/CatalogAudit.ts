import type { MessageCatalog } from './MessageCatalog';

export type CatalogPlaceholderMismatch = Readonly<{
  key: string;
  source: readonly string[];
  target: readonly string[];
}>;

export type CatalogAudit = Readonly<{
  sourceKeyCount: number;
  targetKeyCount: number;
  missingKeys: readonly string[];
  extraKeys: readonly string[];
  emptyKeys: readonly string[];
  placeholderMismatches: readonly CatalogPlaceholderMismatch[];
}>;

const placeholderPattern = /\{([a-zA-Z0-9_.-]+)\}/g;

export const selectMessageCatalogByPrefixes = (
  catalog: MessageCatalog,
  prefixes: readonly string[],
): MessageCatalog => {
  const prefixSet = new Set(prefixes);
  return Object.fromEntries(
    Object.entries(catalog).filter(([key]) => prefixSet.has(key.split('.')[0])),
  );
};

const placeholders = (value: string): string[] =>
  Array.from(value.matchAll(placeholderPattern), (match) => match[1]).sort();

export const auditMessageCatalog = (source: MessageCatalog, target: MessageCatalog): CatalogAudit => {
  const sourceKeys = Object.keys(source).sort();
  const targetKeys = Object.keys(target).sort();
  const targetKeySet = new Set(targetKeys);
  const sourceKeySet = new Set(sourceKeys);
  const missingKeys = sourceKeys.filter((key) => !targetKeySet.has(key));
  const extraKeys = targetKeys.filter((key) => !sourceKeySet.has(key));
  const emptyKeys = targetKeys.filter((key) => target[key]?.trim() === '');
  const placeholderMismatches: CatalogPlaceholderMismatch[] = [];

  for (const key of sourceKeys) {
    const targetValue = target[key];
    if (targetValue === undefined) continue;
    const sourcePlaceholders = placeholders(source[key]);
    const targetPlaceholders = placeholders(targetValue);
    if (sourcePlaceholders.join('|') !== targetPlaceholders.join('|')) {
      placeholderMismatches.push({ key, source: sourcePlaceholders, target: targetPlaceholders });
    }
  }

  return {
    sourceKeyCount: sourceKeys.length,
    targetKeyCount: targetKeys.length,
    missingKeys,
    extraKeys,
    emptyKeys,
    placeholderMismatches,
  };
};

export const isCatalogStructurallyComplete = (audit: CatalogAudit): boolean =>
  audit.missingKeys.length === 0
  && audit.extraKeys.length === 0
  && audit.emptyKeys.length === 0
  && audit.placeholderMismatches.length === 0;
