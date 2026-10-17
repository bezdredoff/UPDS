// Compare real pointer/touch/keyboard settings gestures in disposable browsers.
import { chromium } from '@playwright/test';
import { parseArgs } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const {values}=parseArgs({options:{chrome:{type:'string'},web:{type:'string'},godot:{type:'string'},output:{type:'string'},locale:{type:'string'},viewport:{type:'string'},input:{type:'string',default:'both'}}});
if(!values.web||!values.godot||!values.output)throw new Error('--web, --godot and --output are required');
const output=resolve(values.output);await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(values.chrome?{executablePath:values.chrome}:{})});
const records=[],errors=[];let sourceHash=null;
try {
  for(const locale of values.locale?[values.locale]:['ru','be','en'])for(const [width,height] of values.viewport?[values.viewport.split('x').map(Number)]:[[320,568],[390,844],[480,854]])for(const input of values.input==='both'?['mouse','touch']:[values.input]) {
    const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',deviceScaleFactor:1,hasTouch:input==='touch',isMobile:input==='touch'});
    await context.addInitScript(locale=>{if(!sessionStorage.getItem('upds-input-initialized')){localStorage.clear();sessionStorage.clear();localStorage.setItem('seiran-detectives-locale-v1',locale);sessionStorage.setItem('upds-input-initialized','1');}},locale);
    const web=await context.newPage(),native=await context.newPage();const id=`${locale}-${width}x${height}-${input}`;
    for(const [name,page]of[['web',web],['godot',native]]) {
      page.on('pageerror',e=>errors.push(`${id} ${name}: ${e.message}`));
      page.on('console',m=>{if(m.type()==='error')errors.push(`${id} ${name}: ${m.text()}`);});
      page.on('response',r=>{if(r.status()>=400)errors.push(`${id} ${name}: HTTP ${r.status()} ${r.url()}`);});
    }
    await web.goto(values.web);await web.locator('#settings').click();
    await native.goto(`${values.godot.replace(/\/$/,'')}/?locale=${locale}`);await native.waitForFunction(()=>window.updsParityResult?.id==='ready');
    async function call(action) {const token=String(Math.random());await native.evaluate(r=>window.updsParityCall(JSON.stringify(r)),{action,id:token});await native.waitForFunction(t=>window.updsParityResult?.id===t,token);return native.evaluate(()=>window.updsParityResult);}
    await call('settings');const steps=[];
    async function state(step,expectedMute,expectedHaptics) {
      const result=await call('snapshot');sourceHash??=result.build?.sourceHash;
      if(!sourceHash||result.build?.sourceHash!==sourceHash)throw new Error('Missing or mixed source digest');
      const source={muted:await web.locator('[data-toggle-mute]').getAttribute('aria-pressed')==='true',hapticsEnabled:await web.locator('[data-toggle-haptics]').getAttribute('aria-pressed')==='true'};
      const actual={muted:result.audio.muted,hapticsEnabled:result.audio.hapticsEnabled};
      const caption=result.controls.find(c=>c.path.endsWith('/muted'));
      const hapticsCaption=result.controls.find(c=>c.path.endsWith('/hapticsEnabled'));
      if(source.muted!==expectedMute||source.hapticsEnabled!==expectedHaptics||actual.muted!==expectedMute||actual.hapticsEnabled!==expectedHaptics||caption?.pressed!==actual.muted||hapticsCaption?.pressed!==actual.hapticsEnabled)throw new Error(`${id} ${step}: source ${JSON.stringify(source)}, native ${JSON.stringify(actual)}`);
      const sourceHelp=await web.locator('[data-toggle-haptics] small').textContent(),nativeHelp=result.controls.find(c=>c.path.endsWith('/HapticsCapability'))?.text;
      if(sourceHelp!==nativeHelp)throw new Error(`${id} haptics help differs: ${nativeHelp} vs ${sourceHelp}`);
      for(const [selector,path]of[['[data-toggle-mute] i','/MuteSwitch'],['[data-toggle-haptics] i','/HapticsSwitch']])if(await web.locator(selector).textContent()!==result.controls.find(c=>c.path.endsWith(path))?.text)throw new Error(`${id} toggle state caption differs from source`);
      if(step==='mute-edge'&&input==='mouse') {
        await web.locator('[data-toggle-mute]').scrollIntoViewIfNeeded();const box=await web.locator('[data-toggle-mute]').boundingBox(),control=await card('MuteCard');
        await web.screenshot({path:join(output,`${id}-mute-on-web.png`),clip:box});
        await native.screenshot({path:join(output,`${id}-mute-on-godot.png`),clip:{x:control.rect[0],y:control.rect[1],width:control.rect[2],height:control.rect[3]}});
      }
      steps.push({step,source,native:actual});return result;
    }
    async function card(name) {
      for(let attempt=0;attempt<12;attempt++) {
        const result=await call('snapshot'),control=result.controls.find(c=>c.path.endsWith(`/${name}`)),clip=result.controls.find(c=>c.path==='SettingsScreen/Scroll').rect;
        if(control.rect[1]>=clip[1]&&control.rect[1]+control.rect[3]<=clip[1]+clip[3])return control;
        await native.mouse.move(clip[0]+clip[2]/2,clip[1]+clip[3]/2);await native.mouse.wheel(0,control.rect[1]<clip[1]?-250:250);await native.waitForTimeout(80);
      }
      throw new Error(`${id} ${name} could not be scrolled into view`);
    }
    async function clickEdge(selector,name) {
      await web.locator(selector).scrollIntoViewIfNeeded();const box=await web.locator(selector).boundingBox(),control=await card(name);
      if(input==='touch'){await web.touchscreen.tap(box.x+4,box.y+4);await native.touchscreen.tap(control.rect[0]+4,control.rect[1]+4);}
      else {await web.mouse.click(box.x+4,box.y+4);await native.mouse.click(control.rect[0]+4,control.rect[1]+4);}
    }
    await state('initial',false,true);
    await clickEdge('[data-toggle-mute]','MuteCard');await state('mute-edge',true,true);
    await web.locator('[data-toggle-mute]').focus();await web.keyboard.press('Space');await native.keyboard.press('Space');await state('keyboard-space',false,true);
    if(input==='mouse') {
      await web.locator('[data-toggle-mute]').scrollIntoViewIfNeeded();const box=await web.locator('[data-toggle-mute]').boundingBox(),control=await card('MuteCard');
      for(const [page,x,y]of[[web,box.x,box.y],[native,control.rect[0],control.rect[1]]]){await page.mouse.move(x+4,y+4);await page.mouse.down();await page.mouse.move(x-4,y-4);await page.mouse.up();}
      await state('drag-cancel',false,true);
    }
    await clickEdge('[data-toggle-haptics]','HapticsCard');await state('haptics-edge',false,false);
    await web.locator('[data-toggle-haptics] b').click();await card('HapticsCard');const snapshot=await call('snapshot'),caption=snapshot.controls.find(c=>c.path.endsWith('/hapticsEnabled')).rect;
    if(input==='touch')await native.touchscreen.tap(caption[0]+caption[2]/2,caption[1]+caption[3]/2);else await native.mouse.click(caption[0]+caption[2]/2,caption[1]+caption[3]/2);
    await state('caption-no-double-toggle',false,true);
    if(input==='touch'&&height<=600) {
      await web.locator('[data-toggle-mute]').scrollIntoViewIfNeeded();const box=await web.locator('[data-toggle-mute]').boundingBox(),control=await card('MuteCard');
      const sourceBefore=await web.locator('.settings-panel').evaluate(e=>e.scrollTop);
      async function swipe(page,x,y) {
        const session=await context.newCDPSession(page);
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:0}]});
        for(let i=1;i<=5;i++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*16,id:0}]});await page.waitForTimeout(25);}
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);await session.detach();
      }
      await swipe(web,box.x+4,box.y+4);await swipe(native,control.rect[0]+4,control.rect[1]+4);
      const result=await state('touch-scroll-cancel',false,true),sourceDelta=await web.locator('.settings-panel').evaluate(e=>e.scrollTop)-sourceBefore;
      const nativeDelta=control.rect[1]-result.controls.find(c=>c.path.endsWith('/MuteCard')).rect[1];
      if(sourceDelta<=0||nativeDelta<=0)throw new Error(`${id}: card blocked touch scrolling (${sourceDelta}/${nativeDelta})`);
      steps[steps.length-1].scroll={sourceDelta,nativeDelta};
    }
    await clickEdge('[data-toggle-mute]','MuteCard');await clickEdge('[data-toggle-haptics]','HapticsCard');await state('before-reload',true,false);
    await web.reload();await web.locator('#settings').click();await call('reset');await call('settings');const final=await state('reload',true,false);
    records.push({id,build:final.build,steps});console.log(`${id}: ${steps.length} input contracts passed`);await context.close();
  }
} finally {await browser.close();}
await writeFile(join(output,'report.json'),JSON.stringify({sourceHash,records,errors},null,2));
if(errors.length)throw new Error('Settings input run contains runtime/HTTP errors');
