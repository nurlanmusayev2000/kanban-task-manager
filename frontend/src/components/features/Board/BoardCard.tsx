import React from 'react';
import { Link } from 'react-router-dom';
import type { Board } from '../../../types';

export const BoardCard: React.FC<{ board: Board }> = ({ board }) => (
  <Link
    to={`/boards/${board._id}`}
    className="block rounded-lg p-4 text-white shadow transition-transform hover:scale-[1.02]"
    style={{ backgroundColor: board.color }}
  >
    <h3 className="font-semibold">{board.title}</h3>
    {board.description && <p className="mt-1 text-sm opacity-90">{board.description}</p>}
  </Link>
);
