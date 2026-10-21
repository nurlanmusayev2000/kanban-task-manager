import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import BoardDetail from './BoardDetail';
import { renderWithProviders } from '../test/render';
import { API_URL, server } from '../test/server';
import type { Card, List } from '../types';

const DUE = '2026-11-05T12:00:00.000Z';

function card(id: string, listId: string, title: string, position: number, extra: Partial<Card> = {}): Card {
  return {
    _id: id, title, list: listId, board: 'b1', position,
    labels: [], assignees: [], comments: [], createdAt: DUE, updatedAt: DUE,
    ...extra,
  };
}

function list(id: string, title: string, position: number, cards: Card[]): List {
  return { _id: id, title, board: 'b1', position, cards, createdAt: DUE };
}

// Lists and cards are deliberately out of position order, as MongoDB may return them.
const boardResponse = {
  board: {
    _id: 'b1', title: 'Product Launch', description: 'Tasks for shipping v2', owner: 'u1',
    members: [], color: '#3B82F6', createdAt: DUE, updatedAt: DUE,
  },
  lists: [
    list('l2', 'In Progress', 1, [
      card('c4', 'l2', 'Mobile layout', 1),
      card('c3', 'l2', 'Rate-limit auth', 0, {
        description: 'Limit login attempts per IP.',
        labels: ['backend', 'security'],
        dueDate: DUE,
      }),
    ]),
    list('l3', 'Done', 2, []),
    list('l1', 'To Do', 0, [
      card('c2', 'l1', 'Set up monitoring', 1),
      card('c1', 'l1', 'Write announcement', 0),
    ]),
  ],
};

function mockBoard() {
  const requests: { url: string; authorization: string | null }[] = [];
  server.use(
    http.get(`${API_URL}/boards/:boardId`, ({ request, params }) => {
      requests.push({ url: new URL(request.url).pathname, authorization: request.headers.get('authorization') });
      return params.boardId === 'b1'
        ? HttpResponse.json(boardResponse)
        : HttpResponse.json({ message: 'Board not found' }, { status: 404 });
    })
  );
  return requests;
}

function renderBoard() {
  localStorage.setItem('authToken', 'jwt-token');
  return renderWithProviders(<BoardDetail />, { route: '/boards/b1', path: '/boards/:boardId' });
}

const cardTitles = (listName: string) =>
  within(screen.getByRole('region', { name: listName }))
    .queryAllByRole('heading', { level: 3 })
    .map((h) => h.textContent);

describe('BoardDetail page', () => {
  it('fetches the board with the stored token', async () => {
    const requests = mockBoard();
    renderBoard();

    expect(screen.getByText('Loading board...')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Product Launch' })).toBeInTheDocument();
    expect(screen.getByText('Tasks for shipping v2')).toBeInTheDocument();
    expect(requests).toEqual([{ url: '/api/boards/b1', authorization: 'Bearer jwt-token' }]);
  });

  it('renders lists and their cards in position order', async () => {
    mockBoard();
    renderBoard();
    await screen.findByRole('heading', { name: 'Product Launch' });

    expect(screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'))).toEqual([
      'To Do',
      'In Progress',
      'Done',
    ]);
    expect(cardTitles('To Do')).toEqual(['Write announcement', 'Set up monitoring']);
    expect(cardTitles('In Progress')).toEqual(['Rate-limit auth', 'Mobile layout']);
    expect(cardTitles('Done')).toEqual([]);
  });

  it("shows a card's description, labels and due date", async () => {
    mockBoard();
    renderBoard();
    await screen.findByRole('heading', { name: 'Product Launch' });

    const inProgress = within(screen.getByRole('region', { name: 'In Progress' }));
    expect(inProgress.getByText('Limit login attempts per IP.')).toBeInTheDocument();
    expect(inProgress.getByText('backend')).toBeInTheDocument();
    expect(inProgress.getByText('security')).toBeInTheDocument();
    expect(inProgress.getByText(new Date(DUE).toLocaleDateString())).toBeInTheDocument();
  });

  it('gives every list an add-card button and the board an add-list button', async () => {
    mockBoard();
    renderBoard();
    await screen.findByRole('heading', { name: 'Product Launch' });

    for (const name of ['To Do', 'In Progress', 'Done']) {
      expect(within(screen.getByRole('region', { name })).getByRole('button', { name: '+ Add card' })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: '+ Add list' })).toBeInTheDocument();
  });
});
