import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { decodeRgbaPng, preservationSignatures } from '../../../tests/helpers/pngRgba.ts';
const root='docs/art/rina-pose-2026-10-01', work='output/art-review/rina-pose-v2';
const base='5c5a2164fb6ff983dc57972796238fe5ca10b306';
const sha=b=>createHash('sha256').update(b).digest('hex');
const crc=b=>{let c=0xffffffff;for(const v of b){c^=v;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
function chunk(t,d){const type=Buffer.from(t),len=Buffer.alloc(4),check=Buffer.alloc(4);len.writeUInt32BE(d.length);check.writeUInt32BE(crc(Buffer.concat([type,d])));return Buffer.concat([len,type,d,check]);}
function encode(w,h,p){const header=Buffer.alloc(13);header.writeUInt32BE(w);header.writeUInt32BE(h,4);header[8]=8;header[9]=6;const rows=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++)p.copy(rows,y*(w*4+1)+1,y*w*4,(y+1)*w*4);return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);}
const masterBytes=readFileSync(`${work}/neutral-candidate.png`);
if(sha(masterBytes)!=='4ec1dd2d41b3bf1ddbf41e10a5bb90fed352c0e37a442e4775e1dbe87b8fede1')throw Error('Master not the explicitly accepted v2');
const master=decodeRgbaPng(masterBytes),roi=[440,156,152,137],assets=[];
const eyeBoxes=[[459,194,33,37],[550,183,34,36]];
function hsv(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;return [d===0?0:(max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4)*60,max?d/max:0,max];}
function rgb(h,s,v){const c=v*s,z=c*(1-Math.abs((h/60)%2-1)),m=v-c;const p=h<60?[c,z,0]:h<120?[z,c,0]:h<180?[0,c,z]:h<240?[0,z,c]:h<300?[z,0,c]:[c,0,z];return p.map(n=>Math.round((n+m)*255));}
const palette=eyeBoxes.map(([x,y,w,h])=>{let count=0,hue=0,sat=0,value=0;for(let row=y;row<y+h;row++)for(let col=x;col<x+w;col++){const i=(row*1024+col)*4,[a,b,c]=hsv(...master.pixels.subarray(i,i+3));if(a>85&&a<180&&b>.18&&c>.23){count++;hue+=a;sat+=b;value+=c;}}return{hue:hue/count,saturation:sat/count,value:value/count};});
mkdirSync(`${root}/source`,{recursive:true});mkdirSync(`${work}/package`,{recursive:true});
mkdirSync(`${root}/iris-masks`,{recursive:true});mkdirSync(`${work}/iris-before`,{recursive:true});
for(const expression of ['neutral','smile','serious','surprised','embarrassed']){
 const path=`public/assets/characters/rina/rig/pose_a/frames/frame-${expression}.png`;
 const source=execFileSync('git',['show',`${base}:${path}`],{maxBuffer:10000000});
 const sourcePath=`${root}/source/frame-${expression}.png`;writeFileSync(sourcePath,source);
 const decoded=decodeRgbaPng(source),pixels=Buffer.from(master.pixels);
 if(expression!=='neutral')for(let y=roi[1];y<roi[1]+roi[3];y++)for(let x=roi[0];x<roi[0]+roi[2];x++){
  const i=(y*1024+x)*4;decoded.pixels.copy(pixels,i,i,i+3);
 }
 const mask=Buffer.alloc(1024*1536*4);for(let i=3;i<mask.length;i+=4)mask[i]=255;
 let irisChanges=0;
 if(['smile','serious','embarrassed'].includes(expression)){
  writeFileSync(`${work}/iris-before/frame-${expression}.png`,encode(1024,1536,pixels));
  for(let eye=0;eye<eyeBoxes.length;eye++){
   const [x,y,w,h]=eyeBoxes[eye],samples=[];
   for(let row=y;row<y+h;row++)for(let col=x;col<x+w;col++){
    const i=(row*1024+col)*4,[hue,saturation,value]=hsv(...pixels.subarray(i,i+3));
    if(hue>25&&hue<65&&saturation>.18&&value>.23)samples.push({i,hue,saturation,value});
   }
   const mean=samples.reduce((a,p)=>[a[0]+p.hue,a[1]+p.saturation,a[2]+p.value],[0,0,0]).map(v=>v/samples.length);
   for(const p of samples){const color=rgb(palette[eye].hue+(p.hue-mean[0])*.25,Math.min(1,p.saturation*palette[eye].saturation/mean[1]),Math.min(1,p.value*palette[eye].value/mean[2]));pixels.set(color,p.i);mask.fill(255,p.i,p.i+3);irisChanges++;}
  }
 }
 const irisMaskPath=irisChanges?`${root}/iris-masks/${expression}.png`:null;
 if(irisMaskPath)writeFileSync(irisMaskPath,encode(1024,1536,mask));
 const out=expression==='neutral'?masterBytes:encode(1024,1536,pixels);
 writeFileSync(`${work}/package/frame-${expression}.png`,out);
 const measured=preservationSignatures(out,[roi]);
 assets.push({expression,path,sourcePath,sourceSHA256:sha(source),outputSHA256:sha(out),alphaSHA256:measured.alphaSHA256,outsideROISHA256:measured.outsideROISHA256,faceRGBSHA256:sha(Buffer.concat(Array.from({length:roi[3]},(_,row)=>{const line=Buffer.alloc(roi[2]*3);for(let x=0;x<roi[2];x++){const i=((row+roi[1])*1024+x+roi[0])*4;pixels.copy(line,x*3,i,i+3);}return line;}))),irisMaskPath,irisChanges,approval:expression==='neutral'?'user-approved-2026-10-01':'original-expression-preserved-iris-color-corrected-review-pending'});
}
const protectedAssets=['poses/pose_b_ledger_package.png','medallions/portrait_neutral_256.png'].map(rel=>{
 const path=`public/assets/characters/rina/${rel}`,original=execFileSync('git',['show',`${base}:${path}`],{maxBuffer:10000000});
 if(!original.equals(readFileSync(path)))throw Error(`Protected asset changed: ${path}`);
 return{path,sha256:sha(original)};
});
writeFileSync(`${root}/qa.json`,JSON.stringify({format:'upds-rina-pose-preservation-v1',task:'G4a-RINA-POSE',baseSha:base,method:'Accepted neutral v2 plus original expression RGB face ROI; deterministic masked brown-to-green iris correction explicitly requested; no generation; shared exact alpha and pixels outside face ROI',faceROI:roi,irisCorrection:{expressions:['smile','serious','embarrassed'],eyeBoxes,palette,method:'Brown hue 25..65, saturation >0.18, value >0.23 only inside eye boxes; match measured neutral green palette; preserve dark pupils, white highlights and alpha'},masterSHA256:sha(masterBytes),bounds:[266,28,765,1508],eyeLineYPx:200,assets,protectedAssets},null,2)+'\n');
copyFileSync(`${work}/edit-mask.png`,`${root}/edit-mask.png`);
copyFileSync(`${work}/workflow-api.json`,`${root}/workflow-api.json`);
copyFileSync(`${work}/provenance.json`,`${root}/provenance.json`);
// Explicit integration request: only the five scoped runtime frames are replaced.
for(const asset of assets)copyFileSync(`${work}/package/frame-${asset.expression}.png`,asset.path);
const keys=['miku','onoe','ayuki','emi','kentaro','norihiro','mayu','rina','kurose'];
const all=[];for(const key of keys){const list=execFileSync('git',['ls-tree','-r','--name-only',base,`public/assets/characters/${key}`],{encoding:'utf8'}).trim().split('\n').filter(p=>p.includes('/rig/pose_a/frames/')||p.includes('/poses/')||p.includes('/medallions/'));if(list.length!==7)throw Error(`Unexpected asset set ${key}`);all.push(...list);if(key==='rina')console.log('rina digest',sha(list.sort().map(p=>`${p}\0${sha(readFileSync(p))}\n`).join('')));}
console.log('package digest',sha(all.sort().map(p=>`${p}\0${sha(readFileSync(p))}\n`).join('')));
