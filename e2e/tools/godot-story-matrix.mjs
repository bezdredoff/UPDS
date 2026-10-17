// Seed ordinary campaign saves only in fresh browser contexts; compare actual rendered scene entries.
import { chromium } from '@playwright/test';
import { parseArgs } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const {values}=parseArgs({options:{chrome:{type:'string'},web:{type:'string'},godot:{type:'string'},output:{type:'string'},locale:{type:'string'},viewport:{type:'string'},scenes:{type:'string'},'text-scale':{type:'string',default:'normal'},'enforce-nameplate':{type:'boolean',default:false}}});
if(!values.web||!values.godot||!values.output)throw new Error('--web, --godot, --output required');
if(!['normal','large'].includes(values['text-scale']))throw new Error('Invalid --text-scale');
const output=resolve(values.output);await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(values.chrome?{executablePath:values.chrome}:{})});
const records=[],errors=[];let sourceHash;
try {
 for(const locale of values.locale?[values.locale]:['ru','be','en']) for(const [width,height] of values.viewport?[values.viewport.split('x').map(Number)]:[[320,568],[390,844],[480,854]]) {
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  await context.addInitScript(locale=>{if(!sessionStorage.getItem('story-matrix')){localStorage.clear();sessionStorage.setItem('story-matrix','1');}localStorage.setItem('seiran-detectives-locale-v1',locale);},locale);
  const web=await context.newPage(),native=await context.newPage();
  for(const[name,page]of[['web',web],['godot',native]]){page.on('pageerror',e=>errors.push(`${locale}/${width}/${name}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${locale}/${width}/${name}: ${m.text()}`);});page.on('response',r=>{if(r.status()>=400)errors.push(`${name} HTTP ${r.status()} ${r.url()}`);});}
  await web.goto(values.web);await native.goto(`${values.godot.replace(/\/$/,'')}/?locale=${locale}`);await native.waitForFunction(()=>window.updsParityResult?.id==='ready');
  async function call(request){const id=String(Math.random());await native.evaluate(r=>window.updsParityCall(JSON.stringify(r)),{...request,id});await native.waitForFunction(id=>window.updsParityResult?.id===id,id);return native.evaluate(()=>window.updsParityResult);}
  for(const scene of values.scenes?values.scenes.split(',').map(Number):Array.from({length:45},(_,i)=>i)) {
   await web.evaluate(scene=>localStorage.setItem('seiran-detectives-anm009-v1',JSON.stringify({scene,line:0,choice:'A',clues:[],completed:[],attempts:{},readLines:[],tutorialsCompleted:[],storyChoices:{}})),scene);
   await web.reload();await web.locator(scene===0?'#new':'#continue').click();await web.locator('.dialogue-text').waitFor();await web.bringToFront();
   if(values['text-scale']==='large'){await web.locator('#header-settings').click();await web.locator('[data-text-scale="large"]').click();await web.locator('#close-overlay').click();}
   await web.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
   const source=await web.evaluate(()=>{const d=document.querySelector('.dialogue-text'),r=document.querySelector('.dialogue-nameplate').getBoundingClientRect();return{nameplate:[r.x,r.y,r.width,r.height],lineId:document.querySelector('.line-id')?.textContent.split(' · ')[0].trim(),text:d.textContent,pages:Number(d.dataset.dialoguePages),actors:[...document.querySelectorAll('.stage [data-character]')].map(n=>n.dataset.character),images:[...document.querySelectorAll('.stage img')].map(n=>n.getAttribute('src'))};});
   await native.bringToFront();let state=await call({action:'line',scene,line:0});if(values['text-scale']==='large')state=await call({action:'text_scale',scale:'large'});await native.waitForTimeout(120);state=await call({action:'snapshot'});
   sourceHash??=state.build?.sourceHash;if(!sourceHash||sourceHash!==state.build?.sourceHash)throw new Error('Missing/mixed native build digest');
   const target={nameplate:state.controls.find(c=>c.path.endsWith('/Nameplate'))?.rect,lineId:state.storyLine.id,text:state.dialogue.displayed,pages:state.dialogue.pages.length,actors:(state.storyLine.actors??[]).map(a=>a.character),images:(state.storyLine.actors??[]).map(a=>a.asset)};
   const differences=[];for(const key of ['lineId','text','pages'])if(source[key]!==target[key])differences.push(key);
   if(JSON.stringify([...new Set(source.actors)].sort())!==JSON.stringify([...new Set(target.actors)].sort()))differences.push('actors');
   if(!target.nameplate||source.nameplate.some((v,i)=>Math.abs(v-target.nameplate[i])>1))differences.push('nameplate');
   const id=`${locale}-${width}x${height}-scene-${scene}${values['text-scale']==='large'?'-large':''}`;
   if([0,1,38,40,42,44].includes(scene)){await web.screenshot({path:join(output,`${id}-web.png`)});await native.screenshot({path:join(output,`${id}-godot.png`)});}
   records.push({id,scene,locale,viewport:[width,height],source,native:target,differences});
   console.log(`${id}: ${differences.join(',')||'entry contracts match'}`);
  }
  await context.close();
 }
}finally{await browser.close();}
await writeFile(join(output,'report.json'),JSON.stringify({sourceHash,textScale:values['text-scale'],coverage:'Scene first visible line; seeded normal saves, choice A; not a natural full playthrough or ending outcome acceptance',records,errors},null,2));
console.log(JSON.stringify({states:records.length,matching:records.filter(r=>!r.differences.length).length,differences:Object.fromEntries(['lineId','text','pages','actors','nameplate'].map(k=>[k,records.filter(r=>r.differences.includes(k)).length])),errors:errors.length}));
if(errors.length)throw new Error('Runtime/HTTP errors in story matrix');
if(values['enforce-nameplate']&&records.some(r=>r.differences.includes('nameplate')))throw new Error('Nameplate geometry differs from production');

