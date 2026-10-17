import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve, join, extname, sep } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { web: { type: 'string' }, godot: { type: 'string' }, port: { type: 'string', default: '4186' } } });
if (!values.web || !values.godot) throw new Error('--web and --godot export directories are required');
const roots={web:resolve(values.web),godot:resolve(values.godot)};
for(const root of Object.values(roots)) if(!existsSync(join(root,'index.html'))) throw new Error(`Missing index.html: ${root}`);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.wasm':'application/wasm','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ogg':'audio/ogg','.webmanifest':'application/manifest+json'};
createServer((request,response)=>{
  if(!['GET','HEAD'].includes(request.method)){response.writeHead(405);response.end();return;}
  const url=new URL(request.url,'http://localhost');
  // Full Chrome requests an optional root favicon independently of app resources.
  if(url.pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}
  if(url.pathname==='/godot'){response.writeHead(308,{Location:'/godot/'});response.end();return;}
  const kind=url.pathname.startsWith('/godot/')?'godot':'web';
  let relative;
  try{relative=decodeURIComponent(url.pathname).replace(kind==='godot'?/^\/godot\//:/^\/(preview\/)?/,'');}
  catch{response.writeHead(400);response.end();return;}
  const root=roots[kind];
  let file=resolve(root,relative||'index.html');
  if(file!==root&&!file.startsWith(root+sep)){response.writeHead(403);response.end();return;}
  if(!existsSync(file)&&!extname(file)&&kind==='web')file=join(root,'index.html');
  if(!existsSync(file)||!statSync(file).isFile()){response.writeHead(404);response.end('Not found');return;}
  response.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream','Cache-Control':'no-store'});
  if(request.method==='HEAD'){response.end();return;}
  createReadStream(file).pipe(response);
}).listen(Number(values.port),'127.0.0.1',()=>console.log(`Parity previews: http://127.0.0.1:${values.port}/ and /godot/`));
