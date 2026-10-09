import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleState, budgetSummary, blockedBy, validateTaskDependencies, visibleTasks, canEditTask, selectQuote } from '../src/domain.js';

test('sample budget reconciles rooms, contingency, expenses and selected commitments', () => {
  const summary = budgetSummary(sampleState);
  assert.equal(summary.totalBudget, 85000);
  assert.equal(summary.spent, 32350);
  assert.equal(summary.committed, 14000);
  assert.equal(summary.remaining, 38650);
  assert.equal(summary.rooms[0].categories.fixtures.warning, true);
  assert.equal(summary.contingencyRemaining, 8000);
});
test('payment against quote reduces commitment without double counting', () => {
  const state = structuredClone(sampleState);
  state.expenses.push({ id: 'payment', roomId: 'kitchen', category: 'labor', amount: 3000, status: 'approved', quoteId: 'q1' });
  const before = budgetSummary(sampleState);
  const after = budgetSummary(state);
  assert.equal(after.spent, before.spent + 3000);
  assert.equal(after.committed, before.committed - 3000);
  assert.equal(after.allocated, before.allocated);
});
test('selecting competing bid replaces commitment and updates task assignment', () => {
  const state = selectQuote(sampleState, 'q2');
  assert.equal(state.quotes.find(q => q.id === 'q1').status, 'pending');
  assert.equal(state.tasks.find(t => t.id === 't5').contractorId, 'c2');
  assert.equal(budgetSummary(state).committed, 15600);
  assert.equal(sampleState.tasks.find(t => t.id === 't5').contractorId, 'c1');
});
test('unfinished dependencies block tasks; completed dependencies unblock', () => {
  assert.deepEqual(blockedBy(sampleState, sampleState.tasks.find(t => t.id === 't4')).map(t => t.id), ['t3']);
  assert.deepEqual(blockedBy(sampleState, sampleState.tasks.find(t => t.id === 't3')), []);
});
test('cycles, self dependencies and missing dependencies are rejected', () => {
  assert.match(validateTaskDependencies(sampleState, 't1', ['t6']), /cycle/);
  assert.match(validateTaskDependencies(sampleState, 't1', ['t1']), /itself/);
  assert.match(validateTaskDependencies(sampleState, 't1', ['unknown']), /exist/);
  assert.equal(validateTaskDependencies(sampleState, 't11', ['t10']), null);
});
test('contractor is restricted to own assigned tasks and owners see all', () => {
  const contractor = sampleState.members.find(m => m.id === 'm3');
  const tasks = visibleTasks(sampleState, contractor);
  assert.ok(tasks.length > 0);
  assert.ok(tasks.every(t => t.contractorId === 'c1'));
  assert.equal(canEditTask(sampleState, contractor, sampleState.tasks.find(t => t.id === 't3')), false);
  assert.equal(visibleTasks(sampleState, sampleState.members[0]).length, sampleState.tasks.length);
});
test('overspend allocates contingency and zero budgets still warn', () => {
  const state = structuredClone(sampleState);
  state.expenses.push({ roomId: 'kitchen', category: 'materials', amount: 20000, status: 'approved' });
  const summary = budgetSummary(state);
  assert.ok(summary.contingencyUsed > 0);
  assert.equal(summary.contingencyRemaining, summary.contingency - summary.contingencyUsed);
  state.rooms[0].categories.materials = 0;
  assert.equal(budgetSummary(state).rooms[0].categories.materials.ratio, Infinity);
});
