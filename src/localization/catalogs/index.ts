import type { LocaleCatalogs } from '../MessageCatalog';
import type { Locale } from '../Locale';
import { enCatalog } from './en';
import { match3ReactionCatalogs } from './match3Reactions';
import { ruCatalog } from './ru';

export const appCatalogs = {
  ru: { ...ruCatalog, ...match3ReactionCatalogs.ru },
  en: { ...enCatalog, ...match3ReactionCatalogs.en },
} as const satisfies LocaleCatalogs<Locale>;
