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
  controlsTitle: string;
  controlsCopy: string;
  scope: string;
  globalScope: string;
  currentPlanScope: (plan: string) => string;
  planOverrideActive: string;
  planUsesGlobal: string;
  copyGlobalToPlan: string;
  resetGlobal: string;
  resetPlan: string;
  exportTitle: string;
  exportCopy: string;
  copyJson: string;
  downloadJson: string;
  eyeLine: string;
  bottomPivot: string;
  scale: string;
  frameX: string;
  frameY: string;
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
      controlsTitle: 'Ручная каліброўка',
      controlsCopy: 'Наладжвайце eye-line, bottom pivot, маштаб і X/Y-пазіцыю глабальна або асобна для бягучага плана.',
      scope: 'Вобласць',
      globalScope: 'Глабальна для персанажа',
      currentPlanScope: (plan) => `Бягучы план · ${plan}`,
      planOverrideActive: 'Для гэтага плана ёсць асобная каліброўка.',
      planUsesGlobal: 'Гэты план пакуль выкарыстоўвае глабальную каліброўку.',
      copyGlobalToPlan: 'Скапіраваць global → plan',
      resetGlobal: 'Скінуць global',
      resetPlan: 'Скінуць гэты plan',
      exportTitle: 'JSON-здымак',
      exportCopy: 'Экспарт захоўвае global і per-plan geometry/staging, каб пазней перанесці абраны варыянт у production без паўторнай калиброўкі.',
      copyJson: 'Скапіяваць JSON',
      downloadJson: 'Спампаваць JSON',
      eyeLine: 'Eye-line',
      bottomPivot: 'Bottom pivot',
      scale: 'Маштаб',
      frameX: 'Пазіцыя X',
      frameY: 'Пазіцыя Y',
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
        controlsTitle: 'Manual calibration',
        controlsCopy: 'Tune eye-line, bottom pivot, scale and X/Y framing globally or independently for the current shot plan.',
        scope: 'Scope',
        globalScope: 'Global for character',
        currentPlanScope: (plan) => `Current plan · ${plan}`,
        planOverrideActive: 'This plan has its own calibration.',
        planUsesGlobal: 'This plan currently inherits the global calibration.',
        copyGlobalToPlan: 'Copy global → plan',
        resetGlobal: 'Reset global',
        resetPlan: 'Reset this plan',
        exportTitle: 'JSON snapshot',
        exportCopy: 'The export stores global and per-plan geometry/staging so the winning local override can be transferred into production without recalibrating it again.',
        copyJson: 'Copy JSON',
        downloadJson: 'Download JSON',
        eyeLine: 'Eye line',
        bottomPivot: 'Bottom pivot',
        scale: 'Scale',
        frameX: 'Frame X',
        frameY: 'Frame Y',
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
        controlsTitle: 'Ручная калибровка',
        controlsCopy: 'Настраивайте eye-line, bottom pivot, масштаб и X/Y-положение глобально или отдельно для текущего плана.',
        scope: 'Область',
        globalScope: 'Глобально для персонажа',
        currentPlanScope: (plan) => `Текущий план · ${plan}`,
        planOverrideActive: 'Для этого плана есть отдельная калибровка.',
        planUsesGlobal: 'Этот план пока наследует глобальную калибровку.',
        copyGlobalToPlan: 'Скопировать global → plan',
        resetGlobal: 'Сбросить global',
        resetPlan: 'Сбросить этот plan',
        exportTitle: 'JSON-слепок',
        exportCopy: 'Экспорт сохраняет global и per-plan geometry/staging, чтобы потом перенести выбранный локальный override в production без повторной ручной калибровки.',
        copyJson: 'Скопировать JSON',
        downloadJson: 'Скачать JSON',
        eyeLine: 'Eye-line',
        bottomPivot: 'Bottom pivot',
        scale: 'Масштаб',
        frameX: 'Позиция X',
        frameY: 'Позиция Y',
        loading: (file) => `Загрузка ${file}…`,
        loaded: (file, count) => `Загружено ${count} локальных override-ассетов из ${file}.`,
        failed: (error) => `Не удалось загрузить локальные подмены: ${error}`,
        summary: (frames, poseB, medallion, total) => `кадры ${frames} · pose B ${poseB ? 1 : 0} · медальон ${medallion ? 1 : 0} · всего ${total}`,
      };
