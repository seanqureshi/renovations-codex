import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleState} from '../src/domain.js';
import {applyAction,publicState} from '../src/actions.js';
const state = () => structuredClone(sampleState);
const owner = {id:'owner',role:'Owner'};
test('contractor view contains no financial or team data and cannot change owner fields', () => {
 const s=state(), task=s.tasks.find(t=>t.contractorId), contractor={id:'contractor',role:'Contractor',contractorId:task.contractorId};
 const view=publicState(s,contractor); assert.equal(view.expenses,undefined); assert.equal(view.quotes,undefined); assert.equal(view.members,undefined); assert.equal(view.project.contingency,undefined); assert.ok(view.tasks.every(t=>t.contractorId===contractor.contractorId)); assert.ok(view.rooms.every(r=>r.budget===undefined));
 assert.throws(()=>applyAction(s,contractor,{action:'task.save',task:{id:task.id,title:'Hijack'}}),/status and notes/);
 assert.throws(()=>applyAction(s,contractor,{action:'contingency.set',amount:1}),/owner or partner/);
});
test('dependencies reject cycles and premature completion',()=>{
 const s=state(), a=s.tasks[0], b=s.tasks[1]; a.dependencies=[]; b.dependencies=[a.id]; a.status='Not started';
 assert.throws(()=>applyAction(s,owner,{action:'task.move',id:b.id,status:'Done'}),/Finish dependency/);
 assert.throws(()=>applyAction(s,owner,{action:'task.save',task:{id:a.id,dependencies:[b.id]}}),/cycle/);
 assert.equal(s.tasks[0].status,'Not started');
});
test('expense amount validated; partner approves',()=>{
 const s=state(); assert.throws(()=>applyAction(s,owner,{action:'expense.add',expense:{roomId:s.rooms[0].id,category:'labor',vendor:'Builder',amount:-1}}),/nonnegative/);
 const next=applyAction(s,owner,{action:'expense.add',expense:{roomId:s.rooms[0].id,category:'labor',vendor:'Builder',amount:42}});
 const expense=next.expenses.at(-1); assert.equal(expense.status,'pending'); assert.equal(applyAction(next,{id:'partner',role:'Partner'},{action:'expense.approve',id:expense.id}).expenses.at(-1).status,'approved');
});
test('chosen quote replaces competing bid and links assigned work',()=>{
 const s=state(), quote=s.quotes.find(q=>q.taskIds.length); const next=applyAction(s,owner,{action:'quote.select',id:quote.id}); assert.equal(next.quotes.find(q=>q.id===quote.id).status,'selected'); for(const id of quote.taskIds) assert.equal(next.tasks.find(t=>t.id===id).contractorId,quote.contractorId);
});
test('project creation archives records and switching restores them without removing team',()=>{
 const s=state(); s.receiptDrafts=[{id:'receipt-1',receiptUrl:'/receipts/receipt-1.png'}];
 const next=applyAction(s,owner,{action:'project.create',name:'Second home'});
 assert.equal(next.archivedProjects[0].project.id,s.project.id); assert.deepEqual(next.rooms,[]); assert.deepEqual(next.receiptDrafts,[]);
 const restored=applyAction(next,owner,{action:'project.switch',id:s.project.id});
 assert.deepEqual(restored.rooms,s.rooms); assert.deepEqual(restored.receiptDrafts,s.receiptDrafts); assert.deepEqual(restored.members,s.members); assert.equal(restored.archivedProjects[0].project.name,'Second home');
 const renamed=applyAction(restored,owner,{action:'project.save',project:{name:'Updated home'}}); assert.equal(renamed.project.name,'Updated home');
});
test('contractor invitations bind contractor identity and validate existing identities',()=>{
 const s=state(); const next=applyAction(s,owner,{action:'invite.create',email:'new@example.com',role:'Contractor',name:'New Builder'});
 const invite=next.invitations.at(-1); assert.ok(invite.contractorId); assert.equal(next.contractors.at(-1).id,invite.contractorId);
 assert.throws(()=>applyAction(s,owner,{action:'invite.create',email:'new@example.com',role:'contractor',contractorId:'missing'}),/Contractor not found/);
 const partner=applyAction(s,owner,{action:'invite.create',email:'partner@example.com',role:'partner'}); assert.equal(partner.invitations.at(-1).contractorId,null);
});
test('receipt confirmation consumes draft and amount increase resets approval',()=>{
 const s=state(); s.receiptDrafts=[{id:'receipt-1',receiptUrl:'/receipts/receipt-1.png'}];
 const next=applyAction(s,owner,{action:'expense.add',expense:{roomId:s.rooms[0].id,category:'labor',vendor:'Builder',amount:100,receiptDraftId:'receipt-1'}});
 assert.equal(next.receiptDrafts.length,0); const expense=next.expenses.at(-1); assert.equal(expense.receiptUrl,'/receipts/receipt-1.png');
 const approved=applyAction(next,owner,{action:'expense.approve',id:expense.id});
 const lower=applyAction(approved,owner,{action:'expense.edit',expense:{id:expense.id,amount:90}}); assert.equal(lower.expenses.at(-1).status,'approved');
 const higher=applyAction(lower,owner,{action:'expense.edit',expense:{id:expense.id,amount:110}}); assert.equal(higher.expenses.at(-1).status,'pending'); assert.equal(higher.expenses.at(-1).receiptUrl,expense.receiptUrl);
});
