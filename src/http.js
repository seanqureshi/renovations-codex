import {sampleState} from './domain.js';
import {applyAction,publicState} from './actions.js';
import {extractReceipt} from './receipt.js';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
export async function handleApi(request,storage,{local=false,origin,ownerEmail}={}) {
 try {
 const url=new URL(request.url);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
 if(request.method==='POST'&&request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json({error:'Invalid request origin'},403);
 let email=request.headers.get('oai-authenticated-user-email'); const uid=request.headers.get('oai-authenticated-user-id');
 if(local&&!email)email='alex@renovation.example';
 if(!email)return json({error:'Sign in to access this renovation.'},401);
 email=email.toLowerCase();
 const configuredOwner=ownerEmail?.trim().toLowerCase();
 if(!local&&!configuredOwner)return json({error:'Project owner setup is unavailable. Please contact the Site owner.'},503);
 let record=await storage.read();
 if(!record) {
 if(configuredOwner&&email!==configuredOwner)return json({error:'The project owner must open this renovation first.'},403);
 const state=structuredClone(sampleState); const owner=state.members.find(m=>m.role.toLowerCase()==='owner'); owner.email=email;owner.authId=uid||'local-owner';
 await storage.init(state); record=await storage.read();
 }
 let state=record.state;
 if(configuredOwner){
 const owner=state.members.find(m=>m.role.toLowerCase()==='owner');
 if(owner&&owner.email.toLowerCase()!==configuredOwner){owner.email=configuredOwner;delete owner.authId;await storage.save(state,record.revision);record=await storage.read();state=record.state;}
 }
 let user=state.members.find(m=>m.email.toLowerCase()===email);
 if(!user){
 const invitation=state.invitations.find(i=>i.email.toLowerCase()===email&&!['revoked','accepted'].includes(i.status));
 if(!invitation)return json({error:'Your email has not been invited to this project.'},403);
 user={id:crypto.randomUUID(),name:email.split('@')[0],email,role:invitation.role,contractorId:invitation.contractorId};state.members.push(user);invitation.status='accepted';
 await storage.save(state,record.revision);record=await storage.read();state=record.state;
 }
 if(user.role.toLowerCase()==='owner'&&configuredOwner===email&&uid&&user.authId!==uid){user.authId=uid;await storage.save(state,record.revision);record=await storage.read();state=record.state;user=state.members.find(m=>m.id===user.id);}
 const demo=request.headers.get('x-demo-role')||url.searchParams.get('demo');
 if(demo){
 if(user.role.toLowerCase()!=='owner')return json({error:'Only the owner can preview sample roles.'},403);
 if(demo==='partner')user={...state.members.find(m=>m.role.toLowerCase()==='partner'),role:'Partner',preview:true};
 else if(demo.startsWith('contractor:')){const id=demo.slice(11);if(!state.contractors.some(c=>c.id===id))return json({error:'Unknown contractor'},400);user={id:'preview',name:state.contractors.find(c=>c.id===id).name,role:'Contractor',contractorId:id,preview:true};}
 }
 if(url.pathname==='/api/state')return json({state:publicState(state,user),user,revision:record.revision});
 if(user.preview&&request.method==='POST')return json({error:'Role preview is read-only. Switch back to Owner to make changes.'},403);
 if(url.pathname==='/api/action'&&request.method==='POST') {
 const body=await request.json();
 const next=applyAction(state,user,body)||state;
 await storage.save(next,record.revision);
 return json({state:publicState(next,user),user,revision:record.revision+1});
 }
 if(url.pathname==='/api/receipts'&&request.method==='POST') {
 if(user.role.toLowerCase()==='contractor')return json({error:'Contractors cannot access receipts.'},403);
 const form=await request.formData(); const file=form.get('file');
 if(!file||typeof file==='string'||!/^image\/(jpeg|png|webp)$/.test(file.type))return json({error:'Choose a JPG, PNG, or WebP receipt photo.'},400);
 if(file.size>10*1024*1024)return json({error:'Receipt photos must be under 10 MB.'},400);
 const id=crypto.randomUUID(); const key='receipts/'+id;
 await storage.putFile(key,file);
 let text=String(form.get('text')||form.get('ocrText')||'');
 if(!text&&storage.ocr)text=await storage.ocr(key);
 const draft={...extractReceipt(text),id,receiptUrl:'/api/files/'+id,filename:file.name,createdBy:user.id};
 state.receiptDrafts??=[];state.receiptDrafts.push(draft);await storage.save(state,record.revision);
 return json({draft,state:publicState(state,user),user});
 }
 if(url.pathname.startsWith('/api/files/')&&request.method==='GET') {
 if(user.role.toLowerCase()==='contractor')return json({error:'Access denied'},403);
 const id=url.pathname.slice(11);if(!/^[a-f0-9-]{36}$/.test(id))return json({error:'Not found'},404);
 const file=await storage.getFile('receipts/'+id);if(!file)return json({error:'Not found'},404);
 return new Response(file.body,{headers:{'content-type':file.type,'cache-control':'private,max-age=3600','x-content-type-options':'nosniff'}});
 }
 return json({error:'Not found'},404);
 } catch(error) {return json({error:error.message||'Unable to save. Please try again.'},error.status||(/conflict/i.test(error.message)?409:400));}
}
