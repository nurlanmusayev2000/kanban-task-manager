/**
 * Regression tests for card and list ordering (fixed in 81a194a). Moving a
 * card used to set only that card's position, and deletes left gaps that the
 * next new card could collide with, so a list's order became arbitrary.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { api, bearer, createBoard, createCard, createList, signup } from './helpers';

interface ApiCard { _id: string; title: string; position: number }
interface ApiList { _id: string; title: string; position: number; cards: ApiCard[] }

let token: string;
let boardId: string;

async function getLists(): Promise<ApiList[]> {
  const res = await api().get(`/api/boards/${boardId}`).set(bearer(token));
  expect(res.status).toBe(200);
  return res.body.lists;
}

/** Card titles per list in position order, after checking positions are exactly 0..n-1. */
async function board(): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  for (const list of await getLists()) {
    const positions = list.cards.map((c) => c.position).sort((a, b) => a - b);
    expect(positions, `positions in "${list.title}"`).toEqual(list.cards.map((_, i) => i));
    result[list.title] = [...list.cards].sort((a, b) => a.position - b.position).map((c) => c.title);
  }
  return result;
}

const move = (cardId: string, body: { listId?: string; position?: unknown }) =>
  api().put(`/api/cards/${cardId}`).set(bearer(token)).send(body);

describe('card ordering', () => {
  let todo: string;
  let done: string;
  let cards: Record<string, string>;

  beforeEach(async () => {
    token = (await signup()).token;
    boardId = (await createBoard(token))._id;
    todo = (await createList(token, boardId, 'To Do'))._id;
    done = (await createList(token, boardId, 'Done'))._id;
    cards = {};
    for (const title of ['A', 'B', 'C', 'D']) cards[title] = (await createCard(token, todo, title))._id;
    for (const title of ['X', 'Y']) cards[title] = (await createCard(token, done, title))._id;
  });

  it('numbers new cards 0..n-1 in creation order', async () => {
    expect(await board()).toEqual({ 'To Do': ['A', 'B', 'C', 'D'], Done: ['X', 'Y'] });
  });

  it('moves a card down within a list', async () => {
    const res = await move(cards.A, { listId: todo, position: 2 });
    expect(res.status).toBe(200);
    expect(res.body.card.position).toBe(2);
    expect(await board()).toEqual({ 'To Do': ['B', 'C', 'A', 'D'], Done: ['X', 'Y'] });
  });

  it('moves a card up within a list, with or without listId', async () => {
    await move(cards.D, { listId: todo, position: 0 });
    await move(cards.C, { position: 1 });
    expect(await board()).toEqual({ 'To Do': ['D', 'C', 'A', 'B'], Done: ['X', 'Y'] });
  });

  it('moves a card into the middle of another list and closes the gap it left', async () => {
    await move(cards.B, { listId: done, position: 1 });
    expect(await board()).toEqual({ 'To Do': ['A', 'C', 'D'], Done: ['X', 'B', 'Y'] });
  });

  it('appends to the end when no position is given, and clamps positions past the end', async () => {
    await move(cards.A, { listId: done });
    await move(cards.B, { listId: done, position: 99 });
    expect(await board()).toEqual({ 'To Do': ['C', 'D'], Done: ['X', 'Y', 'A', 'B'] });
  });

  it('moves cards into an empty list and back', async () => {
    const empty = (await createList(token, boardId, 'Empty'))._id;
    await move(cards.C, { listId: empty, position: 0 });
    await move(cards.A, { listId: empty, position: 0 });
    expect(await board()).toEqual({ 'To Do': ['B', 'D'], Done: ['X', 'Y'], Empty: ['A', 'C'] });
    await move(cards.A, { listId: todo, position: 1 });
    await move(cards.C, { listId: todo, position: 0 });
    expect(await board()).toEqual({ 'To Do': ['C', 'B', 'A', 'D'], Done: ['X', 'Y'], Empty: [] });
  });

  it('renumbers a list after a delete, so the next new card does not collide', async () => {
    await api().delete(`/api/cards/${cards.B}`).set(bearer(token));
    expect(await board()).toEqual({ 'To Do': ['A', 'C', 'D'], Done: ['X', 'Y'] });

    const created = await createCard(token, todo, 'E');
    expect(created.position).toBe(3);
    expect(await board()).toEqual({ 'To Do': ['A', 'C', 'D', 'E'], Done: ['X', 'Y'] });
  });

  it.each([[-1], [1.5], ['2'], [null]])('rejects position %j with 400 and changes nothing', async (position) => {
    const res = await move(cards.A, { listId: done, position });
    expect(res.status).toBe(400);
    expect(await board()).toEqual({ 'To Do': ['A', 'B', 'C', 'D'], Done: ['X', 'Y'] });
  });

  it('keeps positions unique and in sequence through many random moves and deletes', async () => {
    const third = (await createList(token, boardId, 'Third'))._id;
    const listIds: Record<string, string> = { 'To Do': todo, Done: done, Third: third };
    const model: Record<string, string[]> = { 'To Do': ['A', 'B', 'C', 'D'], Done: ['X', 'Y'], Third: [] };

    // Small deterministic PRNG so failures are reproducible.
    let seed = 42;
    const random = (n: number) => {
      seed = (seed * 1103515245 + 12345) % 2 ** 31;
      return seed % n;
    };

    for (let step = 0; step < 60; step++) {
      const all = Object.entries(model).flatMap(([list, titles]) => titles.map((t) => [list, t] as const));
      const [fromList, title] = all[random(all.length)];
      model[fromList] = model[fromList].filter((t) => t !== title);

      if (step % 15 === 14) {
        await api().delete(`/api/cards/${cards[title]}`).set(bearer(token));
        cards[title] = (await createCard(token, listIds[fromList], title))._id;
        model[fromList].push(title);
      } else {
        const toList = Object.keys(model)[random(3)];
        const position = random(model[toList].length + 2); // sometimes past the end
        await move(cards[title], { listId: listIds[toList], position });
        model[toList].splice(Math.min(position, model[toList].length), 0, title);
      }
      expect(await board(), `after step ${step}`).toEqual(model);
    }
  });
});

describe('list ordering', () => {
  it('renumbers lists after a delete, so a new list goes last without colliding', async () => {
    token = (await signup()).token;
    boardId = (await createBoard(token))._id;
    for (const title of ['One', 'Two', 'Three']) await createList(token, boardId, title);
    const two = (await getLists()).find((l) => l.title === 'Two')!;

    await api().delete(`/api/lists/${two._id}`).set(bearer(token));
    const created = await createList(token, boardId, 'Four');

    expect(created.position).toBe(2);
    const lists = await getLists();
    expect(lists.map((l) => [l.title, l.position])).toEqual([['One', 0], ['Three', 1], ['Four', 2]]);
  });
});
