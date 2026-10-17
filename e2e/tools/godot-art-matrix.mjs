// Isolated production CSS / Godot art audit. No player saves or golden updates.
// node e2e/tools/godot-art-matrix.mjs --godot <console.exe> --chrome <chrome.exe> --output <directory>
import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: {
  godot: { type: 'string' }, chrome: { type: 'string' }, output: { type: 'string' },
  'enforce-contracts': { type: 'boolean', default: false },
  kind: { type: 'string' },
} });
if (!values.godot || !values.output) throw new Error('--godot and --output are required');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const output = resolve(values.output);
if (output === root || output === join(root, 'public') || output === join(root, 'godot')) {
  throw new Error('Use a dedicated capture directory');
}
await mkdir(join(output, 'native'), { recursive: true });
await mkdir(join(output, 'web'), { recursive: true });
const bundle = JSON.parse(await readFile(join(root, 'godot/data/campaign_match3_levels.json'), 'utf8'));
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(join(directory, e.name)) : join(directory, e.name)))).flat();
}
const cases = [];
const add = (kind, key, asset, extra = {}) => cases.push({ id: `${String(cases.length).padStart(3, '0')}-${kind}-${key}`.replaceAll('/', '-'), kind, key, asset, ...extra });
for (const path of (await walk(join(root, 'godot/assets/characters'))).sort()) {
  const relative = path.slice(join(root, 'godot').length + 1).replaceAll('\\', '/');
  if (relative.endsWith('.png') && /\/(frames|poses)\//.test(relative)) add('portrait', relative.slice(18, -4), relative);
}
for (const [key, asset] of Object.entries(bundle.assets.tiles)) add('tile', key, asset);
for (const [key, asset] of Object.entries(bundle.assets.specials)) add('special', key, asset);
// Include every ingredient route even when the original intentionally reuses art.
for (const [key, asset] of Object.entries(bundle.assets.ingredients)) add('ingredient', key, asset);
for (const [key, asset] of Object.entries(bundle.assets.blockers)) {
  for (const layers of [1, 2]) add('blocker', key, key === 'locked' ? bundle.assets.lockedBlockers[layers] : asset, { id: `${String(cases.length).padStart(3, '0')}-blocker-${key}-${layers}`, layers });
}
if (values.kind) {
  for(let index=cases.length-1;index>=0;index--) if(cases[index].kind!==values.kind) cases.splice(index,1);
  if(!cases.length) throw new Error(`No cases for kind ${values.kind}`);
}
const manifestPath = join(output, 'manifest.json');
await writeFile(manifestPath, JSON.stringify({ cases }, null, 2));
const native = spawnSync(values.godot, ['--path', join(root, 'godot'), '--rendering-method', 'gl_compatibility', '--script', 'res://tests/art_matrix_render.gd', '--quit-after', '2400'], {
  env: { ...process.env, UPDS_ART_MATRIX: manifestPath, UPDS_ART_OUTPUT: join(output, 'native') },
  encoding: 'utf8', windowsHide: true, timeout: 120000,
});
await writeFile(join(output, 'native.log'), `${native.stdout}\n${native.stderr}`);
if (native.error || native.status !== 0 || /SCRIPT ERROR:|ERROR:/.test(native.stderr) || !native.stdout.includes(`UPDS art matrix rendered: ${cases.length}`)) {
  throw new Error(`Godot capture failed: ${native.error ?? native.stderr}`);
}
const geometry = JSON.parse(await readFile(join(output, 'native/geometry.json'), 'utf8'));
const cssFiles = ['style', 'buildIdentity', 'viewport', 'vnViewportStability', 'match3Production', 'match3Help', 'match3StoryObjectGuidance', 'match3SpecialImpact', 'match3BlockerReadability', 'match3UiA', 'standaloneEdgeToEdge'];
const css = (await Promise.all(cssFiles.map(name => readFile(join(root, `src/${name}.css`), 'utf8')))).join('\n');
const browser = await chromium.launch({ headless: true, ...(values.chrome ? { executablePath: values.chrome } : {}) });
const page = await browser.newPage({ viewport: { width: 384, height: 480 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const results = [];
try {
  for (const [index, sample] of cases.entries()) {
    const asset = await readFile(join(root, 'public', sample.asset.replace(/^\.\//, '')));
    const nativeAsset = await readFile(join(root, 'godot', sample.asset.replace(/^\.\//, '')));
    if (!asset.equals(nativeAsset)) throw new Error(`Source asset mismatch: ${sample.asset}`);
    // Keep the filename in the URL: production CSS has [src*=...] blocker rules.
    const data = `data:image/png;base64,${asset.toString('base64')}#${sample.asset.split('/').at(-1)}`;
    const g = geometry[index];
    const [x, y, w, h] = g.cell;
    let content;
    if (sample.kind === 'portrait') content = `<div class="portrait" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;bottom:auto;transform:none"><img id="art" class="portrait-static" src="${data}"></div>`;
    else {
      const image = `<img id="art" src="${data}" class="${sample.kind === 'blocker' ? '' : sample.kind + (sample.kind === 'special' ? ` ${sample.key}` : '')}" ${sample.kind === 'tile' ? `data-tile-variant="tile:${sample.key}"` : ''}>`;
      const inner = sample.kind === 'blocker' ? `<div class="blocker" data-style="${sample.key}" data-layers="${sample.layers}">${image}</div>` : `<div class="tile-stack">${image}</div>`;
      content = `<div class="m3-ui-a"><div class="board-cell" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:transparent;border-color:transparent;box-shadow:none;transform:none;min-height:0">${inner}</div></div>`;
    }
    await page.setContent(`<style>${css}\nhtml,body{margin:0!important;width:384px!important;height:480px!important;background:#223b58!important;overflow:hidden!important}*,*::before,*::after{animation:none!important;transition:none!important}</style>${content}`);
    await page.locator('#art').evaluate(async img => { await img.decode(); });
    const reference = await page.locator('#art').evaluate(img => {
      const style = getComputedStyle(img); const r = img.getBoundingClientRect();
      const transform = style.transform === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(style.transform);
      const scaleX = Math.hypot(transform.a, transform.b), scaleY = Math.hypot(transform.c, transform.d);
      const left=parseFloat(style.paddingLeft)*scaleX, top=parseFloat(style.paddingTop)*scaleY;
      const right=parseFloat(style.paddingRight)*scaleX, bottom=parseFloat(style.paddingBottom)*scaleY;
      // CSS's border box includes padding; TextureRect bounds describe its content.
      return { rect: [r.x, r.y, r.width, r.height], contentRect: [r.x+left,r.y+top,r.width-left-right,r.height-top-bottom], filter: style.filter, parentFilter: getComputedStyle(img.parentElement).filter, transform: style.transform, padding: style.padding, opacity: style.opacity };
    });
    const webPng = await page.screenshot({ path: join(output, 'web', `${sample.id}.png`) });
    const nativePng = await readFile(join(output, 'native', `${sample.id}.png`));
    const metrics = await page.evaluate(async ({ web, native, roi }) => {
      async function pixels(data) { const img = new Image(); img.src = `data:image/png;base64,${data}`; await img.decode(); const c = document.createElement('canvas'); c.width=384; c.height=480; const ctx=c.getContext('2d'); ctx.drawImage(img,0,0); return ctx.getImageData(0,0,384,480).data; }
      const a=await pixels(web), b=await pixels(native); let error=0, changed=0, count=0;
      const [x,y,w,h]=roi;
      for(let py=Math.max(0,Math.floor(y-32));py<Math.min(480,Math.ceil(y+h+32));py++) for(let px=Math.max(0,Math.floor(x-32));px<Math.min(384,Math.ceil(x+w+32));px++) {
        const i=(py*384+px)*4; let peak=0;
        for(let c=0;c<3;c++){const e=Math.abs(a[i+c]-b[i+c]);error+=e;peak=Math.max(peak,e);}
        if(peak>12) changed++; count++;
      }
      return { meanAbsoluteRgbError: error/(count*3), fractionAbove12: changed/count, roiPixels: count };
    }, { web: webPng.toString('base64'), native: nativePng.toString('base64'), roi: g.cell });
    const contractErrors = [];
    reference.contentRect.forEach((v,i)=>{ if (Math.abs(v-g.rect[i])>0.08) contractErrors.push(`contentRect[${i}]: web ${v}, Godot ${g.rect[i]}`); });
    for(const parameter of ['brightness','saturation']) {
      const cssName=parameter==='saturation'?'saturate':parameter;
      const value=Number(reference.filter.match(new RegExp(`${cssName}\\(([\\d.]+)\\)`))?.[1]??1);
      if(Math.abs(value-(g[parameter]??1))>0.001) contractErrors.push(`${parameter}: web ${value}, Godot ${g[parameter]}`);
    }
    if (Math.abs(Number(reference.opacity)-g.opacity)>0.001) contractErrors.push(`opacity: web ${reference.opacity}, Godot ${g.opacity}`);
    results.push({ ...sample, assetSha256: createHash('sha256').update(asset).digest('hex'), native: g, web: reference, contractErrors, ...metrics });
  }
} finally { await browser.close(); }
const productionPaths = ['godot/scripts/art_rendering.gd', 'godot/scripts/vn_screen.gd', 'godot/scripts/match3_screen.gd', 'godot/shaders/match3_drop_shadow.gdshader', ...cssFiles.map(n=>`src/${n}.css`), ...new Set(cases.map(c=>`godot/${c.asset.replace(/^\.\//,'')}.import`))];
const productionHash = createHash('sha256');
for (const path of productionPaths) productionHash.update(path).update(await readFile(join(root,path)));
const report = { generatedAt: new Date().toISOString(), renderer: 'Godot Compatibility / Chromium CSS', browserVersion: browser.version(), nativeRenderer: native.stdout.split('\n').find(s=>s.includes('OpenGL API'))?.trim(), productionSha256: productionHash.digest('hex'), fixture: 'isolated frozen art; not full-screen acceptance', cases: results };
await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
await writeFile(join(output, 'index.html'), `<style>body{background:#152337;color:white;font:14px sans-serif}section{display:inline-block;width:49%;vertical-align:top}img{width:48%}small{display:block}</style>${results.map(r => `<section><h3>${r.id}</h3><small>Web / Godot; MAE ${r.meanAbsoluteRgbError.toFixed(3)}; pixels &gt;12: ${(r.fractionAbove12*100).toFixed(2)}%</small><img src="web/${r.id}.png"><img src="native/${r.id}.png"></section>`).join('')}`);
console.log(JSON.stringify({ output, cases: results.length, worst: [...results].sort((a,b)=>b.meanAbsoluteRgbError-a.meanAbsoluteRgbError).slice(0,10).map(r=>({ id:r.id, mae:r.meanAbsoluteRgbError, above12:r.fractionAbove12 })) }, null, 2));
const failures=results.filter(r=>r.contractErrors.length);
if(values['enforce-contracts'] && failures.length) throw new Error(`Art contracts failed: ${JSON.stringify(failures.map(r=>({id:r.id,errors:r.contractErrors})))}`);
