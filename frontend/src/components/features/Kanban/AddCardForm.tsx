import React, { useState } from 'react';
import { useCreateCardMutation } from '../../../services/api/apiSlice';

export const AddCardForm: React.FC<{ listId: string; boardId: string }> = ({ listId, boardId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [createCard, { isLoading }] = useCreateCardMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createCard({ listId, title, boardId }).unwrap();
    setTitle('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mt-2 w-full rounded p-2 text-left text-sm text-gray-500 hover:bg-gray-200"
      >
        + Add card
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-col gap-2">
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Card title"
        className="resize-none rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
        rows={2}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit(e);
          }
          if (e.key === 'Escape') setIsOpen(false);
        }}
      />
      <div className="flex gap-2">
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
