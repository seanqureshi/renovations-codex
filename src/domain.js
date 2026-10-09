export const categories = ['labor', 'materials', 'fixtures', 'permits'];
export const statuses = ['Not started', 'In progress', 'Blocked', 'Done'];

export const sampleState = {
  project: { id: 'home', name: 'Maple House Renovation', address: '142 Maple Avenue', startDate: '2026-10-05', endDate: '2026-11-27', contingency: 8000 },
  rooms: [
    { id: 'kitchen', name: 'Kitchen', budget: 48000, categories: { labor: 22000, materials: 14000, fixtures: 10000, permits: 2000 } },
    { id: 'bath', name: 'Primary bath', budget: 29000, categories: { labor: 14000, materials: 7000, fixtures: 6500, permits: 1500 } },
  ],
  contractors: [
    { id: 'c1', name: 'Marcus Reed', company: 'Reed Construction', email: 'marcus@reed.example' },
    { id: 'c2', name: 'Elena Torres', company: 'Brightline Electric', email: 'elena@brightline.example' },
    { id: 'c3', name: 'James Park', company: 'Park Plumbing', email: 'james@park.example' },
  ],
  tasks: [
    { id: 't1', title: 'Finalize layout & finishes', roomId: 'kitchen', status: 'Done', contractorId: null, startDate: '2026-10-05', dueDate: '2026-10-07', dependencies: [], order: 0 },
    { id: 't2', title: 'Remove cabinets & old flooring', roomId: 'kitchen', status: 'Done', contractorId: 'c1', startDate: '2026-10-08', dueDate: '2026-10-12', dependencies: ['t1'], order: 1 },
    { id: 't3', title: 'Electrical rough-in', roomId: 'kitchen', status: 'In progress', contractorId: 'c2', startDate: '2026-10-13', dueDate: '2026-10-19', dependencies: ['t2'], order: 2 },
    { id: 't4', title: 'Patch drywall & paint', roomId: 'kitchen', status: 'Blocked', contractorId: 'c1', startDate: '2026-10-20', dueDate: '2026-10-24', dependencies: ['t3'], order: 3 },
    { id: 't5', title: 'Install cabinetry & countertops', roomId: 'kitchen', status: 'Not started', contractorId: 'c1', startDate: '2026-10-26', dueDate: '2026-11-09', dependencies: ['t4'], order: 4 },
    { id: 't6', title: 'Install appliances & final inspection', roomId: 'kitchen', status: 'Not started', contractorId: 'c2', startDate: '2026-11-10', dueDate: '2026-11-13', dependencies: ['t5'], order: 5 },
    { id: 't7', title: 'Order tile & vanity', roomId: 'bath', status: 'Done', contractorId: null, startDate: '2026-10-05', dueDate: '2026-10-09', dependencies: [], order: 6 },
    { id: 't8', title: 'Demo bathroom', roomId: 'bath', status: 'In progress', contractorId: 'c1', startDate: '2026-10-13', dueDate: '2026-10-16', dependencies: ['t7'], order: 7 },
    { id: 't9', title: 'Plumbing rough-in', roomId: 'bath', status: 'Not started', contractorId: 'c3', startDate: '2026-10-19', dueDate: '2026-10-23', dependencies: ['t8'], order: 8 },
    { id: 't10', title: 'Waterproof & tile shower', roomId: 'bath', status: 'Not started', contractorId: 'c1', startDate: '2026-10-26', dueDate: '2026-11-06', dependencies: ['t9'], order: 9 },
    { id: 't11', title: 'Install vanity & fixtures', roomId: 'bath', status: 'Not started', contractorId: 'c3', startDate: '2026-11-09', dueDate: '2026-11-13', dependencies: ['t10'], order: 10 },
  ],
  quotes: [
    { id: 'q1', job: 'Kitchen cabinetry installation', roomId: 'kitchen', contractorId: 'c1', amount: 9200, category: 'labor', taskIds: ['t5'], status: 'selected', note: 'Includes installation, trim and cleanup. 2-year workmanship warranty.' },
    { id: 'q2', job: 'Kitchen cabinetry installation', roomId: 'kitchen', contractorId: 'c2', amount: 10800, category: 'labor', taskIds: ['t5'], status: 'pending', note: 'Installation and finish work. Materials excluded.' },
    { id: 'q3', job: 'Kitchen cabinetry installation', roomId: 'kitchen', contractorId: 'c3', amount: 9750, category: 'labor', taskIds: ['t5'], status: 'pending', note: 'Install and haul-away included. Available October 26.' },
    { id: 'q4', job: 'Bathroom plumbing', roomId: 'bath', contractorId: 'c3', amount: 4800, category: 'labor', taskIds: ['t9', 't11'], status: 'selected', note: 'Rough-in and final fixture installation, permit coordination.' },
    { id: 'q5', job: 'Bathroom plumbing', roomId: 'bath', contractorId: 'c1', amount: 5400, category: 'labor', taskIds: ['t9', 't11'], status: 'pending', note: 'Labor only. Fixtures supplied by owner.' },
  ],
  expenses: [
    { id: 'e1', roomId: 'kitchen', category: 'materials', vendor: 'Cabinet & Co.', date: '2026-10-06', amount: 8900, status: 'approved', note: 'Cabinet order deposit' },
    { id: 'e2', roomId: 'kitchen', category: 'fixtures', vendor: 'Bespoke Appliances', date: '2026-10-07', amount: 9300, status: 'approved', note: 'Range, refrigerator and dishwasher' },
    { id: 'e3', roomId: 'kitchen', category: 'labor', vendor: 'Reed Construction', date: '2026-10-12', amount: 3200, status: 'approved', note: 'Kitchen demolition' },
    { id: 'e4', roomId: 'kitchen', category: 'permits', vendor: 'City Building Department', date: '2026-10-06', amount: 1150, status: 'approved', note: 'Building and electrical permits' },
    { id: 'e5', roomId: 'bath', category: 'materials', vendor: 'Tile Studio', date: '2026-10-08', amount: 4200, status: 'approved', note: 'Porcelain tile and waterproofing' },
    { id: 'e6', roomId: 'bath', category: 'fixtures', vendor: 'Waterworks Supply', date: '2026-10-09', amount: 3800, status: 'approved', note: 'Vanity and shower fixtures' },
    { id: 'e7', roomId: 'bath', category: 'labor', vendor: 'Reed Construction', date: '2026-10-15', amount: 1800, status: 'pending', note: 'Bathroom demolition — awaiting partner approval' },
  ],
  members: [
    { id: 'm1', name: 'Alex Morgan', email: 'alex@example.com', role: 'Owner' },
    { id: 'm2', name: 'Sam Morgan', email: 'sam@example.com', role: 'Partner' },
    { id: 'm3', name: 'Marcus Reed', email: 'marcus@reed.example', role: 'Contractor', contractorId: 'c1' },
    { id: 'm4', name: 'Elena Torres', email: 'elena@brightline.example', role: 'Contractor', contractorId: 'c2' },
    { id: 'm5', name: 'James Park', email: 'james@park.example', role: 'Contractor', contractorId: 'c3' },
  ],
  invitations: [],
};

