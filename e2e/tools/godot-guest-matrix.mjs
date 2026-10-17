// Actual production guest lines: asset selection, displayed geometry and static motion.
import {chromium} from '@playwright/test';
import {parseArgs} from 'node:util';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const {values}=parseArgs({options:{chrome:{type:'string'},web:{type:'string'},godot:{type:'string'},output:{type:'string'},locale:{type:'string'},viewport:{type:'string'},sharp:{type:'string'},'line-id':{type:'string'}}});
if(!values.web||!values.godot||!values.output)throw new Error('--web, --godot, --output required');
const sharp=values.sharp?createRequire(import.meta.url)(resolve(values.sharp)):null;
const all=[];
for(const file of await readdir(join(root,'godot/data'))){if(!file.endsWith('.json'))continue;const scene=JSON.parse(await readFile(join(root,'godot/data',file),'utf8'));if(!Number.isInteger(scene.sceneIndex))continue;for(const [line,entry]of(scene.lines??[]).entries())for(const actor of entry.actors??[])if(actor.compactHeight)all.push({scene:scene.sceneIndex,line,id:entry.id,guest:actor.character,asset:actor.asset});}
const variants=[...new Map(all.map(row=>[row.asset,row])).values()].sort((a,b)=>a.asset.localeCompare(b.asset));
if(new Set(variants.map(c=>c.guest)).size!==6||variants.length!==12||all.length!==71)throw new Error('Guest coverage changed; inspect canonical source before updating this matrix');
const cases=values['line-id']?all.filter(row=>row.id===values['line-id']):variants;
if(!cases.length)throw new Error('Requested guest line not found');
const output=resolve(values.output);await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(values.chrome?{executablePath:values.chrome}:{})});
const records=[],errors=[];let build;
try{
for(const locale of values.locale?[values.locale]:['ru','be','en'])for(const [width,height]of values.viewport?[values.viewport.split('x').map(Number)]:[[320,568],[390,844],[480,854]]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'});
 await context.addInitScript(locale=>{if(!sessionStorage.getItem('guest-matrix')){localStorage.clear();sessionStorage.setItem('guest-matrix','1');}localStorage.setItem('seiran-detectives-locale-v1',locale);},locale);
 const web=await context.newPage(),native=await context.newPage();
 for(const[name,page]of[['web',web],['godot',native]]){page.on('pageerror',e=>errors.push(`${locale}/${width}/${name}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${locale}/${width}/${name}: ${m.text()}`);});page.on('response',r=>{if(r.status()>=400)errors.push(`${name} HTTP ${r.status()} ${r.url()}`);});}
 await web.goto(values.web);await native.goto(`${values.godot.replace(/\/$/,'')}/?locale=${locale}`);await native.waitForFunction(()=>window.updsParityResult?.id==='ready');
 async function call(request){const id=String(Math.random());await native.evaluate(r=>window.updsParityCall(JSON.stringify(r)),{...request,id});await native.waitForFunction(id=>window.updsParityResult?.id===id,id);return native.evaluate(()=>window.updsParityResult);}
 for(const entry of cases){
  await web.evaluate(entry=>localStorage.setItem('seiran-detectives-anm009-v1',JSON.stringify({scene:entry.scene,line:entry.line,choice:'A',clues:[],completed:[],attempts:{},readLines:[],tutorialsCompleted:[],storyChoices:{}})),entry);
  await web.reload();await web.locator('#continue').click();await web.locator('[data-guest-witness]').waitFor();await web.bringToFront();await web.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  const source=await web.evaluate(()=>{const n=document.querySelector('[data-guest-witness]'),r=n.getBoundingClientRect(),s=document.querySelector('.stage').getBoundingClientRect();return{lineId:document.querySelector('.line-id').textContent.split(' · ')[0].trim(),guest:n.dataset.guestWitness,asset:n.querySelector('img').getAttribute('src'),rect:[r.x,r.y,r.width,r.height],stage:[s.x,s.y,s.width,s.height],animation:getComputedStyle(n).animationName};});
  await native.bringToFront();let state=await call({action:'line',scene:entry.scene,line:entry.line});await native.waitForTimeout(150);state=await call({action:'snapshot'});
  build??=state.build;if(!build?.sourceHash||build.sourceHash!==state.build?.sourceHash)throw new Error('Missing/mixed native source digest');
  const portrait=state.controls.find(c=>c.path.endsWith(`/Stage/${entry.guest}`));if(!portrait)throw new Error(`Missing actual TextureRect for ${entry.id}/${entry.guest}`);
  const target={lineId:state.storyLine.id,guest:entry.guest,asset:portrait.asset?.replace('res://','./'),rect:portrait.rect,textureFilter:portrait.textureFilter};
  await native.waitForTimeout(350);state=await call({action:'snapshot'});const after=state.controls.find(c=>c.path.endsWith(`/Stage/${entry.guest}`)).rect;
  const differences=[];for(const key of ['lineId','guest','asset'])if(source[key]!==target[key]||source[key]!==entry[key==='lineId'?'id':key])differences.push(key);
  if(source.rect.some((v,i)=>Math.abs(v-target.rect[i])>1))differences.push('geometry');
  if(source.animation!=='none'||after.some((v,i)=>Math.abs(v-target.rect[i])>0.02))differences.push('static-motion');
  const expression=entry.asset.split('/').at(-1).replace('.png','');
  const id=`${locale}-${width}x${height}-${entry.guest}-${expression}`;
  const a=await web.screenshot(),b=await native.screenshot();let stageRgbMeanError=null;
  if(sharp){const [x,y,w,h]=source.stage,region={left:Math.max(0,Math.ceil(x)),top:Math.max(0,Math.ceil(y)),width:Math.floor(w),height:Math.floor(h)};const [aa,bb]=await Promise.all([sharp(a).extract(region).removeAlpha().raw().toBuffer(),sharp(b).extract(region).removeAlpha().raw().toBuffer()]);let sum=0;for(let i=0;i<aa.length;i++)sum+=Math.abs(aa[i]-bb[i]);stageRgbMeanError=sum/aa.length;}
  if((locale==='ru'&&width===390)||(locale==='en'&&width===320&&!entry.asset.includes('expressions'))||(locale==='be'&&width===480&&!entry.asset.includes('expressions'))){await writeFile(join(output,`${id}-web.png`),a);await writeFile(join(output,`${id}-godot.png`),b);}
  records.push({id,entry,source,native:target,after350ms:after,stageRgbMeanError,differences});console.log(`${id}: ${differences.join(',')||'asset/geometry/static contracts match'}`);
 }
 await context.close();
}
}finally{await browser.close();}
await writeFile(join(output,'report.json'),JSON.stringify({build,authoredGuestLines:all.length,uniqueAssets:cases.length,records,errors},null,2));
console.log(JSON.stringify({states:records.length,matching:records.filter(r=>!r.differences.length).length,errors:errors.length}));
if(errors.length||records.some(r=>r.differences.length))throw new Error('Guest parity contracts failed; inspect report');
