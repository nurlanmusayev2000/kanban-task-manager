import { beforeEach, describe, expect, it } from 'vitest';
import { api, bearer, createBoard, createCard, createList, signup } from './helpers';

describe('board access', () => {
  let owner: Awaited<ReturnType<typeof signup>>;
  let other: Awaited<ReturnType<typeof signup>>;
  let boardId: string;
  let listId: string;
  let cardId: string;

  beforeEach(async () => {
    owner = await signup('owner@example.com');
    other = await signup('other@example.com');
    boardId = (await createBoard(owner.token, 'Private board'))._id;
    listId = (await createList(owner.token, boardId, 'To Do'))._id;
    cardId = (await createCard(owner.token, listId, 'Secret card'))._id;
  });

  it("lets the owner read their board", async () => {
    const res = await api().get(`/api/boards/${boardId}`).set(bearer(owner.token));
    expect(res.status).toBe(200);
    expect(res.body.lists[0].cards[0].title).toBe('Secret card');
  });

  it("does not let another user read the board", async () => {
    const res = await api().get(`/api/boards/${boardId}`).set(bearer(other.token));
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: 'You do not have access to this board' });
    expect(JSON.stringify(res.body)).not.toContain('Secret card');
  });

  it("leaves the board out of another user's board list", async () => {
    const res = await api().get('/api/boards').set(bearer(other.token));
    expect(res.status).toBe(200);
    expect(res.body.boards).toEqual([]);
  });

  it('blocks another user from changing the board, its lists or its cards', async () => {
    const as = bearer(other.token);
    const attempts = await Promise.all([
      api().put(`/api/boards/${boardId}`).set(as).send({ title: 'Hacked' }),
      api().delete(`/api/boards/${boardId}`).set(as),
      api().post('/api/lists').set(as).send({ boardId, title: 'Injected' }),
      api().put(`/api/lists/${listId}`).set(as).send({ title: 'Hacked' }),
      api().delete(`/api/lists/${listId}`).set(as),
      api().post('/api/cards').set(as).send({ listId, title: 'Injected' }),
      api().put(`/api/cards/${cardId}`).set(as).send({ title: 'Hacked' }),
      api().delete(`/api/cards/${cardId}`).set(as),
      api().post(`/api/cards/${cardId}/comments`).set(as).send({ text: 'Hi' }),
    ]);
    expect(attempts.map((res) => res.status)).toEqual(Array(attempts.length).fill(403));

    const board = await api().get(`/api/boards/${boardId}`).set(bearer(owner.token));
    expect(board.body.board.title).toBe('Private board');
    expect(board.body.lists).toHaveLength(1);
    expect(board.body.lists[0].title).toBe('To Do');
    expect(board.body.lists[0].cards.map((c: { title: string }) => c.title)).toEqual(['Secret card']);
  });

  it("does not let a user move a card onto another user's list", async () => {
    const theirBoard = await createBoard(other.token, 'Their board');
    const theirList = await createList(other.token, theirBoard._id, 'Theirs');
    const res = await api()
      .put(`/api/cards/${cardId}`)
      .set(bearer(owner.token))
      .send({ listId: theirList._id, position: 0 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Cannot move card to a list on a different board');
  });

  it('gives members access once the owner adds them', async () => {
    await api().put(`/api/boards/${boardId}`).set(bearer(owner.token)).send({ members: [other.user.id] });

    const read = await api().get(`/api/boards/${boardId}`).set(bearer(other.token));
    expect(read.status).toBe(200);
    const list = await api().get('/api/boards').set(bearer(other.token));
    expect(list.body.boards.map((b: { title: string }) => b.title)).toEqual(['Private board']);

    // Members can edit, but only the owner can delete the board.
    const del = await api().delete(`/api/boards/${boardId}`).set(bearer(other.token));
    expect(del.status).toBe(403);
    expect(del.body.message).toBe('Only the owner can delete this board');
  });

  it('returns 404 for a board that does not exist', async () => {
    const res = await api().get('/api/boards/000000000000000000000000').set(bearer(owner.token));
    expect(res.status).toBe(404);
  });
});
