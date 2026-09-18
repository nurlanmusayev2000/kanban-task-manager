import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '../../../types';

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ card, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { type: 'card', card },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="cursor-grab rounded-lg bg-white p-3 shadow-sm hover:shadow-md active:cursor-grabbing"
    >
      <h3 className="text-sm font-medium">{card.title}</h3>
      {card.description && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{card.description}</p>}
      {(card.labels.length > 0 || card.dueDate) && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {card.labels.map((label) => (
            <span key={label} className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
              {label}
            </span>
          ))}
          {card.dueDate && (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              {new Date(card.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
