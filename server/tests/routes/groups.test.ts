import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

describe('POST /groups', () => {
  it('creates a group along with its participants', async () => {
    const res = await request(app)
      .post('/groups')
      .send({ name: 'Roommates', participants: ['Alice', 'Bob'] });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Roommates');
    expect(res.body.group_id).toBeDefined();

    const participantsRes = await request(app).get(`/groups/${res.body.group_id}/participants`);
    expect(participantsRes.body).toHaveLength(2);
    expect(participantsRes.body.map((p: { name: string }) => p.name).sort()).toEqual(['Alice', 'Bob']);
  });
});

describe('GET /groups', () => {
  it('lists all created groups', async () => {
    await request(app).post('/groups').send({ name: 'Trip', participants: ['Sam'] });
    await request(app).post('/groups').send({ name: 'Rent', participants: ['Sam', 'Alex'] });

    const res = await request(app).get('/groups');

    expect(res.status).toBe(200);
    expect(res.body.map((g: { name: string }) => g.name).sort()).toEqual(['Rent', 'Trip']);
  });
});

describe('GET /groups/:groupId/participants', () => {
  it('returns an empty list for a group with no participants', async () => {
    const created = await request(app).post('/groups').send({ name: 'Empty', participants: [] });

    const res = await request(app).get(`/groups/${created.body.group_id}/participants`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('only exposes user_id and name for each participant', async () => {
    const created = await request(app)
      .post('/groups')
      .send({ name: 'Fields', participants: ['Casey'] });

    const res = await request(app).get(`/groups/${created.body.group_id}/participants`);

    expect(Object.keys(res.body[0]).sort()).toEqual(['name', 'user_id']);
  });
});
