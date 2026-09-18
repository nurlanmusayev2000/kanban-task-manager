import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { List } from '../../../types';
import { KanbanCard } from './KanbanCard';
import { AddCardForm } from './AddCardForm';
import { useDeleteListMutation, useUpdateListMutation } from '../../../services/api/apiSlice';

interface KanbanListProps {
  list: List;
  boardId: string;
  onCardClick: (cardId: string) => void;
}

export const KanbanList: React.FC<KanbanListProps> = ({ list, boardId, onCardClick }) => {
  const { setNodeRef } = useDroppable({ id: list._id, data: { type: 'list', listId: list._id } });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [updateList] = useUpdateListMutation();
  const [deleteList] = useDeleteListMutation();

  const sortedCards = [...list.cards].sort((a, b) => a.position - b.position);

  const saveTitle = async () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== list.title) {
      await updateList({ listId: list._id, boardId, title }).unwrap();
    } else {
      setTitle(list.title);
    }
  };

  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-lg bg-gray-100 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        {isEditingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
            className="w-full rounded border border-blue-400 px-1 py-0.5 text-sm font-semibold"
          />
        ) : (
          <h2
            className="cursor-text truncate text-sm font-semibold"
            onClick={() => setIsEditingTitle(true)}
          >
            {list.title}
          </h2>
        )}
        <button
          onClick={() => confirm(`Delete list "${list.title}"?`) && deleteList({ listId: list._id, boardId })}
          className="text-gray-400 hover:text-red-600"
          aria-label="Delete list"
        >
          ✕
        </button>
      </div>

      <div ref={setNodeRef} className="flex min-h-[4px] flex-col gap-2">
        <SortableContext items={sortedCards.map((c) => c._id)} strategy={verticalListSortingStrategy}>
          {sortedCards.map((card) => (
            <KanbanCard key={card._id} card={card} onClick={() => onCardClick(card._id)} />
          ))}
        </SortableContext>
      </div>

      <AddCardForm listId={list._id} boardId={boardId} />
    </div>
  );
};
