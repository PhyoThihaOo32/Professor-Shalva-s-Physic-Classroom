import {cp,mkdir,readFile,readdir,rm,writeFile,symlink,stat,chmod} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {createConnection} from 'node:net';
import {homedir} from 'node:os';
import {join,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
// A disposable local snapshot avoids iCloud file eviction/HMR in this Desktop workspace.
// Original sources are never removed or edited. Restart to copy subsequent source edits.
const source=resolve(fileURLToPath(new URL('..',import.meta.url)));
const folder=createHash('sha256').update(source).digest('hex').slice(0,10);
const target=join(homedir(),'.cache','chalklight-physics-runtime',`preview-${folder}`);
const marker=join(target,'.chalklight-preview-source');
await new Promise((resolveCheck,reject)=>{const socket=createConnection({host:'127.0.0.1',port:3000});socket.once('connect',()=>{socket.destroy();reject(new Error('Port 3000 is in use. Stop the current preview before restarting its snapshot.'));});socket.once('error',err=>{if(err.code==='ECONNREFUSED')resolveCheck();else reject(err);});});
await mkdir(target,{recursive:true});
let previous='';try{previous=await readFile(marker,'utf8');}catch{}
if(previous&&previous!==source)throw new Error('Local preview directory belongs to a different source.');
if(!previous&&(await readdir(target)).length)throw new Error('Refusing to overwrite an unrecognized preview directory.');
await writeFile(marker,source,{mode:0o600});
const ignored=new Set(['node_modules','.next','.chalklight-build-cache','.next-cloud-cache','.git','docs','test-results','playwright-report','tsconfig.tsbuildinfo','.chalklight-preview-source']);
const entries=await readdir(source,{withFileTypes:true});
// Delete only prior snapshot entries, preserving its marker and dependency link.
for(const entry of await readdir(target)){if(!['.chalklight-preview-source','node_modules'].includes(entry))await rm(join(target,entry),{recursive:true,force:true});}
for(const entry of entries){if(ignored.has(entry.name)||entry.name.startsWith('.next')||entry.name.startsWith('.chalklight')||entry.name.endsWith('.tsbuildinfo'))continue;await cp(join(source,entry.name),join(target,entry.name),{recursive:true,dereference:true});}
try{await stat(join(target,'node_modules'));}catch{await symlink(join(source,'node_modules'),join(target,'node_modules'),'dir');}
await mkdir(join(target,'docs'),{recursive:true});
try{await chmod(join(target,'.env'),0o600);}catch(error){if(error.code!=='ENOENT')throw error;}
console.log(`Local preview snapshot: ${relative(homedir(),target)}. Restart this command after editing the source.`);
const child=spawn(process.execPath,[join(target,'node_modules','next','dist','bin','next'),'dev','--webpack','--hostname','127.0.0.1'],{cwd:target,stdio:'inherit',env:process.env});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
