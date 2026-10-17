// Production ending routes: content, outcome metrics, clue art and actual geometry.
import {chromium} from '@playwright/test';
import {parseArgs} from 'node:util';
import {createRequire} from 'node:module';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {values}=parseArgs({options:{chrome:{type:'string'},web:{type:'string'},godot:{type:'string'},output:{type:'string'},locale:{type:'string'},viewport:{type:'string'},strict:{type:'boolean',default:false},backgrounds:{type:'boolean',default:false},sharp:{type:'string'}}});
for(const key of ['web','godot','output'])if(!values[key])throw new Error(`--${key} required`);
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),output=resolve(values.output);await mkdir(output,{recursive:true});
const cases=[{name:'A',scene:42,file:'post_full_truth_scene.json',ending:'ENDING_A_FULL_TRUTH',choice:'A',clues:Array.from({length:10},(_,i)=>`CUE_${String(i+10).padStart(3,'0')}`),storyChoices:{'final-strategy':'B','meeting-tone':'A','apology-to-hinata':'C','protect-gen-source':'A','photo-permission':'A','family-ledger-permission':'A','trust-vincent':'A'}},{name:'B',scene:40,file:'post_private_return_scene.json',ending:'ENDING_B_CASE_CLOSED',choice:'A',clues:['CUE_001','CUE_002'],storyChoices:{'final-strategy':'A'}},{name:'C',scene:44,file:'post_convenient_case_scene.json',ending:'ENDING_C_PERFECT_SUSPECT',choice:'C',clues:['CUE_003'],storyChoices:{'final-strategy':'C'}},{name:'fallback',scene:42,file:'post_full_truth_scene.json',ending:'ENDING_B_CASE_CLOSED',choice:'B',clues:[],storyChoices:{'final-strategy':'B'}},{name:'empty',scene:40,file:'post_private_return_scene.json',ending:'ENDING_B_CASE_CLOSED',choice:'A',clues:[],storyChoices:{'final-strategy':'A'}}];
for(const c of cases)c.line=JSON.parse(await readFile(join(root,'godot/data',c.file),'utf8')).lines.length;
const browser=await chromium.launch({headless:true,...(values.chrome?{executablePath:values.chrome}:{})});const records=[],errors=[];let build;
if(values.backgrounds&&!values.sharp)throw new Error('--backgrounds requires --sharp');
const sharp=values.backgrounds?createRequire(import.meta.url)(resolve(values.sharp)):null;
const normal=s=>s.replace(/\s+/g,' ').trim();
try{for(const locale of values.locale?[values.locale]:['ru','be','en'])for(const [width,height]of values.viewport?[values.viewport.split('x').map(Number)]:[[320,568],[390,844],[480,854]]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});await context.addInitScript(locale=>localStorage.setItem('seiran-detectives-locale-v1',locale),locale);
 const web=await context.newPage(),native=await context.newPage();for(const[name,page]of[['web',web],['native',native]]){page.on('pageerror',e=>errors.push(`${name}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${name}: ${m.text()}`);});page.on('response',r=>{if(r.status()>=400)errors.push(`${name} HTTP ${r.status()} ${r.url()}`);});}
 await web.goto(values.web);await native.goto(`${values.godot.replace(/\/$/,'')}/?locale=${locale}`);await native.waitForFunction(()=>window.updsParityResult?.id==='ready');
 async function call(request){const id=String(Math.random());await native.evaluate(r=>window.updsParityCall(JSON.stringify(r)),{...request,id});await native.waitForFunction(id=>window.updsParityResult?.id===id,id);return native.evaluate(()=>window.updsParityResult);}
 for(const c of cases){
  await web.evaluate(c=>localStorage.setItem('seiran-detectives-anm009-v1',JSON.stringify({scene:c.scene,line:c.line,choice:c.choice,clues:c.clues,storyChoices:c.storyChoices,completed:[],attempts:{},readLines:[],tutorialsCompleted:[]})),c);await web.reload();await web.locator('#continue').click();await web.locator('.ending-screen').waitFor();await web.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  const state=await call({action:'ending',...c});build??=state.build;if(!build?.sourceHash||state.build.sourceHash!==build.sourceHash)throw new Error('Missing/mixed source digest');
  const source=await web.evaluate(()=>{const nodes={panel:'.ending-panel',clue:'.thread-clue',eyebrow:'.ending-panel>.eyebrow',heading:'.ending-panel>h1',body:'.ending-panel>p:not(.eyebrow)',summary:'.summary',menu:'#menu-primary',replay:'#replay',header:'.ending-topbar',settings:'#header-settings'};const rects={};for(const[k,s]of Object.entries(nodes)){const r=document.querySelector(s).getBoundingClientRect();rects[k]=[r.x,r.y,r.width,r.height];}return{background:(()=>{const n=document.querySelector('.ending-background'),s=getComputedStyle(n),m=new DOMMatrixReadOnly(s.transform);return{asset:n.getAttribute('src'),profile:[Number(s.filter.match(/blur\(([^p]+)px\)/)?.[1]??0),Number(s.filter.match(/brightness\(([^)]+)\)/)?.[1]??1),Number(s.filter.match(/saturate\(([^)]+)\)/)?.[1]??1),m.a]};})(),ending:document.querySelector('.ending-screen').dataset.endingId,clue:document.querySelector('.thread-clue').getAttribute('src'),eyebrow:document.querySelector(nodes.eyebrow).textContent,heading:document.querySelector(nodes.heading).textContent,body:document.querySelector(nodes.body).textContent,summary:document.querySelector('.summary').textContent,metrics:[...document.querySelectorAll('.summary b')][1].textContent.match(/\d+/g).map(Number),rects};});
  const paths={panel:'/EndingPanel',clue:'/Clue',eyebrow:'/Eyebrow',heading:'/Heading',body:'/Copy',summary:'/SummaryPaper',menu:'/Menu',replay:'/Replay',header:'/EndingHeader',settings:'/EndingHeader/Settings'},target={rects:{}};const differences=[],geometry=[];
  for(const[k,p]of Object.entries(paths)){const n=state.controls.find(n=>n.path.includes('/EndingScreen/')&&n.path.endsWith(p));if(!n){differences.push(`missing-${k}`);continue;}target.rects[k]=n.rect;if(['eyebrow','heading','body'].includes(k))target[k]=n.text;if(k==='clue')target.clue=n.asset.replace('res://','./');const d=Math.max(...source.rects[k].map((v,i)=>Math.abs(v-n.rect[i])));if(d>.1)geometry.push({node:k,delta:d});}
  target.summary=state.controls.find(n=>n.path.includes('/EndingScreen/')&&n.path.endsWith('/Summary'))?.text;
  target.ending=state.ending;target.background=state.background;
  if(source.background.asset!==state.background.asset?.replace('res://','./')||!Array.isArray(state.background.profile)||state.background.profile.length!==4||source.background.profile.some((v,i)=>!Number.isFinite(state.background.profile[i])||Math.abs(v-state.background.profile[i])>.00001))differences.push('background-profile/asset');
  if(source.ending!==c.ending||state.ending.endingId!==source.ending)differences.push('outcome');
  if(source.clue!==target.clue)differences.push('clue-asset');
  if(JSON.stringify(source.metrics)!==JSON.stringify(['evidence','teamTrust','sourceTrust'].map(k=>state.ending.metrics[k])))differences.push('metrics');
  for(const k of ['eyebrow','heading','body','summary'])if(normal(source[k])!==normal(target[k]??''))differences.push(`text-${k}`);
  const id=`${locale}-${width}x${height}-${c.name}`;await web.bringToFront();await web.screenshot({path:join(output,`${id}-web.png`)});await native.bringToFront();await native.screenshot({path:join(output,`${id}-godot.png`)});
  if(values.backgrounds&&['A','B'].includes(c.name)){
   await web.evaluate(()=>{document.querySelector('.ending-topbar').style.visibility='hidden';document.querySelector('.ending-panel').style.visibility='hidden';});await call({action:'background_only'});
   const clip={x:(width-Math.min(width,430))/2,y:0,width:Math.min(width,430),height};const images=[];for(const[name,page]of[['web',web],['godot',native]]){await page.bringToFront();images.push(await page.screenshot({path:join(output,id+'-background-'+name+'.png'),clip}));}
   const a=await sharp(images[0]).removeAlpha().raw().toBuffer(),b=await sharp(images[1]).removeAlpha().raw().toBuffer();let sum=0;for(let i=0;i<a.length;i++)sum+=Math.abs(a[i]-b[i]);target.background.meanAbsoluteRgb=sum/a.length;await call({action:'background_only',enabled:false});
  }
  records.push({id,scenario:c.name,locale,viewport:[width,height],source,native:target,differences,geometry});console.log(JSON.stringify({id,differences,geometry}));
 }
 await context.close();
}}finally{await browser.close();}
await writeFile(join(output,'report.json'),JSON.stringify({build,errors},null,2).slice(0,-2)+',\n "records":[\n'+records.map(r=>JSON.stringify(r)).join(',\n')+'\n]}\n');
if(errors.length||records.some(r=>r.differences.length||(values.strict&&r.geometry.length)))throw new Error('Ending parity contracts failed; inspect report');
