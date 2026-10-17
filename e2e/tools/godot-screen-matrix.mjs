// Compare real web UI with an isolated release export made by export-godot-parity.mjs.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: {
  chrome: { type: 'string' }, web: { type: 'string' }, godot: { type: 'string' },
  output: { type: 'string' }, states: { type: 'string', default: 'menu,vn,settings,campaign' },
  locale: { type: 'string' }, viewport: { type: 'string' },
  'enforce-menu': { type: 'boolean', default: false },
} });
if (!values.web || !values.godot || !values.output) throw new Error('--web, --godot and --output are required');
const output=resolve(values.output);
await mkdir(output,{recursive:true});
const sizes=values.viewport ? [values.viewport.split('x').map(Number)] : [[320,568],[390,844],[480,854]];
const locales=values.locale ? [values.locale] : ['ru','be','en'];
const browser=await chromium.launch({headless:true,...(values.chrome?{executablePath:values.chrome}:{})});
const results=[];
let expectedSourceHash=null;
const webSelectors=['.phone','.menu-content','.eyebrow','.menu-content h1','.tagline','.hero-medallions','.hero-medallions img','#new','#continue','#match3-campaign','#settings','.menu-content footer','.app-header','.vn-case-pill','.stage','.dialogue','.dialogue-text','.vn-controls','.settings-panel','.language-row','.match3-campaign-screen','.campaign-progress','.campaign-level-card'];
try {
  for(const locale of locales) for(const [width,height] of sizes) {
    const context=await browser.newContext({viewport:{width,height},locale:{ru:'ru-RU',be:'be-BY',en:'en-US'}[locale],deviceScaleFactor:1,reducedMotion:'reduce'});
    // These are fresh disposable contexts, never the player's browser profile.
    await context.addInitScript(locale=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('seiran-detectives-locale-v1',locale);},locale);
    const web=await context.newPage(), godot=await context.newPage();
    const errors=[];
    for(const [name,page] of [['web',web],['godot',godot]]) {
      page.on('pageerror',e=>errors.push({page:name,text:e.message}));
      page.on('console',m=>{if(m.type()==='error') errors.push({page:name,text:m.text(),url:m.location().url});});
      page.on('response',r=>{if(r.status()>=400) errors.push({page:name,text:`HTTP ${r.status()}`,url:r.url()});});
    }
    await godot.goto(`${values.godot.replace(/\/$/,'')}/?locale=${locale}`);
    await godot.waitForFunction(()=>window.updsParityResult?.id==='ready',null,{timeout:30000});
    async function call(action) {
      const id=`${Date.now()}-${Math.random()}`;
      await godot.evaluate(request=>window.updsParityCall(JSON.stringify(request)),{...action,id});
      await godot.waitForFunction(id=>window.updsParityResult?.id===id,id,{timeout:10000});
      return godot.evaluate(()=>window.updsParityResult);
    }
    for(const state of values.states.split(',')) {
      await call({action:'reset'});
      await web.goto(values.web);
      await web.locator('.menu-screen').waitFor();
      if(state==='vn') {
        await web.locator('#new').click();
        await web.locator('.vn-screen').waitFor();
        await call({action:'new_game'});
      } else if(state==='settings') {
        await web.locator('#settings').click();
        await web.locator('.settings-panel').waitFor();
        await call({action:'settings'});
      } else if(state==='campaign') {
        await web.locator('#match3-campaign').click();
        await web.locator('.match3-campaign-screen').waitFor();
        await call({action:'campaign'});
      } else if(state!=='menu') throw new Error(`Unsupported screen state ${state}`);
      await web.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
      const native=await call({action:'snapshot'});
      if(!native.build?.sourceHash) throw new Error('Capture export has no source digest; regenerate it with export-godot-parity.mjs');
      expectedSourceHash??=native.build.sourceHash;
      if(expectedSourceHash!==native.build.sourceHash) throw new Error('Capture export changed during the matrix; regenerate a consistent set');
      const reference=await web.evaluate(selectors=>selectors.flatMap(selector=>[...document.querySelectorAll(selector)].filter(n=>n.getClientRects().length).map(n=>{const r=n.getBoundingClientRect(),c=getComputedStyle(n);return {selector,text:n.textContent,rect:[r.x,r.y,r.width,r.height],font:c.fontFamily,fontSize:c.fontSize,lineHeight:c.lineHeight,fontWeight:c.fontWeight,margin:c.margin,color:c.color};})),webSelectors);
      const id=`${locale}-${width}x${height}-${state}`;
      const contractErrors=[];
      if(state==='menu') {
        if(native.controls.find(r=>r.path==='.')?.oversampling!==2) contractErrors.push('Web phone frame must preserve font raster density when canceling viewport stretch');
        const pairs=[['.phone','.'],['#new','Content/Actions/NewGame'],['#continue','Content/Actions/Continue'],['#match3-campaign','Content/Actions/Campaign'],['#settings','Content/Actions/Settings']];
        for(const [selector,path] of pairs) {
          const a=reference.find(r=>r.selector===selector),b=native.controls.find(r=>r.path===path);
          if(!a||!b){contractErrors.push(`Missing ${selector} / ${path}`);continue;}
          a.rect.forEach((v,i)=>{if(Math.abs(v-b.rect[i])>1.0)contractErrors.push(`${path} rect[${i}]: ${b.rect[i]} vs source ${v}`);});
        }
        for(const [selector,path] of [['.tagline','Content/Tagline'],['.hero-medallions','Content/Hero/Miku'],['.menu-content h1','Content/TitleFrame']]) {
          const a=reference.find(r=>r.selector===selector),b=native.controls.find(r=>r.path===path);
          if(!a||!b){contractErrors.push(`Missing ${selector} / ${path}`);continue;}
          for(const i of [1,3])if(Math.abs(a.rect[i]-b.rect[i])>1.0)contractErrors.push(`${path} rect[${i}]: ${b.rect[i]} vs source ${a.rect[i]}`);
        }
      }
      const webPng=await web.screenshot({path:join(output,`${id}-web.png`)});
      const nativePng=await godot.screenshot({path:join(output,`${id}-godot.png`)});
      let pixelMetrics=null;
      if(state==='menu') {
        pixelMetrics=await web.evaluate(async({a,b,width,height,hero,circles})=>{
          async function pixels(base64){const image=new Image();image.src=`data:image/png;base64,${base64}`;await image.decode();const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);return ctx.getImageData(0,0,width,height).data;}
          const x=await pixels(a),y=await pixels(b);let error=0,count=0,shadowError=0,shadowCount=0;
          const [left,top,w,h]=hero;
          for(let py=Math.max(0,Math.floor(top-25));py<Math.min(height,Math.ceil(top+h+30));py++)for(let px=Math.max(0,Math.floor(left-25));px<Math.min(width,Math.ceil(left+w+25));px++){
            // Keep text above the medallions out of the shadow-only sample.
            const outside=py>=top&&circles.every(([cx,cy,cw,ch])=>Math.hypot(px+.5-cx-cw/2,py+.5-cy-ch/2)>cw/2+1);
            for(let c=0;c<3;c++){const e=Math.abs(x[(py*width+px)*4+c]-y[(py*width+px)*4+c]);error+=e;if(outside)shadowError+=e;}
            count++;if(outside)shadowCount++;
          }
          return{heroMeanRgbError:error/(count*3),outsideDisksMeanRgbError:shadowError/(shadowCount*3),roiPixels:count};
        },{a:webPng.toString('base64'),b:nativePng.toString('base64'),width,height,hero:reference.find(r=>r.selector==='.hero-medallions').rect,circles:reference.filter(r=>r.selector==='.hero-medallions img').map(r=>r.rect)});
      }
      await writeFile(join(output,`${id}.json`),JSON.stringify({id,native,web:reference,pixelMetrics,contractErrors,errors:[...errors]},null,2));
      results.push({id,pixelMetrics,contractErrors,errors:[...errors]});
      console.log(`Captured ${id}: ${errors.length} errors`);
    }
    await context.close();
  }
} finally {await browser.close();}
await writeFile(join(output,'index.html'),`<style>body{background:#152337;color:white;font:14px sans-serif}section{display:inline-block;vertical-align:top;margin:10px}img{width:195px;vertical-align:top}a{color:white}</style>${results.map(r=>`<section><h3><a href="${r.id}.json">${r.id}</a></h3><small>Web / Godot</small><br><img src="${r.id}-web.png"><img src="${r.id}-godot.png"></section>`).join('')}`);
await writeFile(join(output,'summary.json'),JSON.stringify({generatedAt:new Date().toISOString(),cases:results},null,2));
if(results.some(r=>r.errors.length)) throw new Error('Screen captures contain runtime/console errors; inspect per-case JSON');
if(values['enforce-menu']&&results.some(r=>r.contractErrors.length)) throw new Error('Source menu geometry contracts failed; inspect per-case JSON');
