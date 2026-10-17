// Production AudioManager is the oracle; no physical vibration is triggered.
import { chromium } from '@playwright/test';
import { parseArgs } from 'node:util';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const require=createRequire(join(root,'package.json'));
const bundle=require('esbuild').buildSync({stdin:{contents:"export {AudioManager} from './src/audio/AudioManager'; export {audioCueNames} from './src/audio/AudioCues';",resolveDir:root},bundle:true,platform:'node',format:'cjs',write:false});
const runtime={exports:{}};runInNewContext(bundle.outputFiles[0].text,{module:runtime,exports:runtime.exports});
const {AudioManager,audioCueNames}=runtime.exports;
function oracle(mode,enabled) {
  const calls=[],navigator=mode==='absent'?{}:{vibrate:p=>{calls.push(p);if(mode==='throws')throw new Error('Optional API rejected');return true;}};
  const audio=new AudioManager({getItem:()=>null,setItem:()=>{}},{record:()=>{}},{},navigator);
  audio.updateSettings({muted:true,musicVolume:0,effectsVolume:0,hapticsEnabled:enabled});
  for(const cue of audioCueNames)audio.play(cue);
  return{supported:audio.hapticsSupported,calls};
}
const {values}=parseArgs({options:{chrome:{type:'string'},web:{type:'string'},godot:{type:'string'},output:{type:'string'}}});
if(!values.web||!values.godot||!values.output)throw new Error('--web, --godot and --output are required');
const output=resolve(values.output);await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(values.chrome?{executablePath:values.chrome}:{})});
const records=[],errors=[];let sourceHash=null;
try {
  for(const locale of ['ru','be','en'])for(const mode of ['supported','absent','throws']) {
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await context.addInitScript(({locale,mode})=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('seiran-detectives-locale-v1',locale);window.__vibrations=[];Object.defineProperty(navigator,'vibrate',{configurable:true,value:mode==='absent'?undefined:p=>{window.__vibrations.push(p);if(mode==='throws')throw new Error('Optional API rejected');return true;}});},{locale,mode});
    const web=await context.newPage(),native=await context.newPage();
    for(const [name,page]of[['web',web],['godot',native]]) {
      page.on('pageerror',e=>errors.push(`${locale}/${mode} ${name}: ${e.message}`));
      page.on('console',m=>{if(m.type()==='error')errors.push(`${locale}/${mode} ${name}: ${m.text()}`);});
      page.on('response',r=>{if(r.status()>=400)errors.push(`${locale}/${mode} ${name}: HTTP ${r.status()} ${r.url()}`);});
    }
    await web.goto(values.web);await web.locator('#settings').click();
    await native.goto(`${values.godot.replace(/\/$/,'')}/?locale=${locale}`);await native.waitForFunction(()=>window.updsParityResult?.id==='ready');
    async function call(request) {const id=String(Math.random());await native.evaluate(r=>window.updsParityCall(JSON.stringify(r)),{...request,id});await native.waitForFunction(id=>window.updsParityResult?.id===id,id);return native.evaluate(()=>window.updsParityResult);}
    let state=await call({action:'settings'});sourceHash??=state.build?.sourceHash;
    if(!sourceHash||sourceHash!==state.build.sourceHash)throw new Error('Missing/mixed source digest');
    const sourceHelp=await web.locator('[data-toggle-haptics] small').textContent(),nativeHelp=state.controls.find(c=>c.path.endsWith('/HapticsCapability')).text;
    if(sourceHelp!==nativeHelp)throw new Error(`${locale}/${mode}: haptics help differs`);
    const phases=[];
    await native.bringToFront();
    await native.locator('canvas').click({position:{x:5,y:5}});
    for(const enabled of [true,false,true]) {
      await call({action:'audio_settings',patch:{muted:true,musicVolume:0,effectsVolume:0,hapticsEnabled:enabled}});
      await native.evaluate(()=>window.__vibrations=[]);
      for(const cue of audioCueNames)state=await call({action:'audio_cue',cue});
      const actual=await native.evaluate(()=>window.__vibrations),expected=oracle(mode,enabled);
      if(state.hapticsSupported!==expected.supported||JSON.stringify(actual)!==JSON.stringify(expected.calls))throw new Error(`${locale}/${mode}/${enabled}: ${JSON.stringify(actual)} vs ${JSON.stringify(expected.calls)}`);
      phases.push({enabled,supported:state.hapticsSupported,calls:actual});
    }
    records.push({locale,mode,sourceHelp,nativeHelp,phases,build:state.build});console.log(`${locale}/${mode}: ${audioCueNames.length*3} cue comparisons passed`);await context.close();
  }
} finally {await browser.close();}
await writeFile(join(output,'report.json'),JSON.stringify({sourceHash,cues:audioCueNames,records,errors},null,2));
if(errors.length)throw new Error('Haptics matrix contains runtime/HTTP errors');
