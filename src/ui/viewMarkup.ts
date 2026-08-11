export const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

export const iconMarkup = (name: string, alt = ''): string => `<img src="./assets/ui/icon_${name}.svg" alt="${escapeHtml(alt)}">`;

export const headerActionMarkup = (
  id: string,
  iconName: string,
  label: string,
  badge?: number,
  extraClass = '',
): string => `<button id="${escapeHtml(id)}" class="app-header-action${extraClass ? ` ${escapeHtml(extraClass)}` : ''}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${iconMarkup(iconName)}${badge === undefined ? '' : `<i>${badge}</i>`}<span class="visually-hidden">${escapeHtml(label)}</span></button>`;

export const panelHeaderMarkup = (
  eyebrow: string,
  title: string,
  options: Readonly<{ settings?: boolean; backLabel?: string; navigationLabel?: string; settingsLabel?: string }> = { settings: true },
): string => {
  const backLabel = options.backLabel ?? 'Назад';
  const navigationLabel = options.navigationLabel ?? 'Навигация';
  const settingsLabel = options.settingsLabel ?? 'Настройки';
  return `<header class="panel-nav app-header">
  ${headerActionMarkup('back', 'back', backLabel, undefined, 'app-header-back')}
  <div class="app-header-title"><small>${escapeHtml(eyebrow)}</small><b>${escapeHtml(title)}</b></div>
  <nav class="app-header-actions" aria-label="${escapeHtml(navigationLabel)}">
    ${options.settings ? headerActionMarkup('header-settings', 'settings', settingsLabel) : ''}
  </nav>
</header>`;
};
