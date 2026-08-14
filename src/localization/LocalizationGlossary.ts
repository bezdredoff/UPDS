export type GlossaryRule = 'translate' | 'preserve' | 'transliterate';

export type LocalizationGlossaryEntry = Readonly<{
  id: string;
  ru: string;
  en: string;
  rule: GlossaryRule;
  note: string;
}>;

export const localizationGlossary: readonly LocalizationGlossaryEntry[] = [
  { id: 'title-class-u-detectives', ru: 'Детективы класса U', en: 'Class U Detectives', rule: 'translate', note: 'Product title; keep the U designation visible.' },
  { id: 'category-u', ru: 'Категория U', en: 'Category U', rule: 'translate', note: 'Investigation classification; U is never localized.' },
  { id: 'second-skin', ru: 'Second Skin', en: 'Second Skin', rule: 'preserve', note: 'Project/protocol codename; preserve Latin spelling.' },
  { id: 'asterion', ru: 'Asterion', en: 'Asterion', rule: 'preserve', note: 'Organization/lab brand; preserve Latin spelling.' },
  { id: 'seiran', ru: 'Сэйран', en: 'Seiran', rule: 'transliterate', note: 'College/proper-name stem; keep one canonical rendering per locale.' },
  { id: 'miku', ru: 'Мику', en: 'Miku', rule: 'transliterate', note: 'Character name.' },
  { id: 'onoe', ru: 'Оноэ', en: 'Onoe', rule: 'transliterate', note: 'Character name.' },
  { id: 'ayuki', ru: 'Аюки', en: 'Ayuki', rule: 'transliterate', note: 'Character name.' },
  { id: 'emi', ru: 'Эми', en: 'Emi', rule: 'transliterate', note: 'Character name.' },
  { id: 'rina', ru: 'Рина', en: 'Rina', rule: 'transliterate', note: 'Character name.' },
  { id: 'kurose', ru: 'Куросэ', en: 'Kurose', rule: 'transliterate', note: 'Character name.' },
  { id: 'kentaro', ru: 'Кэнтаро', en: 'Kentaro', rule: 'transliterate', note: 'Character name.' },
  { id: 'norihiro', ru: 'Норихиро', en: 'Norihiro', rule: 'transliterate', note: 'Character name.' },
  { id: 'mayu', ru: 'Маю', en: 'Mayu', rule: 'transliterate', note: 'Character name.' },
  { id: 'vincent', ru: 'Винсент', en: 'Vincent', rule: 'transliterate', note: 'Character name.' },
] as const;

export const validateLocalizationGlossary = (): string[] => {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const entry of localizationGlossary) {
    if (ids.has(entry.id)) issues.push(`Duplicate glossary id: ${entry.id}`);
    ids.add(entry.id);
    if (!entry.ru.trim()) issues.push(`${entry.id} has an empty RU source term.`);
    if (!entry.en.trim()) issues.push(`${entry.id} has an empty EN reference term.`);
    if (!entry.note.trim()) issues.push(`${entry.id} has no translator note.`);
  }
  return issues;
};
