import type { LocaleCatalogs } from '../MessageCatalog';
import type { Locale } from '../Locale';
import { beCatalog } from './be';
import { enCatalog } from './en';
import { match3ReactionCatalogs } from './match3Reactions';
import { ruCatalog } from './ru';

export const appCatalogs = {
  ru: { ...ruCatalog, ...match3ReactionCatalogs.ru },
  be: { ...beCatalog, ...match3ReactionCatalogs.be },
  en: { ...enCatalog, ...match3ReactionCatalogs.en },
} as const satisfies LocaleCatalogs<Locale>;
