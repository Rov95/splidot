import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

describe('POST /categories', () => {
  it('creates a category', async () => {
    const res = await request(app).post('/categories').send({ name: 'Food' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Food');
  });
});

describe('GET /categories', () => {
  it('lists all created categories', async () => {
    await request(app).post('/categories').send({ name: 'Food' });
    await request(app).post('/categories').send({ name: 'Lodging' });

    const res = await request(app).get('/categories');

    expect(res.status).toBe(200);
    expect(res.body.map((c: { name: string }) => c.name).sort()).toEqual(['Food', 'Lodging']);
  });
});
