import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { v4 as uuid4 } from 'uuid';
import { app } from '../../src/app';
import { registerAgent, createGroup } from '../helpers';
import type TestAgent from 'supertest/lib/agent';

const addExpense = (
  agent: TestAgent,
  groupId: string,
  payerId: string,
  amount: number
) =>
  agent.post(`/groups/${groupId}/expenses`).send({
    payer_id: payerId,
    amount,
    description: 'Expense',
    category: 'food',
  });

describe('POST /groups/:groupId/settlements', () => {
  it('requires an active session', async () => {
    const res = await request(app).post('/groups/some-id/settlements');

    expect(res.status).toBe(401);
  });

  it('computes and persists the split for the group', async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice', 'Bob']);
    const [alice, bob] = participants;
    await addExpense(agent, group.group_id, alice.user_id, 40);

    const res = await agent.post(`/groups/${group.group_id}/settlements`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      group_id: group.group_id,
      from_user_id: bob.user_id,
      from_name: bob.name,
      to_user_id: alice.user_id,
      to_name: alice.name,
      amount: 20,
      is_paid: false,
    });
    expect(res.body[0].settlement_id).toBeDefined();
  });

  it('replaces unpaid settlements when expenses change', async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice', 'Bob']);
    const [alice] = participants;
    await addExpense(agent, group.group_id, alice.user_id, 40);
    await agent.post(`/groups/${group.group_id}/settlements`);

    await addExpense(agent, group.group_id, alice.user_id, 10);
    const res = await agent.post(`/groups/${group.group_id}/settlements`);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].amount).toBe(25);
  });

  it('does not re-demand debts that were already paid', async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice', 'Bob']);
    const [alice] = participants;
    await addExpense(agent, group.group_id, alice.user_id, 40);

    const first = await agent.post(`/groups/${group.group_id}/settlements`);
    await agent
      .patch(`/settlements/${first.body[0].settlement_id}`)
      .send({ is_paid: true });

    const res = await agent.post(`/groups/${group.group_id}/settlements`);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].is_paid).toBe(true);
    expect(res.body[0].amount).toBe(20);
  });

  it("404s for another user's group", async () => {
    const owner = await registerAgent(app);
    const { group } = await createGroup(owner, 'Trip', ['Alice']);

    const intruder = await registerAgent(app);
    const res = await intruder.post(`/groups/${group.group_id}/settlements`);

    expect(res.status).toBe(404);
  });
});

describe('GET /groups/:groupId/settlements', () => {
  it('requires an active session', async () => {
    const res = await request(app).get('/groups/some-id/settlements');

    expect(res.status).toBe(401);
  });

  it('returns stored settlements without recomputing', async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice', 'Bob']);
    const [alice] = participants;
    await addExpense(agent, group.group_id, alice.user_id, 40);
    await agent.post(`/groups/${group.group_id}/settlements`);

    // A new expense must not change stored settlements until the next POST.
    await addExpense(agent, group.group_id, alice.user_id, 10);
    const res = await agent.get(`/groups/${group.group_id}/settlements`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].amount).toBe(20);
  });

  it('returns an empty list for a group with no settlements', async () => {
    const agent = await registerAgent(app);
    const { group } = await createGroup(agent, 'Trip', ['Alice']);

    const res = await agent.get(`/groups/${group.group_id}/settlements`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('PATCH /settlements/:settlementId', () => {
  it('requires an active session', async () => {
    const res = await request(app).patch(`/settlements/${uuid4()}`).send({ is_paid: true });

    expect(res.status).toBe(401);
  });

  it('marks a settlement as paid and persists it', async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice', 'Bob']);
    const [alice] = participants;
    await addExpense(agent, group.group_id, alice.user_id, 40);
    const created = await agent.post(`/groups/${group.group_id}/settlements`);

    const res = await agent
      .patch(`/settlements/${created.body[0].settlement_id}`)
      .send({ is_paid: true });

    expect(res.status).toBe(200);
    expect(res.body.is_paid).toBe(true);
    expect(res.body.from_name).toBe('Bob');

    const after = await agent.get(`/groups/${group.group_id}/settlements`);
    expect(after.body[0].is_paid).toBe(true);
  });

  it('rejects a non-boolean is_paid', async () => {
    const agent = await registerAgent(app);

    const res = await agent.patch(`/settlements/${uuid4()}`).send({ is_paid: 'yes' });

    expect(res.status).toBe(400);
  });

  it('404s for an unknown settlement', async () => {
    const agent = await registerAgent(app);

    const res = await agent.patch(`/settlements/${uuid4()}`).send({ is_paid: true });

    expect(res.status).toBe(404);
  });

  it("404s for another user's settlement", async () => {
    const owner = await registerAgent(app);
    const { group, participants } = await createGroup(owner, 'Trip', ['Alice', 'Bob']);
    await addExpense(owner, group.group_id, participants[0].user_id, 40);
    const created = await owner.post(`/groups/${group.group_id}/settlements`);

    const intruder = await registerAgent(app);
    const res = await intruder
      .patch(`/settlements/${created.body[0].settlement_id}`)
      .send({ is_paid: true });

    expect(res.status).toBe(404);
  });
});
