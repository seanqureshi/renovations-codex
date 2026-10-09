import {handleApi} from './src/http.js';
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(!request.headers.get('oai-authenticated-user-email')){
 if(url.pathname.startsWith('/api/'))return new Response(JSON.stringify({error:'Sign in to access your renovation.'}),{status:401,headers:{'content-type':'application/json'}});
 return Response.redirect(url.origin+'/signin-with-chatgpt?return_to='+encodeURIComponent(url.pathname+url.search),302);
 }
 if(url.pathname.startsWith('/api/')){
 const storage={
 async read(){const row=await env.DB.prepare('SELECT state,revision FROM workspace WHERE id=?').bind('home').first();return row?{state:JSON.parse(row.state),revision:row.revision}:null;},
 async init(state){await env.DB.prepare('INSERT OR IGNORE INTO workspace(id,state,revision) VALUES(?,?,0)').bind('home',JSON.stringify(state)).run();},
 async save(state,revision){const r=await env.DB.prepare('UPDATE workspace SET state=?,revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(state),'home',revision).run();if(!r.meta.changes)throw Error('Save conflict. Refresh and try again.');},
 async putFile(key,file){await env.BUCKET.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type}});},
 async getFile(key){const file=await env.BUCKET.get(key);return file?{body:file.body,type:file.httpMetadata.contentType}:null;}
 };
 return handleApi(request,storage);
 }
 return env.ASSETS.fetch(request);
}};
