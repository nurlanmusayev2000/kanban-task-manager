import React from 'react';
import type { Card } from '../../../types';

/** The visible body of a card, shared by the sortable card and the drag overlay. */
export const KanbanCardContent: React.FC<{ card: Card }> = ({ card }) => (
  <>
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
  </>
);
