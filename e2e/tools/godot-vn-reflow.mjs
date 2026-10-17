// Exercise a real source/Godot reading sequence across responsive viewport changes.
import { chromium } from '@playwright/test';
import { parseArgs } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const {values}=parseArgs({options:{chrome:{type:'string'},web:{type:'string'},godot:{type:'string'},output:{type:'string'}}});
if(!values.web||!values.godot||!values.output)throw new Error('--web, --godot and --output are required');
const output=resolve(values.output);await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(values.chrome?{executablePath:values.chrome}:{})});
const records=[],errors=[];let sourceHash=null;
try {
  for(const locale of ['ru','be','en']) {
    const context=await browser.newContext({viewport:{width:480,height:854},reducedMotion:'reduce',deviceScaleFactor:1});
    await context.addInitScript(locale=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('seiran-detectives-locale-v1',locale);},locale);
    const web=await context.newPage(),native=await context.newPage();
    for(const [name,page] of [['web',web],['godot',native]]) {
      page.on('pageerror',e=>errors.push(`${locale} ${name}: ${e.message}`));
      page.on('console',m=>{if(m.type()==='error')errors.push(`${locale} ${name}: ${m.text()}`);});
      page.on('response',r=>{if(r.status()>=400)errors.push(`${locale} ${name}: HTTP ${r.status()} ${r.url()}`);});
    }
    await web.goto(values.web);await web.locator('#new').click();await web.locator('.dialogue-text').waitFor();
    await native.goto(`${values.godot.replace(/\/$/,'')}/?locale=${locale}`);
    await native.waitForFunction(()=>window.updsParityResult?.id==='ready');
    async function call(action) {
      const id=String(Math.random());await native.evaluate(r=>window.updsParityCall(JSON.stringify(r)),{action,id});
      await native.waitForFunction(id=>window.updsParityResult?.id===id,id);
      return native.evaluate(()=>window.updsParityResult);
    }
    await call('new_game');
    async function settle() {
      // Background tabs may throttle RAF. Give each renderer its own active frames.
      await web.bringToFront();await web.waitForTimeout(250);
      await native.bringToFront();await native.waitForTimeout(250);
    }
    async function capture(step) {
      await settle();
      const source=await web.locator('.dialogue-text').evaluate(e=>({text:e.textContent,pages:Number(e.dataset.dialoguePages),pageIndex:Number(e.dataset.dialoguePage)-1,width:e.clientWidth,fontSize:getComputedStyle(e).fontSize,lineId:document.querySelector('.line-id')?.textContent.split(' · ')[0]}));
      const result=await call('snapshot');
      if(!result.build?.sourceHash)throw new Error('Capture export lacks a source digest');
      sourceHash??=result.build.sourceHash;
      if(sourceHash!==result.build.sourceHash)throw new Error('Capture export changed during reflow run');
      const contractErrors=[];
      if(source.pages!==result.dialogue.pages.length)contractErrors.push('Page count differs');
      if(source.pageIndex!==result.dialogue.pageIndex)contractErrors.push('Current page differs');
      if(source.lineId!=='VN0001'||result.scene!==0||result.line!==0)contractErrors.push('Reflow advanced the story');
      const record={id:`${locale}-${step}`,source,native:{...result.dialogue,build:result.build,window:result.window,scene:result.scene,line:result.line},contractErrors};
      records.push(record);
      await web.screenshot({path:join(output,`${record.id}-web.png`)});await native.screenshot({path:join(output,`${record.id}-godot.png`)});
      console.log(`${record.id}: ${source.pages}/${result.dialogue.pages.length} pages, index ${source.pageIndex}/${result.dialogue.pageIndex}`);
      return record;
    }
    await capture('wide');
    await web.locator('#next').click();await call('advance');await capture('wide-page-2');
    await web.setViewportSize({width:320,height:568});await native.setViewportSize({width:320,height:568});
    let narrow=await capture('narrow');
    if(narrow.source.pageIndex+1<narrow.source.pages) {
      await web.locator('#next').click();await call('advance');narrow=await capture('narrow-last');
    }
    await web.setViewportSize({width:480,height:854});await native.setViewportSize({width:480,height:854});
    await capture('restored');await context.close();
  }
} finally {await browser.close();}
await writeFile(join(output,'report.json'),JSON.stringify({sourceHash,records,errors},null,2));
if(errors.length||records.some(r=>r.contractErrors.length))throw new Error('VN reflow contracts failed; inspect report.json');
