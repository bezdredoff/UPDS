import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { decodeRgbaPng } from '../../../tests/helpers/pngRgba.ts';
const root = 'output/art-review/onoe-alpha-v1';
const assetRoot = 'public/assets/characters/onoe/';
const hash = b => createHash('sha256').update(b).digest('hex');
const baseline = 'dda9d1982b5d8241fb1136a2f6285ef72b8207bd';
const crc = b => { let c = 0xffffffff; for (const v of b) { c ^= v; for(let k=0;k<8;k++) c = (c>>>1)^((c&1)?0xedb88320:0); } return (c^0xffffffff)>>>0; };
function chunk(type, data) { const t=Buffer.from(type), n=Buffer.alloc(4), c=Buffer.alloc(4); n.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t,data]))); return Buffer.concat([n,t,data,c]); }
function encode(width,height,pixels) { const ih=Buffer.alloc(13); ih.writeUInt32BE(width); ih.writeUInt32BE(height,4); ih[8]=8; ih[9]=6; const rows=Buffer.alloc((width*4+1)*height); for(let y=0;y<height;y++) pixels.copy(rows,y*(width*4+1)+1,y*width*4,(y+1)*width*4); return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',ih),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]); }
const jobs = [
 {id:'pose-a', files:['neutral','smile','serious','surprised','embarrassed'].map(e=>`rig/pose_a/frames/frame-${e}.png`), left:[[245,386],[260,382],[270,392],[280,389],[290,388],[310,384],[330,380],[340,377],[350,369],[360,364],[370,360],[380,356],[390,352],[400,339],[410,331]], right:[[300,660],[310,664],[320,668],[330,672],[340,676],[350,680],[360,686],[370,691],[380,697],[390,702],[400,708],[410,713],[420,716],[430,718],[440,720],[450,722],[460,723],[470,727],[480,732]]},
 {id:'pose-b',files:['poses/pose_b_evidence_bag.png'], left:[[250,383],[260,393],[270,391],[280,389],[290,387],[300,384],[310,382],[320,373],[330,369],[340,365],[350,362],[360,359],[370,355],[380,349],[390,347],[400,335],[410,333]], right:[[260,650],[270,655],[280,659],[290,663],[300,667],[310,670],[320,675],[330,681],[340,688],[350,693],[360,698],[370,702],[380,707],[390,710],[400,712],[410,716],[420,718],[430,718],[440,719],[450,725],[460,732]]},
 {id:'portrait',files:['medallions/portrait_neutral_256.png'],left:[[105,65],[110,64],[115,60],[120,62],[125,60],[130,66],[135,64],[140,65],[145,64],[150,62],[155,61],[160,58],[165,55],[170,53],[175,51],[180,49],[185,46],[190,38],[195,35]],right:[[135,204],[140,206],[145,210],[150,211],[155,214],[160,217],[165,220],[170,221],[175,224],[180,226],[185,228],[190,229],[195,235],[200,236],[205,237],[210,238],[215,238],[220,238],[225,240]]}
];
jobs[0].left=[[240,390],[250,390],[260,392],[270,393],[280,389],[290,388],[310,384],[330,380],[340,377],[350,369],[360,364],[370,360],[380,356],[390,352],[400,339],[410,331]];
jobs[1].left=[[240,388],[250,391],[260,393],[270,391],[280,389],[290,387],[300,384],[310,382],[320,373],[330,369],[340,365],[350,362],[360,359],[370,355],[380,349],[390,347],[400,335],[410,333]];
// User-approved portrait v2: remove only the outer wire, retain the colored strand.
jobs[2].left=[[115,59],[120,58.5],[125,56.5],[130,55],[135,53.5],[140,51],[145,49],[150,47],[155,45],[160,43],[165,42],[170,40],[175,38.5],[180,37],[185,35.5],[190,33.5]];
jobs[2].right=[[135,205],[140,208],[145,210],[150,213],[155,216],[160,219],[165,222],[170,224],[175,226],[180,227],[185,229],[190,230],[195,232],[200,234],[205,236],[210,237],[215,237],[220,240],[225,240]];
function boundary(points,y) { if(y<points[0][0]||y>points.at(-1)[0])return null; for(let i=1;i<points.length;i++){const [ya,xa]=points[i-1],[yb,xb]=points[i];if(y<=yb)return xa+(xb-xa)*(y-ya)/(yb-ya);} return points.at(-1)[1]; }
function maskFor(w,h,job) { const mask=Buffer.alloc(w*h,255);for(let y=0;y<h;y++){const l=boundary(job.left,y),r=boundary(job.right,y);for(let x=0;x<w;x++)if((l!==null&&x<l)||(r!==null&&x>r))mask[y*w+x]=0;}return mask; }
const assets=[];
// Original baselines must come from the merged commit, not a subsequently edited working tree.
for (const job of jobs) for (const file of job.files) {
  const path = assetRoot + file, backup = `${root}/backup/${path}`;
  const baselineBytes = execFileSync('git', ['show', `${baseline}:${path}`], { maxBuffer: 10 * 1024 * 1024 });
  mkdirSync(dirname(backup), { recursive: true });
  if (!existsSync(backup)) writeFileSync(backup, baselineBytes);
  if (hash(readFileSync(backup)) !== hash(baselineBytes)) throw new Error(`Stale source backup: ${path}`);
}
for(const job of jobs) for(const file of job.files){const path=assetRoot+file, backup=`${root}/backup/${path}`;mkdirSync(dirname(backup),{recursive:true});if(!existsSync(backup))copyFileSync(path,backup);const srcBytes=readFileSync(backup),src=decodeRgbaPng(srcBytes),pixels=Buffer.from(src.pixels),mask=maskFor(src.width,src.height,job);let changes=0;for(let p=0;p<mask.length;p++){if(mask[p]===0&&pixels[p*4+3]>0){pixels[p*4+3]=0;changes++;}}const out=encode(src.width,src.height,pixels),target=`${root}/candidate/${path}`;mkdirSync(dirname(target),{recursive:true});writeFileSync(target,out);const rgb=Buffer.alloc(mask.length*3),protectedPixels=Buffer.from(src.pixels),face=Buffer.alloc(src.width*Math.min(src.height,job.id==='portrait'?100:240)*4);src.pixels.copy(face);let bounds=[src.width,src.height,0,0];for(let p=0;p<mask.length;p++){src.pixels.copy(rgb,p*3,p*4,p*4+3);if(mask[p]===0)protectedPixels[p*4+3]=0;if(pixels[p*4+3]){const x=p%src.width,y=Math.floor(p/src.width);bounds=[Math.min(bounds[0],x),Math.min(bounds[1],y),Math.max(bounds[2],x+1),Math.max(bounds[3],y+1)];}}assets.push({path,mask:job.id,width:src.width,height:src.height,sourceSHA256:hash(srcBytes),outputSHA256:hash(out),rgbSHA256:hash(rgb),protectedPixelsSHA256:hash(protectedPixels),faceSHA256:hash(face),faceRows:face.length/(src.width*4),alphaChanges:changes,bounds});const maskPixels=Buffer.alloc(mask.length*4);for(let p=0;p<mask.length;p++){maskPixels.fill(mask[p],p*4,p*4+3);maskPixels[p*4+3]=255;}mkdirSync(`${root}/masks`,{recursive:true});writeFileSync(`${root}/masks/${job.id}.png`,encode(src.width,src.height,maskPixels));}
for (const asset of assets) { delete asset.faceSHA256; delete asset.faceRows; asset.visualApproval='user-approved-2026-10-01'; }
writeFileSync(`${root}/qa.json`,JSON.stringify({format:'upds-onoe-alpha-cleanup-v1',task:'G4a-ONOE-ALPHA',baseSha:'dda9d1982b5d8241fb1136a2f6285ef72b8207bd',method:'deterministic alpha-only shoulder contour masks; no generation',jobs,assets},null,2)+'\n');
console.log(assets.map(a=>({path:a.path,changes:a.alphaChanges,bounds:a.bounds})));
