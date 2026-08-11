import type { LocaleCatalogs } from '../MessageCatalog';
import type { Locale } from '../Locale';
import { enCatalog } from './en';
import { ruCatalog } from './ru';

export const appCatalogs = {
  ru: ruCatalog,
  en: enCatalog,
} as const satisfies LocaleCatalogs<Locale>;
