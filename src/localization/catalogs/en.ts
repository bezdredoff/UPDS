import type { MessageCatalog } from '../MessageCatalog';

// ANM-019A intentionally keeps this catalog minimal. Feature text migrates in
// later atomic packages; missing English keys fall back to the Russian source
// catalog until their owning feature is localized.
export const enCatalog = {
  'localization.language.ru': 'Русский',
  'localization.language.en': 'English',
  'localization.language.label': 'Language',
} as const satisfies MessageCatalog;
