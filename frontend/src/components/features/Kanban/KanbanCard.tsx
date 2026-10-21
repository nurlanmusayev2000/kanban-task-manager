import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '../../../types';
import { KanbanCardContent } from './KanbanCardContent';

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
      <KanbanCardContent card={card} />
    </div>
  );
};
