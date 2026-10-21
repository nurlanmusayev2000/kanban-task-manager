import { Response } from 'express';
import { Card } from '../models/Card.model';
import { List } from '../models/List.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler.middleware';
import { AuthRequest } from '../types';
import { requireBoardAccess } from './boards.controller';
import { placeCard, renumberCards } from '../utils/positions';

export const createCard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { listId, title, description, labels, dueDate } = req.body;
  if (!listId || !title) throw new ApiError(400, 'listId and title are required');

  const list = await List.findById(listId);
  if (!list) throw new ApiError(404, 'List not found');
  await requireBoardAccess(list.board.toString(), req.user!.userId);

  const count = await Card.countDocuments({ list: listId });
  const card = await Card.create({
    title,
    description,
    labels,
    dueDate,
    list: listId,
    board: list.board,
    position: count,
  });

  res.status(201).json({ card });
});

export const updateCard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const card = await Card.findById(req.params.id);
  if (!card) throw new ApiError(404, 'Card not found');
  await requireBoardAccess(card.board.toString(), req.user!.userId);

  const { title, description, listId, position, labels, dueDate, assignees } = req.body;
  if (position !== undefined && (!Number.isInteger(position) || position < 0)) {
    throw new ApiError(400, 'position must be a non-negative integer');
  }

  const fromListId = card.list.toString();
  if (listId !== undefined && listId !== fromListId) {
    const targetList = await List.findById(listId);
    if (!targetList) throw new ApiError(404, 'Target list not found');
    if (targetList.board.toString() !== card.board.toString()) {
      throw new ApiError(400, 'Cannot move card to a list on a different board');
    }
    card.list = targetList._id;
  }

  if (title !== undefined) card.title = title;
  if (description !== undefined) card.description = description;
  if (labels !== undefined) card.labels = labels;
  if (dueDate !== undefined) card.dueDate = dueDate;
  if (assignees !== undefined) card.assignees = assignees;

  await card.save();

  // Moving a card shifts its neighbours, so renumber the affected lists.
  if (position !== undefined || card.list.toString() !== fromListId) {
    card.position = await placeCard(card._id, card.list, position, fromListId);
  }
  res.json({ card });
});

export const deleteCard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const card = await Card.findById(req.params.id);
  if (!card) throw new ApiError(404, 'Card not found');
  await requireBoardAccess(card.board.toString(), req.user!.userId);

  await card.deleteOne();
  await renumberCards(card.list);
  res.json({ message: 'Card deleted' });
});

export const addComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { text } = req.body;
  if (!text) throw new ApiError(400, 'Comment text is required');

  const card = await Card.findById(req.params.id);
  if (!card) throw new ApiError(404, 'Card not found');
  await requireBoardAccess(card.board.toString(), req.user!.userId);

  card.comments.push({ author: req.user!.userId as any, text, createdAt: new Date() });
  await card.save();

  res.status(201).json({ comments: card.comments });
});
