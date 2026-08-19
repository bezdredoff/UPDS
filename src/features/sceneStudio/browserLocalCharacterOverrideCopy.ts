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
  exportTitle: string;
  exportCopy: string;
  copyJson: string;
  downloadJson: string;
  editorEyebrow: string;
  editorTitle: string;
  editorCopy: string;
  character: string;
  expression: string;
  pose: string;
  poseA: string;
  poseB: string;
  editing: string;
  usesDefault: string;
  customOverride: string;
  dragHint: string;
  scale: string;
  frameX: string;
  frameY: string;
  copyDefaultToSlot: string;
  resetSlot: string;
  defaultsTitle: string;
  defaultsCopy: string;
  resetDefault: string;
  left: string;
  center: string;
  right: string;
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
      exportTitle: 'JSON-здымак v3',
      exportCopy: 'Экспарт захоўвае character defaults, slot-aware overrides і склад кожнага плана, каб перанесці прынятую кампазіцыю ў production без паўторнай каліброўкі.',
      copyJson: 'Скапіяваць JSON',
      downloadJson: 'Спампаваць JSON',
      editorEyebrow: 'COMPOSITION LAB',
      editorTitle: 'Рэдактар кампазіцыі',
      editorCopy: 'Выберыце склад кожнага слота, затым рухайце персанажа проста ў preview або дакладна наладзьце Scale/X/Y.',
      character: 'Персанаж',
      expression: 'Эмоцыя',
      pose: 'Поза',
      poseA: 'Pose A',
      poseB: 'Pose B',
      editing: 'Рэдагуецца',
      usesDefault: 'Базавыя налады персанажа',
      customOverride: 'Наладжана для гэтага месца',
      dragHint: 'Пацягніце выбранага персанажа ў preview для X/Y. Клік або drag па іншым персанажы выбірае яго слот.',
      scale: 'Scale',
      frameX: 'X',
      frameY: 'Y',
      copyDefaultToSlot: 'Скопировать базовые',
      resetSlot: 'Скінуць наладу',
      defaultsTitle: 'Базовые настройки персонажей',
      defaultsCopy: 'Базавыя Scale/X/Y выкарыстоўваюцца ва ўсіх планах, пакуль для канкрэтнага персанажа ў гэтым месцы кадра няма асобнай налады.',
      resetDefault: 'Скінуць базавыя',
      left: 'LEFT',
      center: 'CENTER',
      right: 'RIGHT',
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
        exportTitle: 'JSON snapshot v3',
        exportCopy: 'The export stores character defaults, slot-aware overrides and every plan assignment so the accepted composition can move into production without recalibration.',
        copyJson: 'Copy JSON',
        downloadJson: 'Download JSON',
        editorEyebrow: 'COMPOSITION LAB',
        editorTitle: 'Composition editor',
        editorCopy: 'Choose the actor in each slot, then drag the character directly in the preview or tune Scale/X/Y precisely.',
        character: 'Character',
        expression: 'Expression',
        pose: 'Pose',
        poseA: 'Pose A',
        poseB: 'Pose B',
        editing: 'Editing',
        usesDefault: 'Uses character default',
        customOverride: 'Custom slot override',
        dragHint: 'Drag the selected character in the preview for X/Y. Clicking or dragging another character selects that slot.',
        scale: 'Scale',
        frameX: 'X',
        frameY: 'Y',
        copyDefaultToSlot: 'Скопировать базовые',
        resetSlot: 'Reset slot',
        defaultsTitle: 'Базовые настройки персонажей',
        defaultsCopy: 'Base Scale/X/Y apply across plans until a specific slot + character gets its own override.',
        resetDefault: 'Reset default',
        left: 'LEFT',
        center: 'CENTER',
        right: 'RIGHT',
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
        exportTitle: 'JSON-слепок v3',
        exportCopy: 'Экспорт сохраняет character defaults, slot-aware overrides и состав каждого плана, чтобы перенести принятую композицию в production без повторной калибровки.',
        copyJson: 'Скопировать JSON',
        downloadJson: 'Скачать JSON',
        editorEyebrow: 'COMPOSITION LAB',
        editorTitle: 'Редактор композиции',
        editorCopy: 'Выберите состав каждого слота, затем двигайте персонажа прямо в preview или точно настройте Scale/X/Y.',
        character: 'Персонаж',
        expression: 'Эмоция',
        pose: 'Поза',
        poseA: 'Pose A',
        poseB: 'Pose B',
        editing: 'Редактируется',
        usesDefault: 'Базовые настройки персонажа',
        customOverride: 'Настроено для этого места',
        dragHint: 'Тяните выбранного персонажа прямо в preview для X/Y. Клик или drag по другому персонажу выбирает его слот.',
        scale: 'Scale',
        frameX: 'X',
        frameY: 'Y',
        copyDefaultToSlot: 'Скопировать базовые',
        resetSlot: 'Сбросить настройку',
        defaultsTitle: 'Базовые настройки персонажей',
        defaultsCopy: 'Базовые Scale/X/Y используются во всех планах, пока для конкретного персонажа в этом месте кадра нет отдельной настройки.',
        resetDefault: 'Сбросить базовые',
        left: 'LEFT',
        center: 'CENTER',
        right: 'RIGHT',
        loading: (file) => `Загрузка ${file}…`,
        loaded: (file, count) => `Загружено ${count} локальных override-ассетов из ${file}.`,
        failed: (error) => `Не удалось загрузить локальные подмены: ${error}`,
        summary: (frames, poseB, medallion, total) => `кадры ${frames} · pose B ${poseB ? 1 : 0} · медальон ${medallion ? 1 : 0} · всего ${total}`,
      };
