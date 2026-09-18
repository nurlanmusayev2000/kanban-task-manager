import React, { useState } from 'react';
import { useCreateListMutation } from '../../../services/api/apiSlice';

export const AddListForm: React.FC<{ boardId: string }> = ({ boardId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [createList, { isLoading }] = useCreateListMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createList({ boardId, title }).unwrap();
    setTitle('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="h-fit w-72 flex-shrink-0 rounded-lg bg-gray-200/60 p-3 text-left text-sm text-gray-600 hover:bg-gray-200"
      >
        + Add list
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="w-72 flex-shrink-0 rounded-lg bg-gray-100 p-3">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="List title"
        className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
      />
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
        <button type="button" onClick={() => setIsOpen(false)} className="text-sm text-gray-500">
          Cancel
        </button>
      </div>
    </form>
  );
};
