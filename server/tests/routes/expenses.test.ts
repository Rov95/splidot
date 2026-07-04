import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

describe('POST /expenses', () => {
  it('creates an expense', async () => {
    const group = await request(app).post('/groups').send({ name: 'Trip', participants: ['Alice'] });

    const res = await request(app).post('/expenses').send({
      group_id: group.body.group_id,
      amount: 42.5,
      description: 'Dinner',
    });

    expect(res.status).toBe(201);
    expect(res.body.description).toBe('Dinner');
    expect(Number(res.body.amount)).toBe(42.5);
  });
});

describe('GET /expenses', () => {
  it('lists all created expenses', async () => {
    await request(app).post('/expenses').send({ amount: 10, description: 'Coffee' });
    await request(app).post('/expenses').send({ amount: 20, description: 'Lunch' });

    const res = await request(app).get('/expenses');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});
