import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { registerAgent, createGroup } from '../helpers';
import { Expense, ExpenseShare, Group, Settlement } from '../../src/models';

describe('POST /groups/:groupId/expenses', () => {
  it('requires an active session', async () => {
    const res = await request(app).post('/groups/some-id/expenses').send({ amount: 10 });

    expect(res.status).toBe(401);
  });

  it('creates the expense with equal shares and updates the group total', async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice', 'Bob']);
    const payer = participants[0];

    const res = await agent.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: payer.user_id,
      amount: 40,
      description: 'Dinner',
      category: 'food',
    });

    expect(res.status).toBe(201);
    expect(res.body.payer_name).toBe(payer.name);
    expect(res.body.amount).toBe(40);
    expect(res.body.description).toBe('Dinner');
    expect(res.body.category).toBe('food');

    const shares = await ExpenseShare.findAll({ where: { expense_id: res.body.expense_id } });
    expect(shares).toHaveLength(2);
    expect(shares.reduce((sum, share) => sum + Number(share.amount), 0)).toBe(40);

    const updatedGroup = await Group.findByPk(group.group_id);
    expect(Number(updatedGroup!.total_expense)).toBe(40);
  });

  it('splits uneven amounts so the shares still sum to the total', async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice', 'Bob', 'Charlie']);

    const res = await agent.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: participants[0].user_id,
      amount: 10,
      description: 'Snacks',
      category: 'food',
    });

    expect(res.status).toBe(201);
    const shares = await ExpenseShare.findAll({ where: { expense_id: res.body.expense_id } });
    const amounts = shares.map((share) => Number(share.amount)).sort();
    expect(amounts).toEqual([3.33, 3.33, 3.34]);
  });

  it('rejects a payer that is not a participant of the group', async () => {
    const agent = await registerAgent(app);
    const { group } = await createGroup(agent, 'Trip', ['Alice']);

    const res = await agent.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: 'not-a-member',
      amount: 10,
      description: 'Dinner',
      category: 'food',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Payer is not a participant of this group');
  });

  it('rejects a non-positive amount', async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice']);

    const res = await agent.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: participants[0].user_id,
      amount: -5,
      description: 'Dinner',
      category: 'food',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('amount must be a positive number');
  });

  it("404s for another user's group", async () => {
    const owner = await registerAgent(app);
    const { group, participants } = await createGroup(owner, 'Trip', ['Alice']);

    const intruder = await registerAgent(app);
    const res = await intruder.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: participants[0].user_id,
      amount: 10,
      description: 'Dinner',
      category: 'food',
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Group not found');
  });
});

describe('GET /groups/:groupId/expenses', () => {
  it('requires an active session', async () => {
    const res = await request(app).get('/groups/some-id/expenses');

    expect(res.status).toBe(401);
  });

  it('lists the group expenses with payer names and numeric amounts', async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice', 'Bob']);
    const [alice, bob] = participants;

    await agent.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: alice.user_id,
      amount: 40,
      description: 'Dinner',
      category: 'food',
    });
    await agent.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: bob.user_id,
      amount: 15.5,
      description: 'Taxi',
      category: 'transport',
    });

    const res = await agent.get(`/groups/${group.group_id}/expenses`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const byDescription = Object.fromEntries(
      res.body.map((expense: { description: string }) => [expense.description, expense])
    );
    expect(byDescription['Dinner'].payer_name).toBe(alice.name);
    expect(byDescription['Dinner'].amount).toBe(40);
    expect(byDescription['Taxi'].payer_name).toBe(bob.name);
    expect(byDescription['Taxi'].amount).toBe(15.5);
  });

  it("404s for another user's group", async () => {
    const owner = await registerAgent(app);
    const { group } = await createGroup(owner, 'Trip', ['Alice']);

    const intruder = await registerAgent(app);
    const res = await intruder.get(`/groups/${group.group_id}/expenses`);

    expect(res.status).toBe(404);
  });
});

describe('DELETE /groups/:groupId/expenses/:expenseId', () => {
  it('requires an active session', async () => {
    const res = await request(app).delete('/groups/some-id/expenses/some-expense');

    expect(res.status).toBe(401);
  });

  it('removes the expense with its shares and restores the group total', async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice', 'Bob']);

    const created = await agent.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: participants[0].user_id,
      amount: 40,
      description: 'Dinner',
      category: 'food',
    });

    const res = await agent.delete(`/groups/${group.group_id}/expenses/${created.body.expense_id}`);

    expect(res.status).toBe(204);
    expect(await Expense.findByPk(created.body.expense_id)).toBeNull();
    expect(await ExpenseShare.findAll({ where: { expense_id: created.body.expense_id } })).toHaveLength(0);

    const updatedGroup = await Group.findByPk(group.group_id);
    expect(Number(updatedGroup!.total_expense)).toBe(0);

    const listRes = await agent.get(`/groups/${group.group_id}/expenses`);
    expect(listRes.body).toHaveLength(0);
  });

  it('wipes unpaid settlements but keeps paid ones', async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice', 'Bob']);
    const [alice, bob] = participants;

    // Alice pays 40 → Bob owes 20; settle and mark it paid.
    await agent.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: alice.user_id,
      amount: 40,
      description: 'Dinner',
      category: 'food',
    });
    const settled = await agent.post(`/groups/${group.group_id}/settlements`);
    await agent.patch(`/settlements/${settled.body[0].settlement_id}`).send({ is_paid: true });

    // A second expense creates a fresh unpaid settlement...
    const second = await agent.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: bob.user_id,
      amount: 10,
      description: 'Taxi',
      category: 'transport',
    });
    await agent.post(`/groups/${group.group_id}/settlements`);

    // ...which deleting that expense invalidates.
    const res = await agent.delete(`/groups/${group.group_id}/expenses/${second.body.expense_id}`);

    expect(res.status).toBe(204);
    const remaining = await Settlement.findAll({ where: { group_id: group.group_id } });
    expect(remaining).toHaveLength(1);
    expect(remaining[0].is_paid).toBe(true);
  });

  it("404s for another user's group", async () => {
    const owner = await registerAgent(app);
    const { group, participants } = await createGroup(owner, 'Trip', ['Alice']);
    const created = await owner.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: participants[0].user_id,
      amount: 10,
      description: 'Dinner',
      category: 'food',
    });

    const intruder = await registerAgent(app);
    const res = await intruder.delete(`/groups/${group.group_id}/expenses/${created.body.expense_id}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Group not found');
    expect(await Expense.findByPk(created.body.expense_id)).not.toBeNull();
  });

  it('404s for an unknown expense id', async () => {
    const agent = await registerAgent(app);
    const { group } = await createGroup(agent, 'Trip', ['Alice']);

    const res = await agent.delete(
      `/groups/${group.group_id}/expenses/00000000-0000-4000-8000-000000000000`
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Expense not found');
  });

  it("404s for an expense that belongs to the user's other group", async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice']);
    const { group: otherGroup } = await createGroup(agent, 'Rent', ['Sam']);

    const created = await agent.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: participants[0].user_id,
      amount: 10,
      description: 'Dinner',
      category: 'food',
    });

    const res = await agent.delete(`/groups/${otherGroup.group_id}/expenses/${created.body.expense_id}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Expense not found');
    expect(await Expense.findByPk(created.body.expense_id)).not.toBeNull();
  });
});
