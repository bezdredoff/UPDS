// Export the isolated Web capture scene without changing project.godot or shipping QA hooks.
import { cpSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, basename, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { godot: { type: 'string' }, output: { type: 'string' }, 'keep-project': { type: 'boolean', default: false }, 'warm-import': { type: 'boolean', default: false } } });
if (!values.godot || !values.output) throw new Error('--godot and --output are required');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = join(root, 'godot');
const output = resolve(values.output);
if (output === root || output.startsWith(source + sep)) throw new Error('Use a dedicated export directory outside the project');
const project = resolve(mkdtempSync(join(tmpdir(), 'upds-godot-parity-')));
cpSync(source, project, { recursive: true, filter: path => !relative(source, path).split(sep).some(s => s === '.godot' || s === '.export') });
function files(directory) {
  return readdirSync(directory,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(directory,e.name)):[join(directory,e.name)]);
}
const digest=createHash('sha256');
for(const path of files(project).filter(p=>!p.endsWith('.uid')).sort()) {
  const name=relative(project,path).replaceAll('\\','/');
  let data=readFileSync(path);
  if(/\.(gd|gdshader|gdshaderinc|tscn|json|godot|cfg|import)$/.test(name)) data=Buffer.from(data.toString('utf8').replaceAll('\r\n','\n'));
  digest.update(name).update('\0').update(data).update('\0');
}
const commit=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true});
const status=spawnSync('git',['status','--porcelain','--','godot'],{cwd:root,encoding:'utf8',windowsHide:true});
const serialImport=process.platform==='win32';
const metadata={sourceHash:digest.digest('hex'),sourceCommit:commit.status===0?commit.stdout.trim():null,sourceTreeClean:status.status===0&&!status.stdout.trim(),fixture:'res://tests/parity_web_capture.tscn',serialImport,warmImport:values['warm-import'],generatedAt:new Date().toISOString()};
writeFileSync(join(project,'tests/parity_capture_build.json'),JSON.stringify(metadata,null,2));
const configPath = join(project, 'project.godot');
const config = readFileSync(configPath, 'utf8');
const main = 'run/main_scene="res://scenes/main_menu.tscn"';
if (!config.includes(main)) throw new Error('Unexpected production entry point');
let captureConfig=config.replace(main, 'run/main_scene="res://tests/parity_web_capture.tscn"');
if(serialImport) {
  // Fresh Windows imports intermittently terminate with STATUS_HEAP_CORRUPTION.
  // This editor-only workaround affects the disposable copy, never the game project.
  if(/^\[editor\]\s*$/m.test(captureConfig)) throw new Error('Review existing editor import settings before overriding them');
  captureConfig+='\n[editor]\nimport/use_multiple_threads=false\n';
}
writeFileSync(configPath, captureConfig);
if(values['warm-import']) {
  // Iteration only: Godot still validates imported resources against source/settings.
  // Final evidence can omit this flag for an entirely fresh import.
  const imported=join(source,'.godot','imported');
  if(!existsSync(imported)) throw new Error('--warm-import requires an existing local Godot import cache');
  mkdirSync(join(project,'.godot'),{recursive:true});
  cpSync(imported,join(project,'.godot','imported'),{recursive:true});
}
mkdirSync(output, { recursive: true });
for (const [name, args] of [
  ['import', ['--headless', '--editor', '--path', project, '--import']],
  ['export', ['--headless', '--path', project, '--export-release', 'Playgama Web', join(output, 'index.html')]],
]) {
  const result = spawnSync(values.godot, args, { encoding: 'utf8', timeout: 180000, windowsHide: true });
  writeFileSync(join(output, `${name}.log`), `${result.stdout}\n${result.stderr}`);
  if (result.error || result.status !== 0 || /SCRIPT ERROR:|ERROR:/.test(result.stderr)) throw new Error(`${name} failed (status=${result.status}, signal=${result.signal}): ${result.error ?? result.stderr}\n${result.stdout?.slice(-2000) ?? ''}`);
}
writeFileSync(join(output, 'capture-build.json'), JSON.stringify({ ...metadata, source, project, projectRetained:values['keep-project'], productionProjectUnchanged: readFileSync(join(source,'project.godot'),'utf8') === config }, null, 2));
if(!values['keep-project']) {
  // Delete only the exact task-owned mkdtemp directory, never a caller-supplied path.
  if(dirname(project)!==resolve(tmpdir())||!basename(project).startsWith('upds-godot-parity-')) throw new Error(`Unexpected temporary project path: ${project}`);
  rmSync(project,{recursive:true,force:true});
}
console.log(`Isolated Godot release capture export: ${output}`);
