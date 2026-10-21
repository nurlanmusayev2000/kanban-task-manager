import { Types } from 'mongoose';
import { Card } from '../models/Card.model';
import { List } from '../models/List.model';

type Id = Types.ObjectId | string;

function positionUpdates(ids: Id[]) {
  return ids.map((id, position) => ({
    updateOne: { filter: { _id: id }, update: { $set: { position } } },
  }));
}

async function orderedCardIds(listId: Id, excludeCardId?: Id): Promise<Types.ObjectId[]> {
  const cards = await Card.find({ list: listId, ...(excludeCardId && { _id: { $ne: excludeCardId } }) })
    .sort({ position: 1, createdAt: 1 })
    .select('_id');
  return cards.map((c) => c._id as Types.ObjectId);
}

/**
 * Puts a card at `index` in its current list (clamped to the list's length)
 * and renumbers the list 0..n-1. When the card came from another list, that
 * list is renumbered too so it has no gap. Returns the card's final position.
 */
export async function placeCard(cardId: Id, listId: Id, index: number | undefined, fromListId?: Id): Promise<number> {
  const ids = await orderedCardIds(listId, cardId);
  const position = Math.max(0, Math.min(index ?? ids.length, ids.length));
  ids.splice(position, 0, new Types.ObjectId(cardId.toString()));

  const updates = positionUpdates(ids);
  if (fromListId && fromListId.toString() !== listId.toString()) {
    updates.push(...positionUpdates(await orderedCardIds(fromListId)));
  }
  await Card.bulkWrite(updates);
  return position;
}

/** Renumbers a list's cards 0..n-1, e.g. after one is deleted. */
export async function renumberCards(listId: Id): Promise<void> {
  const ids = await orderedCardIds(listId);
  if (ids.length) await Card.bulkWrite(positionUpdates(ids));
}

/** Renumbers a board's lists 0..n-1, e.g. after one is deleted. */
export async function renumberLists(boardId: Id): Promise<void> {
  const lists = await List.find({ board: boardId }).sort({ position: 1, createdAt: 1 }).select('_id');
  if (lists.length) await List.bulkWrite(positionUpdates(lists.map((l) => l._id as Types.ObjectId)));
}
