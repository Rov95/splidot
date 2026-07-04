import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { registerAgent, createGroup } from '../helpers';
import { Group, UserGroup, Expense, ExpenseShare, Settlement } from '../../src/models';

describe('POST /groups', () => {
  it('requires an active session', async () => {
    const res = await request(app)
      .post('/groups')
      .send({ name: 'Roommates', participants: ['Alice'] });

    expect(res.status).toBe(401);
  });

  it('creates a group along with its participants', async () => {
    const agent = await registerAgent(app);

    const res = await agent
      .post('/groups')
      .send({ name: 'Roommates', participants: ['Alice', 'Bob'] });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Roommates');
    expect(res.body.group_id).toBeDefined();
    expect(res.body.created_by).toBeDefined();

    const participantsRes = await agent.get(`/groups/${res.body.group_id}/participants`);
    expect(participantsRes.body).toHaveLength(2);
    expect(participantsRes.body.map((p: { name: string }) => p.name).sort()).toEqual(['Alice', 'Bob']);
  });

  it('rejects an empty participant list', async () => {
    const agent = await registerAgent(app);

    const res = await agent.post('/groups').send({ name: 'Empty', participants: [] });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('participants must be a non-empty array of names');
  });
});

describe('GET /groups', () => {
  it('lists only the groups created by the signed-in user', async () => {
    const agent = await registerAgent(app);
    await agent.post('/groups').send({ name: 'Trip', participants: ['Sam'] });
    await agent.post('/groups').send({ name: 'Rent', participants: ['Sam', 'Alex'] });

    const otherAgent = await registerAgent(app);
    await otherAgent.post('/groups').send({ name: 'Other', participants: ['Pat'] });

    const res = await agent.get('/groups');

    expect(res.status).toBe(200);
    expect(res.body.map((g: { name: string }) => g.name).sort()).toEqual(['Rent', 'Trip']);
  });
});

describe('GET /groups/:groupId/participants', () => {
  it('only exposes user_id and name for each participant', async () => {
    const agent = await registerAgent(app);
    const { group } = await createGroup(agent, 'Fields', ['Casey']);

    const res = await agent.get(`/groups/${group.group_id}/participants`);

    expect(Object.keys(res.body[0]).sort()).toEqual(['name', 'user_id']);
  });

  it("404s for another user's group", async () => {
    const owner = await registerAgent(app);
    const { group } = await createGroup(owner, 'Private', ['Casey']);

    const intruder = await registerAgent(app);
    const res = await intruder.get(`/groups/${group.group_id}/participants`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Group not found');
  });
});

describe('GET /groups/:groupId/balances', () => {
  it('returns each participant with the total they have paid', async () => {
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
      payer_id: alice.user_id,
      amount: 10.5,
      description: 'Taxi',
      category: 'transport',
    });

    const res = await agent.get(`/groups/${group.group_id}/balances`);

    expect(res.status).toBe(200);
    const byId = Object.fromEntries(
      res.body.map((b: { user_id: string }) => [b.user_id, b])
    );
    expect(byId[alice.user_id]).toMatchObject({ name: alice.name, total_paid: 50.5 });
    expect(byId[bob.user_id]).toMatchObject({ name: bob.name, total_paid: 0 });
  });

  it("404s for another user's group", async () => {
    const owner = await registerAgent(app);
    const { group } = await createGroup(owner, 'Private', ['Casey']);

    const intruder = await registerAgent(app);
    const res = await intruder.get(`/groups/${group.group_id}/balances`);

    expect(res.status).toBe(404);
  });
});

describe('DELETE /groups/:groupId', () => {
  it('requires an active session', async () => {
    const res = await request(app).delete('/groups/some-id');

    expect(res.status).toBe(401);
  });

  it('deletes the group and every row that hangs off it', async () => {
    const agent = await registerAgent(app);
    const { group, participants } = await createGroup(agent, 'Trip', ['Alice', 'Bob']);
    await createGroup(agent, 'Rent', ['Sam']);

    const expenseRes = await agent.post(`/groups/${group.group_id}/expenses`).send({
      payer_id: participants[0].user_id,
      amount: 40,
      description: 'Dinner',
      category: 'food',
    });
    await agent.post(`/groups/${group.group_id}/settlements`);

    const res = await agent.delete(`/groups/${group.group_id}`);

    expect(res.status).toBe(204);
    expect(await Group.findByPk(group.group_id)).toBeNull();
    expect(await UserGroup.findAll({ where: { group_id: group.group_id } })).toHaveLength(0);
    expect(await Expense.findAll({ where: { group_id: group.group_id } })).toHaveLength(0);
    expect(
      await ExpenseShare.findAll({ where: { expense_id: expenseRes.body.expense_id } })
    ).toHaveLength(0);
    expect(await Settlement.findAll({ where: { group_id: group.group_id } })).toHaveLength(0);

    const listRes = await agent.get('/groups');
    expect(listRes.body.map((g: { name: string }) => g.name)).toEqual(['Rent']);
  });

  it("404s for another user's group and leaves it intact", async () => {
    const owner = await registerAgent(app);
    const { group } = await createGroup(owner, 'Private', ['Casey']);

    const intruder = await registerAgent(app);
    const res = await intruder.delete(`/groups/${group.group_id}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Group not found');
    expect(await Group.findByPk(group.group_id)).not.toBeNull();
  });
});
