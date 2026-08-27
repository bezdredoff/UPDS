import type { Locale } from '../Locale';
import type { MessageCatalog } from '../MessageCatalog';

export const match3GuidanceCatalogs = {
  ru: {
    'match3.storyObjectGuidance': 'Сюжетный объект: {object}. Его нельзя менять местами — освобождайте клетки под ним и доведите до нижнего края.',
  },
  be: {
    'match3.storyObjectGuidance': 'Сюжэтны аб’ект: {object}. Яго нельга мяняць месцамі — вызваляйце клеткі пад ім і давядзіце да ніжняга краю.',
  },
  en: {
    'match3.storyObjectGuidance': 'Story object: {object}. It cannot be swapped — clear cells below it and guide it to the bottom edge.',
  },
} as const satisfies Readonly<Record<Locale, MessageCatalog>>;
