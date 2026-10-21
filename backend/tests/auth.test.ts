import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { api, bearer, signup } from './helpers';

describe('POST /api/auth/signup', () => {
  it('creates a user and returns a token without the password', async () => {
    const res = await api()
      .post('/api/auth/signup')
      .send({ email: 'Ada@Example.com', password: 'secret123', name: 'Ada' });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: expect.any(String), email: 'ada@example.com', name: 'Ada' });
    expect(JSON.stringify(res.body)).not.toContain('secret123');
  });

  it('rejects a duplicate email, ignoring case', async () => {
    await signup('ada@example.com');
    const res = await api()
      .post('/api/auth/signup')
      .send({ email: 'ADA@example.com', password: 'secret123', name: 'Other' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email already registered');
  });

  it.each([
    [{ email: 'ada@example.com', password: 'secret123' }, 'Email, password, and name are required'],
    [{ email: 'not-an-email', password: 'secret123', name: 'Ada' }, 'Invalid email address'],
    [{ email: 'ada@example.com', password: '123', name: 'Ada' }, 'Password must be at least 6 characters'],
  ])('rejects invalid input %#', async (body, message) => {
    const res = await api().post('/api/auth/signup').send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(message);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token that authenticates later requests', async () => {
    await signup('ada@example.com', 'secret123');
    const res = await api().post('/api/auth/login').send({ email: 'ada@example.com', password: 'secret123' });

    expect(res.status).toBe(200);
    const me = await api().get('/api/auth/me').set(bearer(res.body.token));
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('ada@example.com');
  });

  it('rejects a wrong password and an unknown email with the same message', async () => {
    await signup('ada@example.com', 'secret123');
    const wrongPassword = await api().post('/api/auth/login').send({ email: 'ada@example.com', password: 'nope1234' });
    const unknownEmail = await api().post('/api/auth/login').send({ email: 'bob@example.com', password: 'secret123' });

    for (const res of [wrongPassword, unknownEmail]) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Invalid credentials' });
    }
  });
});

describe('protected routes', () => {
  const routes: [method: 'get' | 'post' | 'put' | 'delete', path: string][] = [
    ['get', '/api/auth/me'],
    ['put', '/api/auth/profile'],
    ['get', '/api/boards'],
    ['post', '/api/boards'],
    ['get', '/api/boards/000000000000000000000000'],
    ['post', '/api/lists'],
    ['post', '/api/cards'],
    ['put', '/api/cards/000000000000000000000000'],
  ];

  it.each(routes)('%s %s returns 401 without a token', async (method, path) => {
    const res = await api()[method](path);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'No token provided' });
  });

  it('returns 401 for a malformed token', async () => {
    const res = await api().get('/api/boards').set(bearer('not-a-jwt'));
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid or expired token' });
  });

  it('returns 401 for an expired token', async () => {
    const { user } = await signup();
    const expired = jwt.sign(
      { userId: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET!
    );
    const res = await api().get('/api/boards').set(bearer(expired));
    expect(res.status).toBe(401);
  });

  it('returns 401 for a token signed with a different secret', async () => {
    const { user } = await signup();
    const forged = jwt.sign({ userId: user.id, email: user.email }, 'some-other-secret');
    const res = await api().get('/api/boards').set(bearer(forged));
    expect(res.status).toBe(401);
  });
});
