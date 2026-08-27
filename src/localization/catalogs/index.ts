import type { Locale } from '../Locale';
import type { LocaleCatalogs, MessageCatalog } from '../MessageCatalog';
import { match3GuidanceCatalogs } from './match3Guidance';
import { match3HelpCatalogs } from './match3Help';
import { match3ReactionCatalogs } from './match3Reactions';
import { ruCatalog } from './ru';

const withMatch3RuntimeCopy = (
  catalog: MessageCatalog,
  reactions: MessageCatalog,
  help: MessageCatalog,
  guidance: MessageCatalog,
): MessageCatalog => ({
  ...catalog,
  ...reactions,
  ...help,
  ...guidance,
});

export const ruRuntimeCatalog = withMatch3RuntimeCopy(
  ruCatalog,
  match3ReactionCatalogs.ru,
  match3HelpCatalogs.ru,
  match3GuidanceCatalogs.ru,
);

/**
 * Startup catalogs intentionally contain only the default/fallback locale.
 * Non-default production locales are loaded on demand so their full VN/Match-3
 * copy does not inflate the initial player bundle.
 */
export const initialAppCatalogs = {
  ru: ruRuntimeCatalog,
} as const satisfies LocaleCatalogs<Locale>;

export async function loadRuntimeLocaleCatalog(locale: Locale): Promise<MessageCatalog> {
  if (locale === 'ru') return ruRuntimeCatalog;
  if (locale === 'be') {
    const { beCatalog } = await import('./be');
    return withMatch3RuntimeCopy(beCatalog, match3ReactionCatalogs.be, match3HelpCatalogs.be, match3GuidanceCatalogs.be);
  }
  const { enCatalog } = await import('./en');
  return withMatch3RuntimeCopy(enCatalog, match3ReactionCatalogs.en, match3HelpCatalogs.en, match3GuidanceCatalogs.en);
}
