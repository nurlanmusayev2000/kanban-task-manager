import request from 'supertest';
import { expect } from 'vitest';
import { app } from '../src/app';

export const api = () => request(app);

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function signup(email = 'ada@example.com', password = 'secret123', name = 'Ada') {
  const res = await api().post('/api/auth/signup').send({ email, password, name });
  expect(res.status).toBe(201);
  return { token: res.body.token as string, user: res.body.user as { id: string; email: string; name: string } };
}

export async function createBoard(token: string, title = 'Board') {
  const res = await api().post('/api/boards').set(bearer(token)).send({ title });
  expect(res.status).toBe(201);
  return res.body.board as { _id: string; title: string };
}

export async function createList(token: string, boardId: string, title: string) {
  const res = await api().post('/api/lists').set(bearer(token)).send({ boardId, title });
  expect(res.status).toBe(201);
  return res.body.list as { _id: string; title: string; position: number };
}

export async function createCard(token: string, listId: string, title: string) {
  const res = await api().post('/api/cards').set(bearer(token)).send({ listId, title });
  expect(res.status).toBe(201);
  return res.body.card as { _id: string; title: string; position: number };
}
