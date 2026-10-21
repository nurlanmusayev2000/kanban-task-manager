import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Board, BoardWithLists, Card, List, User } from '../../types';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Board', 'BoardDetail'],
  endpoints: (builder) => ({
    signup: builder.mutation<{ token: string; user: User }, { email: string; password: string; name: string }>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
    }),
    login: builder.mutation<{ token: string; user: User }, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    getCurrentUser: builder.query<{ user: User }, void>({
      query: () => '/auth/me',
    }),

    getBoards: builder.query<{ boards: Board[] }, void>({
      query: () => '/boards',
      providesTags: (result) =>
        result
          ? [...result.boards.map((b) => ({ type: 'Board' as const, id: b._id })), { type: 'Board', id: 'LIST' }]
          : [{ type: 'Board', id: 'LIST' }],
    }),
    getBoard: builder.query<{ board: Board; lists: List[] }, string>({
      query: (boardId) => `/boards/${boardId}`,
      providesTags: (_result, _error, boardId) => [{ type: 'BoardDetail', id: boardId }],
    }),
    createBoard: builder.mutation<{ board: Board }, { title: string; description?: string; color?: string }>({
      query: (body) => ({ url: '/boards', method: 'POST', body }),
      invalidatesTags: [{ type: 'Board', id: 'LIST' }],
    }),
    updateBoard: builder.mutation<{ board: Board }, { boardId: string } & Partial<Pick<Board, 'title' | 'description' | 'color'>>>({
      query: ({ boardId, ...body }) => ({ url: `/boards/${boardId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Board', id: 'LIST' }, { type: 'BoardDetail', id: arg.boardId }],
    }),
    deleteBoard: builder.mutation<{ message: string }, string>({
      query: (boardId) => ({ url: `/boards/${boardId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Board', id: 'LIST' }],
    }),

    createList: builder.mutation<{ list: List }, { boardId: string; title: string }>({
      query: (body) => ({ url: '/lists', method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'BoardDetail', id: arg.boardId }],
    }),
    updateList: builder.mutation<{ list: List }, { listId: string; boardId: string; title?: string; position?: number }>({
      query: ({ listId, ...body }) => ({ url: `/lists/${listId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'BoardDetail', id: arg.boardId }],
    }),
    deleteList: builder.mutation<{ message: string }, { listId: string; boardId: string }>({
      query: ({ listId }) => ({ url: `/lists/${listId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'BoardDetail', id: arg.boardId }],
    }),

    createCard: builder.mutation<{ card: Card }, { listId: string; title: string; description?: string; boardId: string }>({
      query: ({ boardId: _boardId, ...body }) => ({ url: '/cards', method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'BoardDetail', id: arg.boardId }],
    }),
    updateCard: builder.mutation<
      { card: Card },
      { cardId: string; boardId: string; title?: string; description?: string; listId?: string; position?: number; labels?: string[]; dueDate?: string | null }
    >({
      query: ({ cardId, boardId: _boardId, ...body }) => ({ url: `/cards/${cardId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'BoardDetail', id: arg.boardId }],
    }),
    deleteCard: builder.mutation<{ message: string }, { cardId: string; boardId: string }>({
      query: ({ cardId }) => ({ url: `/cards/${cardId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'BoardDetail', id: arg.boardId }],
    }),
    addComment: builder.mutation<{ comments: Card['comments'] }, { cardId: string; boardId: string; text: string }>({
      query: ({ cardId, text }) => ({ url: `/cards/${cardId}/comments`, method: 'POST', body: { text } }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'BoardDetail', id: arg.boardId }],
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useGetCurrentUserQuery,
  useGetBoardsQuery,
  useGetBoardQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useAddCommentMutation,
} = api;

export type { BoardWithLists };
