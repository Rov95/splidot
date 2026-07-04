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
    expect(typeof res.body.token).toBe('string');
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
    expect(typeof res.body.token).toBe('string');
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
  it('rejects a request without a token', async () => {
    const res = await request(app).get('/users/me');

    expect(res.status).toBe(401);
  });

  it('returns the logged-in user without the password field', async () => {
    const registerRes = await request(app).post('/users/register').send(testUser);
    const { token } = registerRes.body;

    const res = await request(app).get('/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.password).toBeUndefined();
  });
});

describe('POST /users/logout', () => {
  it('responds 200 (logout is client-side for stateless JWT)', async () => {
    const res = await request(app).post('/users/logout');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Logged out successfully' });
  });
});
