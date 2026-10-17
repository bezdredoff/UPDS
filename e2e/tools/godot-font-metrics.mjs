// Compare actual Web-export font advances against the production browser's rendered font stack.
import {chromium} from '@playwright/test';
import {parseArgs} from 'node:util';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const {values}=parseArgs({options:{chrome:{type:'string'},web:{type:'string'},godot:{type:'string'},cases:{type:'string'},output:{type:'string'}}});
if(!values.web||!values.godot||!values.cases||!values.output)throw new Error('--web, --godot, --cases story report and --output required');
const cases=JSON.parse(await readFile(values.cases,'utf8')).records.filter(r=>r.viewport[0]===390).map(r=>({id:r.id,locale:r.locale,text:r.source.text}));
const browser=await chromium.launch({headless:true,...(values.chrome?{executablePath:values.chrome}:{})});
const records=[],errors=[];let build,sourceFont;
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await context.addInitScript(()=>{localStorage.clear();sessionStorage.clear();});
 const web=await context.newPage(),native=await context.newPage();
 for(const[name,page]of[['web',web],['godot',native]]){page.on('pageerror',e=>errors.push(`${name}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${name}: ${m.text()}`);});page.on('response',r=>{if(r.status()>=400)errors.push(`${name}: HTTP ${r.status()} ${r.url()}`);});}
 await web.goto(values.web);await web.locator('#new').click();await web.evaluate(()=>document.fonts.ready);
 const source=await web.evaluate(cases=>{const font=getComputedStyle(document.querySelector('.dialogue-text')).font,c=document.createElement('canvas').getContext('2d');c.font=font;return{font,widths:cases.map(r=>c.measureText(r.text).width)};},cases);sourceFont=source.font;
 await native.goto(`${values.godot.replace(/\/$/,'')}/?locale=en`);await native.waitForFunction(()=>window.updsParityResult?.id==='ready');await native.bringToFront();
 for(const [i,entry]of cases.entries()){
  const id=String(i);await native.evaluate(r=>window.updsParityCall(JSON.stringify(r)),{action:'font_metrics',text:entry.text,id});await native.waitForFunction(id=>window.updsParityResult?.id===id,id);const state=await native.evaluate(()=>window.updsParityResult);
  build??=state.build;if(!build?.sourceHash||build.sourceHash!==state.build?.sourceHash)throw new Error('Missing/mixed build digest');
  records.push({...entry,sourceWidth:source.widths[i],nativeWidths:state.fontMetrics});
 }
 await context.close();
}finally{await browser.close();}
const summary=Object.fromEntries(['ru','be','en'].map(locale=>{const subset=records.filter(r=>r.locale===locale);return[locale,Object.fromEntries(['16','17'].map(size=>[size,{samples:subset.length,meanRelativeError:subset.reduce((s,r)=>s+Math.abs(r.nativeWidths[size]/r.sourceWidth-1),0)/subset.length}]))];}));
await mkdir(resolve(values.output),{recursive:true});await writeFile(join(resolve(values.output),'report.json'),JSON.stringify({sourceFont,build,records,summary,errors},null,2));console.log(JSON.stringify(summary));if(errors.length)throw new Error('Font metrics runtime/HTTP errors');
