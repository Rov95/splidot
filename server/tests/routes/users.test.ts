import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

const testUser = {
  email: 'jane@example.com',
  password: 'correct-horse-battery-staple',
  firstName: 'Jane',
  lastName: 'Doe',
};

describe('POST /users/register', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/users/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'User registered succesfully' });
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/users/register').send(testUser);
    const res = await request(app).post('/users/register').send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email already in use');
  });
});

describe('POST /users/login', () => {
  it('logs in with correct credentials', async () => {
    await request(app).post('/users/register').send(testUser);

    const res = await request(app)
      .post('/users/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'User logged in successfully' });
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects a wrong password', async () => {
    await request(app).post('/users/register').send(testUser);

    const res = await request(app)
      .post('/users/login')
      .send({ email: testUser.email, password: 'wrong-password' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  it('rejects an unknown email', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'nobody@example.com', password: 'whatever' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid email or password.');
  });
});

describe('GET /users/me', () => {
  it('requires an active session', async () => {
    const res = await request(app).get('/users/me');

    expect(res.status).toBe(401);
  });

  it('returns the logged-in user without the password field', async () => {
    const agent = request.agent(app);
    await agent.post('/users/register').send(testUser);

    const res = await agent.get('/users/me');

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.password).toBeUndefined();
  });
});

describe('POST /users/logout', () => {
  it('destroys the session so /me becomes unauthorized again', async () => {
    const agent = request.agent(app);
    await agent.post('/users/register').send(testUser);
    await agent.get('/users/me').expect(200);

    const logoutRes = await agent.post('/users/logout');
    expect(logoutRes.status).toBe(200);

    const meRes = await agent.get('/users/me');
    expect(meRes.status).toBe(401);
  });
});
