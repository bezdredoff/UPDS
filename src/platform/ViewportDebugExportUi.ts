import type { ExportMode } from './ViewportDebugExport';

const errorText = (error: unknown): string => error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ''}` : String(error);
const sizeText = (bytes: number): string => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

/** Lives entirely inside the diagnostic shadow overlay. Clipboard/share get a fresh gesture. */
export function mountViewportDebugExport(container: HTMLElement, generate: (mode: ExportMode) => { json: string; bytes: number }): void {
  container.innerHTML = `<button id="prepare">Prepare JSON</button><button id="full">Full export</button>
    <p id="status" role="status" aria-live="polite"></p>
    <div id="methods" hidden><button id="share" hidden>Share JSON</button><button id="copy">Copy JSON</button><button id="show-json">Show JSON</button><button id="download">Download JSON</button></div>
    <div id="manual" hidden><button id="select-all">Select All</button><textarea aria-label="Debug JSON" readonly spellcheck="false"></textarea></div>`;
  const find = <T extends HTMLElement>(id: string) => container.querySelector<T>(`#${id}`)!;
  const status = find('status');
  const prepare = find<HTMLButtonElement>('prepare');
  const full = find<HTMLButtonElement>('full');
  const methods = find('methods');
  const share = find<HTMLButtonElement>('share');
  const copy = find<HTMLButtonElement>('copy');
  const manual = find('manual');
  const area = container.querySelector('textarea')!;
  let payload: { json: string; bytes: number; name: string; file?: File; url?: string } | undefined;
  let generation = 0;
  const show = () => { if (payload) { manual.hidden = false; area.value = payload.json; } };
  const prepareJSON = async (mode: ExportMode) => {
    generation++;
    status.textContent = 'Preparing JSON…';
    container.setAttribute('aria-busy', 'true');
    for (const button of container.querySelectorAll('button')) button.disabled = true;
    // One RAF callback runs before paint; the second allows the first frame to paint.
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    try {
      const result = generate(mode);
      const name = `upds-viewport-debug-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      if (payload?.url) URL.revokeObjectURL(payload.url);
      payload = { ...result, name };
      methods.hidden = false;
      share.hidden = true;
      try {
        payload.file = new File([result.json], name, { type: 'application/json' });
        share.hidden = !(typeof navigator.share === 'function' && navigator.canShare?.({ files: [payload.file] }));
      } catch { /* File/share support must never block Copy + Show. */ }
      if (!manual.hidden) area.value = result.json;
      status.textContent = `Ready · ${sizeText(result.bytes)}`;
    } catch (error) {
      status.textContent = `Export failed: ${errorText(error)}`;
    } finally {
      container.setAttribute('aria-busy', 'false');
      for (const button of container.querySelectorAll('button')) button.disabled = false;
    }
  };
  prepare.onclick = () => { void prepareJSON('compact'); };
  full.onclick = () => { void prepareJSON('full'); };
  find('show-json').onclick = show;
  find('select-all').onclick = () => { area.focus(); area.select(); area.setSelectionRange(0, area.value.length); };
  copy.onclick = () => {
    if (!payload) return;
    const attempt = generation;
    copy.disabled = true;
    status.textContent = 'Copying…';
    // Some clipboard implementations can leave the permission promise pending.
    const timeout = window.setTimeout(() => finish(new Error('Clipboard did not respond within 8 seconds')), 8000);
    let finished = false;
    const finish = (error?: unknown) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      if (attempt !== generation) return;
      copy.disabled = false;
      status.textContent = error === undefined ? 'Copied' : `Clipboard failed: ${errorText(error)}`;
      if (error !== undefined) show();
    };
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      void navigator.clipboard.writeText(payload.json).then(() => finish(), (error: unknown) => finish(error));
    } catch (error) { finish(error); }
  };
  share.onclick = () => {
    if (!payload?.file) return;
    const attempt = generation;
    status.textContent = 'Share opened';
    try {
      void navigator.share({ files: [payload.file] }).catch((error: unknown) => {
        if (attempt === generation) { status.textContent = `Share failed: ${errorText(error)}`; show(); }
      });
    } catch (error) { status.textContent = `Share failed: ${errorText(error)}`; show(); }
  };
  find('download').onclick = () => {
    if (!payload) return;
    try {
      const link = document.createElement('a');
      payload.url ??= URL.createObjectURL(payload.file ?? new Blob([payload.json], { type: 'application/json' }));
      link.href = payload.url; link.download = payload.name;
      container.append(link); link.click(); link.remove();
      status.textContent = 'Download requested · use Share or Show JSON if no file appears';
    } catch (error) { status.textContent = `Download failed: ${errorText(error)}`; show(); }
  };
}