export function blockedBy(state, task) {
  return (task.dependencies || []).map(id => state.tasks.find(t => t.id === id)).filter(t => t && t.status !== 'Done');
}

export function validateTaskDependencies(state, taskId, dependencyIds) {
  if (dependencyIds.includes(taskId)) return 'A task cannot depend on itself.';
  if (dependencyIds.some(id => !state.tasks.some(t => t.id === id))) return 'Dependency task does not exist.';
  const visited = new Set();
  function reachesTask(id) {
    if (id === taskId) return true;
    if (visited.has(id)) return false;
    visited.add(id);
    return (state.tasks.find(t => t.id === id)?.dependencies || []).some(reachesTask);
  }
  return dependencyIds.some(reachesTask) ? 'Dependencies cannot form a cycle.' : null;
}

export function budgetSummary(state) {
  const rooms = state.rooms.map(room => {
    const categoryTotals = Object.fromEntries(categories.map(category => {
      const spent = state.expenses.filter(e => e.roomId === room.id && e.category === category && e.status !== 'rejected').reduce((sum, e) => sum + Number(e.amount), 0);
      const committed = state.quotes.filter(q => q.roomId === room.id && q.category === category && q.status === 'selected').reduce((sum, q) => {
        // Payments linked to an accepted quote consume its commitment instead of counting twice.
        const paid = state.expenses.filter(e => e.quoteId === q.id && e.status !== 'rejected').reduce((s, e) => s + Number(e.amount), 0);
        return sum + Math.max(0, Number(q.amount) - paid);
      }, 0);
      const budget = Number(room.categories[category] || 0);
      return [category, { budget, spent, committed, allocated: spent + committed, remaining: budget - spent - committed, ratio: budget ? (spent + committed) / budget : spent + committed > 0 ? Infinity : 0, warning: spent + committed > budget * 0.9 }];
    }));
    const spent = Object.values(categoryTotals).reduce((s, c) => s + c.spent, 0);
    const committed = Object.values(categoryTotals).reduce((s, c) => s + c.committed, 0);
    return { ...room, categories: categoryTotals, spent, committed, allocated: spent + committed, remaining: room.budget - spent - committed, ratio: room.budget ? (spent + committed) / room.budget : 0, warning: spent + committed > room.budget * 0.9 };
  });
  const spent = rooms.reduce((s, r) => s + r.spent, 0);
  const committed = rooms.reduce((s, r) => s + r.committed, 0);
  const roomBudget = rooms.reduce((s, r) => s + Number(r.budget), 0);
  const contingency = Number(state.project.contingency || 0);
  const contingencyUsed = rooms.reduce((s, r) => s + Math.max(0, -r.remaining), 0);
  return { rooms, spent, committed, allocated: spent + committed, roomBudget, totalBudget: roomBudget + contingency, remaining: roomBudget + contingency - spent - committed, contingency, contingencyUsed, contingencyRemaining: contingency - contingencyUsed };
}

export function visibleTasks(state, member) {
  return member.role === 'Contractor' ? state.tasks.filter(t => t.contractorId === member.contractorId) : state.tasks;
}
export function canEditTask(state, member, task) {
  return member.role === 'Owner' || member.role === 'Partner' || (member.role === 'Contractor' && Boolean(member.contractorId) && task.contractorId === member.contractorId);
}
export function selectQuote(state, quoteId) {
  const selected = state.quotes.find(q => q.id === quoteId);
  if (!selected) throw new Error('Quote does not exist.');
  return { ...state, quotes: state.quotes.map(q => q.roomId === selected.roomId && q.job === selected.job ? { ...q, status: q.id === quoteId ? 'selected' : 'pending' } : q), tasks: state.tasks.map(t => selected.taskIds.includes(t.id) ? { ...t, contractorId: selected.contractorId } : t) };
}
