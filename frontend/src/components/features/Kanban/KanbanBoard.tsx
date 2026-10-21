import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useGetBoardQuery, useUpdateCardMutation } from '../../../services/api/apiSlice';
import { Loading } from '../../common/Loading';
import { KanbanList } from './KanbanList';
import { AddListForm } from './AddListForm';
import { CardDetailModal } from './CardDetailModal';
import { KanbanCardContent } from './KanbanCardContent';
import type { List } from '../../../types';

export const KanbanBoard: React.FC<{ boardId: string }> = ({ boardId }) => {
  const { data, isLoading } = useGetBoardQuery(boardId);
  const [updateCard] = useUpdateCardMutation();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: DragStartEvent) => setDraggedCardId(event.active.id as string);

  const handleDragEnd = async (event: DragEndEvent) => {
    setDraggedCardId(null);
    const { active, over } = event;
    if (!over || !data) return;

    const lists = data.lists;
    const sourceList = lists.find((l) => l.cards.some((c) => c._id === active.id));
    if (!sourceList) return;

    let targetListId: string;
    let targetIndex: number;

    const overIsList = lists.some((l) => l._id === over.id);
    if (overIsList) {
      targetListId = over.id as string;
      const targetList = lists.find((l) => l._id === targetListId) as List;
      targetIndex = targetList.cards.length;
    } else {
      const targetList = lists.find((l) => l.cards.some((c) => c._id === over.id));
      if (!targetList) return;
      targetListId = targetList._id;
      targetIndex = [...targetList.cards]
        .sort((a, b) => a.position - b.position)
        .findIndex((c) => c._id === over.id);
    }

    if (targetListId === sourceList._id && active.id === over.id) return;

    try {
      await updateCard({
        cardId: active.id as string,
        boardId,
        listId: targetListId,
        position: targetIndex,
      }).unwrap();
    } catch {
      // The optimistic move is rolled back in the mutation; the card returns to where it was.
    }
  };

  if (isLoading || !data) return <Loading label="Loading board..." />;

  const sortedLists = [...data.lists].sort((a, b) => a.position - b.position);
  const allCards = sortedLists.flatMap((l) => l.cards);
  const activeCard = activeCardId ? allCards.find((c) => c._id === activeCardId) || null : null;
  const draggedCard = draggedCardId ? allCards.find((c) => c._id === draggedCardId) : undefined;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-bold">{data.board.title}</h1>
        {data.board.description && <span className="text-sm text-gray-500">{data.board.description}</span>}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggedCardId(null)}
      >
        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          {sortedLists.map((list) => (
            <KanbanList key={list._id} list={list} boardId={boardId} onCardClick={setActiveCardId} />
          ))}
          <AddListForm boardId={boardId} />
        </div>
        {/* A floating copy follows the pointer across lists; the original stays in place, faded. */}
        <DragOverlay>
          {draggedCard && (
            <div className="w-[264px] cursor-grabbing rounded-lg bg-white p-3 shadow-lg ring-1 ring-black/5">
              <KanbanCardContent card={draggedCard} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CardDetailModal card={activeCard} boardId={boardId} onClose={() => setActiveCardId(null)} />
    </div>
  );
};
