import {handleApi} from './src/http.js';
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(!request.headers.get('oai-authenticated-user-email')){
 if(url.pathname.startsWith('/api/'))return new Response(JSON.stringify({error:'Sign in to access your renovation.'}),{status:401,headers:{'content-type':'application/json'}});
 if(url.pathname!=='/'&&!request.headers.get('accept')?.includes('text/html'))return env.ASSETS.fetch(request);
 return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Renovation Tracker</title></head><body style="margin:0;background:#f4f7fc;color:#15283f;font:16px/1.6 system-ui"><main style="max-width:480px;margin:12vh auto;padding:32px"><h1>Renovation Tracker</h1><p>Sign in to open your private renovation workspace.</p><p><a href="/signin-with-chatgpt?return_to=/" target="_top" style="display:inline-block;background:#2463eb;color:white;padding:12px 20px;border-radius:8px;text-decoration:none">Sign in with ChatGPT</a></p><p>If the embedded browser cannot complete sign-in, open this project in Chrome using the same ChatGPT account.</p></main></body></html>`,{headers:{'content-type':'text/html;charset=UTF-8','cache-control':'no-store'}});
 }
 if(url.pathname.startsWith('/api/')){
 const storage={
 async read(){const row=await env.DB.prepare('SELECT state,revision FROM workspace WHERE id=?').bind('home').first();return row?{state:JSON.parse(row.state),revision:row.revision}:null;},
 async init(state){await env.DB.prepare('INSERT OR IGNORE INTO workspace(id,state,revision) VALUES(?,?,0)').bind('home',JSON.stringify(state)).run();},
 async save(state,revision){const r=await env.DB.prepare('UPDATE workspace SET state=?,revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(state),'home',revision).run();if(!r.meta.changes)throw Error('Save conflict. Refresh and try again.');},
 async putFile(key,file){await env.BUCKET.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type}});},
 async getFile(key){const file=await env.BUCKET.get(key);return file?{body:file.body,type:file.httpMetadata.contentType}:null;}
 };
 return handleApi(request,storage,{ownerEmail:env.RENOVATION_OWNER_EMAIL});
 }
 return env.ASSETS.fetch(request);
}};
