const installedDocuments = new WeakSet<Document>();

const focusableSelector = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const stableFocusAttributes = [
  'data-auto-speed',
  'data-text-scale',
  'data-music-volume',
  'data-effects-volume',
  'data-toggle-mute',
  'data-toggle-haptics',
  'data-preview-music',
  'data-preview-effects',
] as const;

const stableModalFocusSelector = (element: HTMLElement): string | null => {
  if (element.id === 'close-overlay' || element.id === 'vn-main-menu') return `#${element.id}`;
  for (const attribute of stableFocusAttributes) {
    if (!element.hasAttribute(attribute)) continue;
    const value = element.getAttribute(attribute);
    return value ? `[${attribute}="${value}"]` : `[${attribute}]`;
  }
  return null;
};

const focusableElements = (overlay: HTMLElement): HTMLElement[] =>
  Array.from(overlay.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');

export function installVnModalFocusManagement(doc?: Document): void {
  const targetDocument = doc ?? (typeof document !== 'undefined' ? document : undefined);
  const Observer = targetDocument?.defaultView?.MutationObserver;
  if (!targetDocument || !Observer || installedDocuments.has(targetDocument)) return;
  installedDocuments.add(targetDocument);

  let activeOverlay: HTMLElement | null = null;
  let restoreSelector: '#history' | '#header-settings' | null = null;
  let lastModalFocusSelector: string | null = null;

  const releaseBackground = (): void => {
    targetDocument.querySelectorAll<HTMLElement>('[data-vn-modal-inert]').forEach((element) => {
      element.removeAttribute('inert');
      element.removeAttribute('data-vn-modal-inert');
    });
  };

  const isolateBackground = (overlay: HTMLElement): void => {
    const parent = overlay.parentElement;
    if (!parent) return;
    Array.from(parent.children).forEach((child) => {
      if (!(child instanceof HTMLElement) || child === overlay || child.hasAttribute('inert')) return;
      child.setAttribute('inert', '');
      child.setAttribute('data-vn-modal-inert', '');
    });
  };

  const focusOverlay = (overlay: HTMLElement): void => {
    const preferred = lastModalFocusSelector
      ? overlay.querySelector<HTMLElement>(lastModalFocusSelector)
      : null;
    const first = focusableElements(overlay)[0] ?? null;
    const target = preferred ?? overlay.querySelector<HTMLElement>('#close-overlay') ?? first;
    if (target) target.focus();
    else {
      overlay.tabIndex = -1;
      overlay.focus();
    }
  };

  const activateOverlay = (overlay: HTMLElement): void => {
    activeOverlay = overlay;
    isolateBackground(overlay);
    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        overlay.querySelector<HTMLButtonElement>('#close-overlay')?.click();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = focusableElements(overlay);
      if (focusables.length === 0) {
        event.preventDefault();
        overlay.tabIndex = -1;
        overlay.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = targetDocument.activeElement;
      if (event.shiftKey && (current === first || !overlay.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !overlay.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    });
    focusOverlay(overlay);
  };

  targetDocument.addEventListener('focusin', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.closest('.vn-overlay')) return;
    const selector = stableModalFocusSelector(target);
    if (selector) lastModalFocusSelector = selector;
  });

  targetDocument.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const opener = target.closest<HTMLElement>('#history, #header-settings');
    if (opener?.closest('.vn-screen')) {
      restoreSelector = opener.id === 'history' ? '#history' : '#header-settings';
      lastModalFocusSelector = null;
    }
    if (!target.closest('#close-overlay')) return;
    const selector = restoreSelector;
    queueMicrotask(() => {
      if (selector) targetDocument.querySelector<HTMLElement>(selector)?.focus();
      restoreSelector = null;
      lastModalFocusSelector = null;
    });
  }, true);

  const observer = new Observer(() => {
    const overlay = targetDocument.querySelector<HTMLElement>('.vn-overlay[role="dialog"][aria-modal="true"]');
    if (overlay && overlay !== activeOverlay) {
      activateOverlay(overlay);
      return;
    }
    if (!overlay && activeOverlay) {
      activeOverlay = null;
      releaseBackground();
    }
  });
  observer.observe(targetDocument.documentElement, { childList: true, subtree: true });
}
