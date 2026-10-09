const statuses = ['Not started','In progress','Blocked','Done'];
const categories = ['labor','materials','fixtures','permits'];
function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function text(value, label, max = 300) { if (typeof value !== 'string' || !value.trim() || value.trim().length > max) fail(`${label} is required (maximum ${max} characters).`); return value.trim(); }
function money(value, label = 'Amount') { if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1e10) fail(`${label} must be a finite nonnegative amount.`); return Math.round(value * 100) / 100; }
function date(value) { if (!value) return ''; if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(new Date(value).getTime()) || new Date(value).toISOString().slice(0,10) !== value) fail('Use a valid date in YYYY-MM-DD format.'); return value; }
function id(prefix) { return `${prefix}-${crypto.randomUUID()}`; }
function find(items, value, label) { const item = items.find(item => item.id === value); if (!item) fail(`${label} not found.`,404); return item; }
function role(user) { return String(user?.role || '').toLowerCase(); }
function editor(user) { if (!user || !['owner','partner'].includes(role(user))) fail('This action requires an owner or partner.',403); }
const projectKeys = ['project','rooms','tasks','quotes','expenses','receiptDrafts'];
function archiveProject(state) { return Object.fromEntries(projectKeys.map(key => [key,structuredClone(state[key] ?? [])])); }
function dependenciesValid(tasks) { const byId = new Map(tasks.map(t => [t.id,t])); const visiting = new Set(), visited = new Set(); function visit(t) { if (visiting.has(t.id)) fail('Task dependencies cannot contain a cycle.'); if (visited.has(t.id)) return; visiting.add(t.id); for (const dependency of t.dependencies || []) { if (!byId.has(dependency)) fail('Dependency task not found.'); visit(byId.get(dependency)); } visiting.delete(t.id); visited.add(t.id); } tasks.forEach(visit); }
export function publicState(state,user) {
  if (!user) fail('Sign in required.',401);
  if (role(user) !== 'contractor') return structuredClone(state);
  const tasks = state.tasks.filter(t => (t.contractorId || t.assigneeId) === (user.contractorId || user.id));
  const rooms = state.rooms.filter(r => tasks.some(t => t.roomId === r.id)).map(({id,name,projectId}) => ({id,name,projectId}));
  return {project:{id:state.project.id,name:state.project.name},rooms,tasks:tasks.map(t=>({...structuredClone(t),blockedCount:(t.dependencies||[]).filter(id=>state.tasks.find(d=>d.id===id)?.status!=='Done').length})),contractors:(state.contractors || []).filter(c => c.id === (user.contractorId || user.id)).map(({id,name}) => ({id,name}))};
}
export function applyAction(input,user,body) {
  if (!user) fail('Sign in required.',401);
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail('Action body is required.');
  const state = structuredClone(input), action = body.action || body.type;
  const list = name => state[name] ||= [];
  if (action === 'task.move' || action === 'task.save') {
    const patch = action === 'task.move' ? body : body.task;
    if (!patch || typeof patch !== 'object') fail('Task is required.');
    const previous = patch.id ? find(list('tasks'),patch.id,'Task') : null;
    if (role(user) === 'contractor') {
      if (!previous || (previous.contractorId || previous.assigneeId) !== (user.contractorId || user.id)) fail('You can only update your assigned tasks.',403);
      if (Object.keys(patch).some(k => !['id','status','notes','action','type'].includes(k))) fail('Contractors can update status and notes only.',403);
    } else editor(user);
    const task = previous ? {...previous} : {id:id('task'),status:'Not started',dependencies:[],order:list('tasks').length};
    if (role(user) !== 'contractor' && action === 'task.save') {
      task.title = text(patch.title ?? task.title,'Task title');
      task.roomId = find(list('rooms'),patch.roomId ?? task.roomId,'Room').id;
      task.contractorId = patch.contractorId ?? patch.assigneeId ?? task.contractorId ?? '';
      if (task.contractorId) find(list('contractors'),task.contractorId,'Contractor');
      task.dueDate = date(patch.dueDate ?? task.dueDate);
      if (patch.startDate !== undefined) task.startDate = date(patch.startDate);
      if (task.startDate && task.dueDate && task.startDate > task.dueDate) fail('Task due date must be on or after its start date.');
      if (patch.dependencies !== undefined) { if (!Array.isArray(patch.dependencies) || patch.dependencies.some(d => typeof d !== 'string')) fail('Dependencies must be task IDs.'); task.dependencies = [...new Set(patch.dependencies)]; }
    }
    if (patch.notes !== undefined) { if (typeof patch.notes !== 'string' || patch.notes.length > 5000) fail('Notes are too long.'); task.notes = patch.notes; }
    if (patch.status !== undefined) { if (!statuses.includes(patch.status)) fail('Invalid task status.'); task.status = patch.status; }
    const tasks = list('tasks').filter(t => t.id !== task.id).concat(task);
    dependenciesValid(tasks);
    if (task.status === 'Done' && task.dependencies.some(d => find(tasks,d,'Task').status !== 'Done')) fail('Finish dependency tasks before marking this task done.');
    if (previous) Object.assign(previous,task); else state.tasks.push(task);
  } else {
    editor(user);
    if (action === 'task.reorder') {
      if (!Array.isArray(body.ids) || new Set(body.ids).size !== body.ids.length) fail('Task IDs must be unique.');
      body.ids.forEach((value,index) => { find(list('tasks'),value,'Task').order = index; });
    } else if (action === 'project.create') {
      const patch = body.project || body;
      const project = {id:id('project'),name:text(patch.name,'Project name'),contingency:money(patch.contingency ?? 0,'Contingency'),startDate:date(patch.startDate),endDate:date(patch.endDate)};
      if (project.startDate && project.endDate && project.startDate > project.endDate) fail('Project end date must be on or after its start date.');
      list('archivedProjects').push(archiveProject(state));
      state.project = project; for (const key of projectKeys.slice(1)) state[key] = [];
    } else if (action === 'project.switch') {
      const projectId = body.id || body.projectId;
      if (projectId !== state.project.id) {
        const index = list('archivedProjects').findIndex(entry => entry.project.id === projectId);
        if (index < 0) fail('Project not found.',404);
        const target = state.archivedProjects.splice(index,1)[0];
        state.archivedProjects.push(archiveProject(state));
        for (const key of projectKeys) state[key] = target[key] ?? [];
      }
    } else if (action === 'project.save') {
      const patch = body.project || body;
      if (patch.id && patch.id !== state.project.id) fail('Project not found.',404);
      if (patch.name !== undefined) state.project.name = text(patch.name,'Project name');
      if (patch.startDate !== undefined) state.project.startDate = date(patch.startDate);
      if (patch.endDate !== undefined) state.project.endDate = date(patch.endDate);
      if (patch.address !== undefined) state.project.address = text(patch.address,'Address',1000);
      if (state.project.startDate && state.project.endDate && state.project.startDate > state.project.endDate) fail('Project end date must be on or after its start date.');
    } else if (action === 'room.save' || action === 'room.create') {
      const patch = body.room || body;
      const room = patch.id ? find(list('rooms'),patch.id,'Room') : {id:id('room'),budget:0,categories:{labor:0,materials:0,fixtures:0,permits:0}};
      room.name = text(patch.name ?? room.name,'Room name');
      if (patch.projectId && patch.projectId !== state.project.id) fail('Project not found.');
      if (patch.budget !== undefined) room.budget = money(patch.budget,'Room budget');
      if (patch.categories !== undefined || patch.categoryBudgets !== undefined) { room.categories = {}; for (const category of categories) room.categories[category] = money((patch.categories || patch.categoryBudgets)[category] ?? 0,'Category budget'); }
      if (!patch.id) list('rooms').push(room);
    } else if (action === 'contingency.set') {
      state.project.contingency = money(body.amount,'Contingency');
    } else if (action === 'quote.add') {
      const q = body.quote;
      if (!q) fail('Quote is required.');
      const room = find(list('rooms'),q.roomId,'Room');
      const contractor = find(list('contractors'),q.contractorId,'Contractor');
      if (!categories.includes(q.category)) fail('Invalid budget category.');
      const taskIds = q.taskIds || []; if (!Array.isArray(taskIds)) fail('Task IDs must be an array.'); taskIds.forEach(t => {if (find(list('tasks'),t,'Task').roomId !== room.id) fail('Quote tasks must belong to the same room.');});
      list('quotes').push({id:id('quote'),roomId:room.id,contractorId:contractor.id,job:text(q.job || q.title,'Job'),category:q.category,amount:money(q.amount),taskIds,status:'pending',note:(q.notes||q.note) ? text(q.notes||q.note,'Notes',5000) : ''});
    } else if (action === 'quote.select') {
      const quote = find(list('quotes'),body.id,'Quote');
      list('quotes').filter(q => q.roomId === quote.roomId && q.job === quote.job).forEach(q => { q.status = q.id === quote.id ? 'selected' : 'pending'; });
      for (const taskId of quote.taskIds || []) find(list('tasks'),taskId,'Task').contractorId = quote.contractorId;
    } else if (action === 'expense.add' || action === 'expense.edit') {
      const patch = body.expense; if (!patch) fail('Expense is required.');
      const previous = action === 'expense.edit' ? find(list('expenses'),patch.id || body.id,'Expense') : null;
      const e = {...previous,...patch};
      find(list('rooms'),e.roomId,'Room'); if (!categories.includes(e.category)) fail('Invalid budget category.');
      if (e.quoteId) { const quote = find(list('quotes'),e.quoteId,'Quote'); if (quote.roomId !== e.roomId || quote.category !== e.category) fail('Expense must match the quote room and category.'); }
      const amount = money(e.amount);
      const receiptId = e.receiptDraftId || e.receiptId || '';
      const draft = receiptId && !previous ? find(list('receiptDrafts'),receiptId,'Receipt draft') : null;
      const expense = {id:previous?.id || id('expense'),roomId:e.roomId,category:e.category,vendor:text(e.vendor,'Vendor'),date:date(e.date) || new Date().toISOString().slice(0,10),amount,quoteId:e.quoteId || '',note:(e.note || e.notes) ? text(e.note || e.notes,'Expense note',5000) : '',status:previous && amount <= previous.amount ? previous.status : 'pending',receiptId,receiptUrl:draft?.receiptUrl || draft?.url || previous?.receiptUrl || e.receiptUrl || ''};
      if (expense.receiptUrl && (typeof expense.receiptUrl !== 'string' || !/^\/(?:api\/files\/|(?:api\/)?(?:receipts|uploads)\/)[A-Za-z0-9_.-]+$/.test(expense.receiptUrl))) fail('Invalid receipt URL.');
      if (previous) Object.assign(previous,expense); else list('expenses').push(expense);
      if (draft) state.receiptDrafts = state.receiptDrafts.filter(d => d.id !== draft.id);
    } else if (action === 'expense.approve') {
      const expense = find(list('expenses'),body.id,'Expense'); expense.status = 'approved'; expense.approvedBy = user.id;
    } else if (action === 'invite.create') {
      const email = text(body.email,'Email',254).toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Use a valid email address.');
      const inviteRole = String(body.role || '').toLowerCase();
      if (!['partner','contractor'].includes(inviteRole)) fail('Invitation role must be partner or contractor.');
      if (list('invitations').some(i => i.email === email && i.status === 'pending')) fail('A pending invitation already exists for this email.');
      if (body.projectId && body.projectId !== state.project.id) fail('Project not found.');
      let contractorId = null;
      const inviteName = body.name ? text(body.name,'Invite name') : email.split('@')[0];
      if (inviteRole === 'contractor') {
        const contractor = body.contractorId ? find(list('contractors'),body.contractorId,'Contractor') : list('contractors').find(c => c.email?.toLowerCase() === email);
        if (contractor) contractorId = contractor.id;
        else { contractorId = id('contractor'); list('contractors').push({id:contractorId,name:inviteName,email,company:body.company ? text(body.company,'Company') : ''}); }
      }
      list('invitations').push({id:id('invite'),contractorId,email,role:inviteRole[0].toUpperCase()+inviteRole.slice(1),name:body.name ? text(body.name,'Invite name') : email.split('@')[0],projectId:body.projectId || state.project.id,status:'pending',createdAt:new Date().toISOString()});
    } else if (action === 'invite.revoke') { const invite=find(list('invitations'),body.id,'Invitation'); invite.status='revoked'; state.members=state.members.filter(m=>m.email?.toLowerCase()!==invite.email || String(m.role).toLowerCase()==='owner'); }
    else fail('Unknown action.');
  }
  return state;
}
