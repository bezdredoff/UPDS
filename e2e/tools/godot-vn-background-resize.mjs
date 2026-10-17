// Resize the same production VN backdrop without reopening its scene.
import {chromium} from '@playwright/test';
import {parseArgs} from 'node:util';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const {values}=parseArgs({options:{chrome:{type:'string'},web:{type:'string'},godot:{type:'string'},output:{type:'string'},sharp:{type:'string'}}});
for(const key of ['web','godot','output','sharp'])if(!values[key])throw new Error(`--${key} required`);
const sharp=createRequire(import.meta.url)(resolve(values.sharp)),output=resolve(values.output);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(values.chrome?{executablePath:values.chrome}:{})});
const records=[],errors=[];let build;
try{for(const locale of ['ru','be','en']){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await context.addInitScript(locale=>{localStorage.setItem('seiran-detectives-locale-v1',locale);localStorage.setItem('seiran-detectives-anm009-v1',JSON.stringify({scene:15,line:1,choice:'A',clues:[],completed:[],attempts:{},readLines:[],tutorialsCompleted:[],storyChoices:{}}));},locale);
 const web=await context.newPage(),native=await context.newPage();
 for(const [name,page]of [['web',web],['godot',native]]){page.on('pageerror',e=>errors.push(`${name}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${name}: ${m.text()}`);});page.on('response',r=>{if(r.status()>=400)errors.push(`${name} HTTP ${r.status()} ${r.url()}`);});}
 await web.goto(values.web);await web.locator('#continue').click();await web.locator('.dialogue-text').waitFor();await web.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
 await native.goto(`${values.godot.replace(/\/$/,'')}/?locale=${locale}`);await native.waitForFunction(()=>window.updsParityResult?.id==='ready');
 async function call(request){const id=String(Math.random());await native.evaluate(r=>window.updsParityCall(JSON.stringify(r)),{...request,id});await native.waitForFunction(id=>window.updsParityResult?.id===id,id);return native.evaluate(()=>window.updsParityResult);}
 await call({action:'line',scene:15,line:1});await call({action:'background_only'});
 let previous=0;
 for(const [index,[width,height]]of [[390,844],[320,568],[480,854],[390,844]].entries()){
  await web.setViewportSize({width,height});await native.setViewportSize({width,height});await native.waitForTimeout(180);
  await web.evaluate(()=>{for(const c of document.querySelector('.vn-screen').children)if(!c.matches('.vn-background-stack,.vn-vignette'))c.style.visibility='hidden';});
  const state=await call({action:'snapshot'});build??=state.build;if(build.sourceHash!==state.build.sourceHash)throw new Error('Mixed source digest');
  const line=(await web.locator('.line-id').first().textContent()).split(' · ')[0].trim();
  const clip={x:(width-Math.min(width,430))/2,y:0,width:Math.min(width,430),height},id=`${locale}-${index}-${width}x${height}`;
  const images=[];for(const [name,page]of [['web',web],['godot',native]]){await page.bringToFront();images.push(await page.screenshot({path:join(output,`${id}-${name}.png`),clip}));}
  const a=await sharp(images[0]).removeAlpha().raw().toBuffer(),b=await sharp(images[1]).removeAlpha().raw().toBuffer();let sum=0;for(let i=0;i<a.length;i++)sum+=Math.abs(a[i]-b[i]);
  const after=await call({action:'snapshot'}),failures=[];
  if(line!=='VN0371'||state.storyLine.id!==line)failures.push('line-advance');
  if(JSON.stringify(state.background.rasterSize)!==JSON.stringify([clip.width,clip.height]))failures.push('raster-size');
  if(index&&state.background.renderGeneration<=previous)failures.push('resize-invalidation');
  if(after.background.renderGeneration!==state.background.renderGeneration)failures.push('idle-cache');
  records.push({id,locale,viewport:[width,height],sourceLine:line,nativeLine:state.storyLine.id,background:state.background,meanAbsoluteRgb:sum/a.length,failures});previous=state.background.renderGeneration;
  console.log(JSON.stringify(records.at(-1)));
 }
 await context.close();
}}finally{await browser.close();}
await writeFile(join(output,'report.json'),JSON.stringify({build,errors,records},null,2));
if(errors.length||records.some(r=>r.failures.length))throw new Error('Live backdrop resize contracts failed');
