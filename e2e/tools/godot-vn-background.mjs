// Direct GPU comparison of the production VN backdrop, with foreground UI hidden only in QA.
import {chromium} from '@playwright/test';
import {parseArgs} from 'node:util';
import {createRequire} from 'node:module';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {values}=parseArgs({options:{chrome:{type:'string'},web:{type:'string'},godot:{type:'string'},output:{type:'string'},sharp:{type:'string'},locale:{type:'string'},viewport:{type:'string'}}});
for(const key of ['web','godot','output','sharp'])if(!values[key])throw new Error(`--${key} required`);
const sharp=createRequire(import.meta.url)(resolve(values.sharp));
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),output=resolve(values.output);
await mkdir(output,{recursive:true});
const cases=new Map();
for(const file of await readdir(join(root,'godot/data'))){if(!file.endsWith('.json'))continue;const data=JSON.parse(await readFile(join(root,'godot/data',file),'utf8'));if(!data.sceneId)continue;const scene=data.sceneIndex??Number(data.sceneId.match(/^VN_SCENE_(\d+)/)?.[1]);for(const [choice,lines]of data.variants?Object.entries(data.variants):[['A',data.lines??[]]])for(const [line,entry]of lines.entries()){const asset=entry.background??data.background;if(asset&&!cases.has(asset))cases.set(asset,{scene,line,choice,id:entry.id,asset});}}
const browser=await chromium.launch({headless:true,...(values.chrome?{executablePath:values.chrome}:{})});
const records=[],errors=[];let build;
try{for(const locale of values.locale?[values.locale]:['ru','be','en'])for(const [width,height]of values.viewport?[values.viewport.split('x').map(Number)]:[[320,568],[390,844],[480,854]]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
 await context.addInitScript(locale=>{localStorage.setItem('seiran-detectives-locale-v1',locale);},locale);
 const web=await context.newPage(),native=await context.newPage();
 for(const [name,page]of [['web',web],['godot',native]]){page.on('pageerror',e=>errors.push(`${name}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${name}: ${m.text()}`);});page.on('response',r=>{if(r.status()>=400)errors.push(`${name} HTTP ${r.status()} ${r.url()}`);});}
 await web.goto(values.web);await native.goto(`${values.godot.replace(/\/$/,'')}/?locale=${locale}`);await native.waitForFunction(()=>window.updsParityResult?.id==='ready');
 async function call(request){const id=String(Math.random());await native.evaluate(r=>window.updsParityCall(JSON.stringify(r)),{...request,id});await native.waitForFunction(id=>window.updsParityResult?.id===id,id);return native.evaluate(()=>window.updsParityResult);}
 for(const entry of cases.values()){
  await web.evaluate(e=>localStorage.setItem('seiran-detectives-anm009-v1',JSON.stringify({scene:e.scene,line:e.line,choice:e.choice,clues:[],completed:[],attempts:{},readLines:[],tutorialsCompleted:[],storyChoices:{}})),entry);
  await web.reload();await web.locator(entry.scene===0&&entry.line===0?'#new':'#continue').click();await web.locator('.dialogue-text').waitFor();await web.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));for(const c of document.querySelector('.vn-screen').children)if(!c.matches('.vn-background-stack,.vn-vignette'))c.style.visibility='hidden';});
  const sourceAsset=await web.locator('.vn-background-fit').getAttribute('src');
  await call({action:'background_only',enabled:false});let state=await call({action:'line',...entry});state=await call({action:'background_only'});
  build??=state.build;if(!build?.sourceHash||state.build.sourceHash!==build.sourceHash)throw new Error('Missing/mixed source digest');
  const nativeAsset=state.controls.find(c=>c.path.endsWith('/BackgroundFit'))?.asset.replace('res://','./');
  const id=`${locale}-${width}x${height}-${entry.id}`,clip={x:(width-Math.min(width,430))/2,y:0,width:Math.min(width,430),height};
  const images=[];for(const [name,page]of [['web',web],['godot',native]]){await page.bringToFront();images.push(await page.screenshot({path:join(output,`${id}-${name}.png`),clip}));}
  const pixels=await Promise.all(images.map(i=>sharp(i).removeAlpha().raw().toBuffer()));let sum=0,max=0;for(let i=0;i<pixels[0].length;i++){const d=Math.abs(pixels[0][i]-pixels[1][i]);sum+=d;max=Math.max(max,d);}
  const row={id,entry,locale,viewport:[width,height],sourceAsset,nativeAsset,meanAbsoluteRgb:sum/pixels[0].length,maxChannelDelta:max};records.push(row);console.log(JSON.stringify(row));
 }
 await context.close();
}}finally{await browser.close();}
await writeFile(join(output,'report.json'),JSON.stringify({build,backgrounds:cases.size,errors},null,2).slice(0,-2)+',\n "records":[\n'+records.map(r=>JSON.stringify(r)).join(',\n')+'\n]}\n');
if(errors.length||records.some(r=>r.sourceAsset!==r.entry.asset||r.nativeAsset!==r.sourceAsset))throw new Error('Background runtime/asset contracts failed');
console.log(JSON.stringify({states:records.length,errors:errors.length,meanAbsoluteRgb:records.reduce((s,r)=>s+r.meanAbsoluteRgb,0)/records.length}));
