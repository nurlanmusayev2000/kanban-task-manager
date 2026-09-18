import { Response } from 'express';
import { List } from '../models/List.model';
import { Card } from '../models/Card.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler.middleware';
import { AuthRequest } from '../types';
import { requireBoardAccess } from './boards.controller';

export const createList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { boardId, title } = req.body;
  if (!boardId || !title) throw new ApiError(400, 'boardId and title are required');

  await requireBoardAccess(boardId, req.user!.userId);

  const count = await List.countDocuments({ board: boardId });
  const list = await List.create({ title, board: boardId, position: count });

  res.status(201).json({ list });
});

export const updateList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const list = await List.findById(req.params.id);
  if (!list) throw new ApiError(404, 'List not found');
  await requireBoardAccess(list.board.toString(), req.user!.userId);

  const { title, position } = req.body;
  if (title !== undefined) list.title = title;
  if (position !== undefined) list.position = position;

  await list.save();
  res.json({ list });
});

export const deleteList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const list = await List.findById(req.params.id);
  if (!list) throw new ApiError(404, 'List not found');
  await requireBoardAccess(list.board.toString(), req.user!.userId);

  await Card.deleteMany({ list: list.id });
  await list.deleteOne();

  res.json({ message: 'List deleted' });
});
