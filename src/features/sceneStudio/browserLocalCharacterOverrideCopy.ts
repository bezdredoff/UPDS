export type BrowserOverrideCopy = Readonly<{
  eyebrow: string;
  title: string;
  copy: string;
  load: string;
  reset: string;
  note: string;
  idleStatus: string;
  activeStatus: string;
  resetStatus: string;
  loading: (file: string) => string;
  loaded: (file: string, count: number) => string;
  failed: (error: string) => string;
  summary: (frames: number, poseB: boolean, medallion: boolean, total: number) => string;
}>;

export const browserOverrideCopy = (locale: string): BrowserOverrideCopy => locale === 'be'
  ? {
      eyebrow: 'BROWSER VISUAL LAB',
      title: 'Лакальныя падмены персанажаў',
      copy: 'Загрузіце ZIP з прамымі production-заменамі PNG. Браўзер аўтаматычна вымярае alpha-межы і пакідае падмены толькі ў гэтай browser-сесіі.',
      load: 'Загрузіць ZIP',
      reset: 'Скінуць лакальныя падмены',
      note: 'Падтрымліваюцца production-шляхі public/assets/characters/... для Pose A, Pose B і medallion. GitHub, manifest і save не змяняюцца.',
      idleStatus: 'Лакальныя падмены не загружаныя.',
      activeStatus: 'Лакальныя browser-overrides актыўныя.',
      resetStatus: 'Лакальныя падмены ачышчаны.',
      loading: (file) => `Загрузка ${file}…`,
      loaded: (file, count) => `Загружана ${count} лакальных override-асэтаў з ${file}.`,
      failed: (error) => `Не ўдалося загрузіць лакальныя падмены: ${error}`,
      summary: (frames, poseB, medallion, total) => `кадры ${frames} · pose B ${poseB ? 1 : 0} · медальён ${medallion ? 1 : 0} · усяго ${total}`,
    }
  : locale === 'en'
    ? {
        eyebrow: 'BROWSER VISUAL LAB',
        title: 'Local character overrides',
        copy: 'Load a ZIP with direct production PNG replacements. The browser measures alpha bounds automatically and keeps the overrides only in this browser session.',
        load: 'Load ZIP',
        reset: 'Reset local overrides',
        note: 'Production paths under public/assets/characters/... are supported for Pose A, Pose B and medallions. GitHub, manifests and saves are unchanged.',
        idleStatus: 'No local overrides loaded.',
        activeStatus: 'Local browser overrides are active.',
        resetStatus: 'Local overrides cleared.',
        loading: (file) => `Loading ${file}…`,
        loaded: (file, count) => `Loaded ${count} local override assets from ${file}.`,
        failed: (error) => `Local override load failed: ${error}`,
        summary: (frames, poseB, medallion, total) => `frames ${frames} · pose B ${poseB ? 1 : 0} · medallion ${medallion ? 1 : 0} · total ${total}`,
      }
    : {
        eyebrow: 'BROWSER VISUAL LAB',
        title: 'Локальные подмены персонажей',
        copy: 'Загрузите ZIP с прямыми production-заменами PNG. Браузер автоматически измерит alpha-границы и оставит подмены только в этой browser-сессии.',
        load: 'Загрузить ZIP',
        reset: 'Сбросить локальные подмены',
        note: 'Поддерживаются production-пути public/assets/characters/... для Pose A, Pose B и medallion. GitHub, manifest и save не меняются.',
        idleStatus: 'Локальные подмены не загружены.',
        activeStatus: 'Локальные browser-overrides активны.',
        resetStatus: 'Локальные подмены очищены.',
        loading: (file) => `Загрузка ${file}…`,
        loaded: (file, count) => `Загружено ${count} локальных override-ассетов из ${file}.`,
        failed: (error) => `Не удалось загрузить локальные подмены: ${error}`,
        summary: (frames, poseB, medallion, total) => `кадры ${frames} · pose B ${poseB ? 1 : 0} · медальон ${medallion ? 1 : 0} · всего ${total}`,
      };
