import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {handleApi} from './src/http.js';
const run=promisify(execFile);const data=path.resolve(process.env.DATA_DIR||'.data');await mkdir(data+'/receipts',{recursive:true});
const db=new DatabaseSync(data+'/renovation.sqlite');db.exec('CREATE TABLE IF NOT EXISTS workspace (id TEXT PRIMARY KEY, state TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0)');
const storage={
 async read(){const row=db.prepare('SELECT state,revision FROM workspace WHERE id=?').get('home');return row?{state:JSON.parse(row.state),revision:row.revision}:null;},
 async init(state){db.prepare('INSERT OR IGNORE INTO workspace(id,state,revision) VALUES(?,?,0)').run('home',JSON.stringify(state));},
 async save(state,revision){const result=db.prepare('UPDATE workspace SET state=?,revision=revision+1 WHERE id=? AND revision=?').run(JSON.stringify(state),'home',revision);if(!result.changes)throw new Error('Save conflict. Refresh and try again.');},
 async putFile(key,file){await writeFile(data+'/'+key,Buffer.from(await file.arrayBuffer()));await writeFile(data+'/'+key+'.json',JSON.stringify({type:file.type}));},
 async getFile(key){try{return {body:await readFile(data+'/'+key),type:JSON.parse(await readFile(data+'/'+key+'.json','utf8')).type};}catch{return null;}},
 async ocr(key){try{return (await run('tesseract',[data+'/'+key,'stdout'])).stdout;}catch{return '';}}
};
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
 try {const base='http://'+(req.headers.host||'localhost');const url=new URL(req.url,base);let response;
 if(url.pathname.startsWith('/api/')){const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>12*1024*1024)throw Error('Upload too large');chunks.push(c);}const request=new Request(url,{method:req.method,headers:req.headers,...(chunks.length?{body:Buffer.concat(chunks)}:{})});response=await handleApi(request,storage,{local:true});}
 else {let name=url.pathname==='/'||url.pathname==='/signin-with-chatgpt'?'/index.html':url.pathname;const file=path.resolve('public','.'+name);if(!file.startsWith(path.resolve('public')+'/'))throw Error('Not found');try{response=new Response(await readFile(file),{headers:{'content-type':types[path.extname(file)]||'application/octet-stream'}});}catch{response=new Response('Not found',{status:404});}}
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch(error){res.writeHead(400,{'content-type':'application/json'});res.end(JSON.stringify({error:error.message}));}
});server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Renovation Tracker: http://localhost:'+server.address().port));
