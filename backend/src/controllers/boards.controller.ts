import { Response } from 'express';
import { Board } from '../models/Board.model';
import { List } from '../models/List.model';
import { Card } from '../models/Card.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler.middleware';
import { AuthRequest } from '../types';

async function requireBoardAccess(boardId: string, userId: string) {
  const board = await Board.findById(boardId);
  if (!board) throw new ApiError(404, 'Board not found');
  const isMember =
    board.owner.toString() === userId ||
    board.members.some((m) => m.toString() === userId);
  if (!isMember) throw new ApiError(403, 'You do not have access to this board');
  return board;
}

export const getBoards = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const boards = await Board.find({
    $or: [{ owner: userId }, { members: userId }],
  }).sort({ createdAt: -1 });
  res.json({ boards });
});

export const createBoard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, color } = req.body;
  if (!title) throw new ApiError(400, 'Title is required');

  const board = await Board.create({
    title,
    description,
    color,
    owner: req.user!.userId,
    members: [],
  });
  res.status(201).json({ board });
});

export const getBoard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const board = await requireBoardAccess(String(req.params.id), req.user!.userId);

  const lists = await List.find({ board: board.id }).sort({ position: 1 }).lean();
  const cards = await Card.find({ board: board.id }).sort({ position: 1 }).lean();

  const listsWithCards = lists.map((list) => ({
    ...list,
    cards: cards.filter((card) => card.list.toString() === list._id.toString()),
  }));

  res.json({ board, lists: listsWithCards });
});

export const updateBoard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const board = await requireBoardAccess(String(req.params.id), req.user!.userId);
  const { title, description, color, members } = req.body;

  if (title !== undefined) board.title = title;
  if (description !== undefined) board.description = description;
  if (color !== undefined) board.color = color;
  if (members !== undefined) board.members = members;

  await board.save();
  res.json({ board });
});

export const deleteBoard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const board = await Board.findById(req.params.id);
  if (!board) throw new ApiError(404, 'Board not found');
  if (board.owner.toString() !== req.user!.userId) {
    throw new ApiError(403, 'Only the owner can delete this board');
  }

  const lists = await List.find({ board: board.id }).select('_id');
  await Card.deleteMany({ board: board.id });
  await List.deleteMany({ board: board.id });
  await board.deleteOne();

  res.json({ message: 'Board deleted', listsRemoved: lists.length });
});

export { requireBoardAccess };
