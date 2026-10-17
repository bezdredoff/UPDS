// Compare actual main-cast rendering and production CSS/Godot idle timelines.
import {chromium} from '@playwright/test';
import {parseArgs} from 'node:util';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const {values}=parseArgs({options:{chrome:{type:'string'},web:{type:'string'},godot:{type:'string'},output:{type:'string'},locale:{type:'string'},viewport:{type:'string'},motion:{type:'boolean',default:false},'line-id':{type:'string'}}});
if(!values.web||!values.godot||!values.output)throw new Error('--web, --godot, --output required');
const all=[];
for(const file of await readdir(join(root,'godot/data'))){if(!file.endsWith('.json'))continue;const data=JSON.parse(await readFile(join(root,'godot/data',file),'utf8'));if(!data.sceneId)continue;const scene=data.sceneIndex??Number(data.sceneId.match(/^VN_SCENE_(\d+)/)?.[1]);for(const [choice,lines]of data.variants?Object.entries(data.variants):[['A',data.lines??[]]])for(const [line,entry]of lines.entries())for(const actor of entry.actors??[])if(actor.asset.startsWith('./assets/characters/'))all.push({scene,line,choice,id:entry.id,actor});}
all.sort((a,b)=>a.scene-b.scene||a.line-b.line||a.choice.localeCompare(b.choice));
const unique=new Map();for(const row of all){const key=[row.actor.asset,row.actor.x,row.actor.top,row.actor.z].join('|');if(!unique.has(key))unique.set(key,row);}
if(all.length!==767||unique.size!==78)throw new Error('Core portrait corpus changed; inspect canonical source');
let cases=[...unique.values()];
if(values.motion){const reps=new Map();for(const row of all)if(row.actor.asset.endsWith('/frame-neutral.png')&&!reps.has(row.actor.character))reps.set(row.actor.character,row);cases=[...reps.values(),all.find(row=>row.actor.asset.includes('/poses/'))].filter(Boolean);if(reps.size!==9)throw new Error('Missing neutral rig motion coverage');}
if(values['line-id'])cases=all.filter(row=>row.id===values['line-id']);
const output=resolve(values.output);await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(values.chrome?{executablePath:values.chrome}:{})});
const records=[],errors=[];let build;
try{
for(const locale of values.locale?[values.locale]:['ru','be','en'])for(const [width,height]of values.viewport?[values.viewport.split('x').map(Number)]:[[320,568],[390,844],[480,854]])for(const motion of values.motion?['no-preference','reduce']:['reduce']){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:motion});
 await context.addInitScript(locale=>{if(!sessionStorage.getItem('core-matrix')){localStorage.clear();sessionStorage.setItem('core-matrix','1');}localStorage.setItem('seiran-detectives-locale-v1',locale);},locale);
 const web=await context.newPage(),native=await context.newPage();
 for(const[name,page]of[['web',web],['godot',native]]){page.on('pageerror',e=>errors.push(`${locale}/${width}/${name}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${locale}/${width}/${name}: ${m.text()}`);});page.on('response',r=>{if(r.status()>=400)errors.push(`${name} HTTP ${r.status()} ${r.url()}`);});}
 await web.goto(values.web);await native.goto(`${values.godot.replace(/\/$/,'')}/?locale=${locale}`);await native.waitForFunction(()=>window.updsParityResult?.id==='ready');
 async function call(request){const id=String(Math.random());await native.evaluate(r=>window.updsParityCall(JSON.stringify(r)),{...request,id});await native.waitForFunction(id=>window.updsParityResult?.id===id,id);return native.evaluate(()=>window.updsParityResult);}
 for(const entry of cases){
  await web.evaluate(e=>localStorage.setItem('seiran-detectives-anm009-v1',JSON.stringify({scene:e.scene,line:e.line,choice:e.choice,clues:[],completed:[],attempts:{},readLines:[],tutorialsCompleted:[],storyChoices:{}})),entry);
  await web.reload();await web.locator(entry.scene===0&&entry.line===0?'#new':'#continue').click();await web.locator('.dialogue-text').waitFor();await web.bringToFront();await web.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  const times=values.motion?[0,.35,.7,1.05,1.4,1.75,2.1,2.45,2.8]:[0];
  const source=await web.evaluate(async({character,times})=>{const n=[...document.querySelectorAll('.portrait')].find(n=>n.closest('[data-character]')?.dataset.character===character);if(!n)throw new Error(`Source portrait missing: ${character}`);const animation=n.getAnimations().find(a=>a.animationName==='idle-breathe');if(animation)animation.pause();const frames=[];for(const seconds of times){if(animation)animation.currentTime=seconds*1000;await new Promise(r=>requestAnimationFrame(r));const b=n.getBoundingClientRect();frames.push({seconds,rect:[b.x,b.y,b.width,b.height]});}return{lineId:document.querySelector('.line-id').textContent.split(' · ')[0].trim(),asset:n.querySelector('img').getAttribute('src'),animation:!!animation,frames};},{character:entry.actor.character,times});
  await native.bringToFront();let state=await call({action:'line',scene:entry.scene,line:entry.line,choice:entry.choice});
  build??=state.build;if(!build?.sourceHash||build.sourceHash!==state.build?.sourceHash)throw new Error('Missing/mixed source digest');
  const target={lineId:state.storyLine.id,reducedMotion:state.reducedMotion,frames:[]};
  for(const seconds of times){state=await call({action:'idle_sample',seconds});const p=state.controls.find(c=>c.path.endsWith(`/Stage/${entry.actor.character}`));if(!p)throw new Error(`Native portrait missing: ${entry.id}`);target.asset=p.asset.replace('res://','./');target.animation=p.idle;target.frames.push({seconds,rect:p.rect});}
  const differences=[];if(source.lineId!==entry.id||target.lineId!==entry.id)differences.push('line-id');if(source.asset!==entry.actor.asset||target.asset!==source.asset)differences.push('asset');if(source.animation!==target.animation)differences.push('motion-policy');if(state.reducedMotion!==(motion==='reduce'))differences.push('preference-gate');
  let maxRectDelta=0;for(let i=0;i<times.length;i++)for(let j=0;j<4;j++)maxRectDelta=Math.max(maxRectDelta,Math.abs(source.frames[i].rect[j]-target.frames[i].rect[j]));if(maxRectDelta>0.1)differences.push('geometry/timeline');
  const id=`${locale}-${width}x${height}-${motion}-${entry.id}-${entry.actor.character}-${entry.choice}`;
  if((!values.motion&&locale==='ru'&&width===320)||(values.motion&&entry.actor.character==='miku'&&locale==='ru')){await web.screenshot({path:join(output,`${id}-web.png`)});await native.screenshot({path:join(output,`${id}-godot.png`)});}
  if(values.motion&&entry.actor.character==='miku'&&locale==='ru'&&width===320)for(const seconds of [0,1.4,2.8]){
   await web.bringToFront();await web.evaluate(async seconds=>{const a=document.querySelector('.portrait').getAnimations().find(a=>a.animationName==='idle-breathe');if(a)a.currentTime=seconds*1000;await new Promise(r=>requestAnimationFrame(r));},seconds);
   await native.bringToFront();await call({action:'idle_sample',seconds});
   await web.screenshot({path:join(output,`${id}-t${seconds}-web.png`)});await native.screenshot({path:join(output,`${id}-t${seconds}-godot.png`)});
  }
  const switches=[];
  if(values.motion&&motion==='no-preference')for(const reducedMotion of ['reduce','no-preference']){
   await web.emulateMedia({reducedMotion});await native.emulateMedia({reducedMotion});await native.waitForTimeout(150);
   const active=await web.evaluate(character=>[...document.querySelectorAll('.portrait')].find(n=>n.closest('[data-character]')?.dataset.character===character).getAnimations().some(a=>a.animationName==='idle-breathe'),entry.actor.character);
   state=await call({action:'snapshot'});const p=state.controls.find(c=>c.path.endsWith(`/Stage/${entry.actor.character}`));
   if(active!==p.idle||state.reducedMotion!==(reducedMotion==='reduce'))differences.push(`live-${reducedMotion}`);
   switches.push({reducedMotion,sourceActive:active,nativeActive:p.idle,nativePreference:state.reducedMotion});
  }
  records.push({id,entry,locale,viewport:[width,height],motion,source,native:target,switches,maxRectDelta,differences});console.log(`${id}: ${differences.join(',')||'asset/geometry/timeline match'} (${maxRectDelta.toFixed(4)}px)`);
 }
 await context.close();
}
}finally{await browser.close();}
const header=JSON.stringify({build,actorEntries:all.length,uniqueStaging:unique.size,errors},null,2);
// Keep one state per line so large evidence matrices remain reviewable in Git.
await writeFile(join(output,'report.json'),header.slice(0,-2)+',\n  "records": [\n'+records.map(r=>'    '+JSON.stringify(r)).join(',\n')+'\n  ]\n}\n');
console.log(JSON.stringify({states:records.length,frames:records.reduce((s,r)=>s+r.source.frames.length,0),matching:records.filter(r=>!r.differences.length).length,errors:errors.length,maxRectDelta:Math.max(...records.map(r=>r.maxRectDelta))}));
if(errors.length||records.some(r=>r.differences.length))throw new Error('Core portrait parity contracts failed; inspect report');
