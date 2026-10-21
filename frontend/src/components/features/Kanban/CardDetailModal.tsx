import React, { useEffect, useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import type { Card } from '../../../types';
import { useAddCommentMutation, useDeleteCardMutation, useUpdateCardMutation } from '../../../services/api/apiSlice';

interface CardDetailModalProps {
  card: Card | null;
  boardId: string;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, boardId, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [commentText, setCommentText] = useState('');
  const [updateCard] = useUpdateCardMutation();
  const [deleteCard] = useDeleteCardMutation();
  const [addComment] = useAddCommentMutation();

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setLabelsInput(card.labels.join(', '));
      setDueDate(card.dueDate ? card.dueDate.slice(0, 10) : '');
    }
  }, [card]);

  if (!card) return null;

  const save = async () => {
    await updateCard({
      cardId: card._id,
      boardId,
      title,
      description,
      labels: labelsInput.split(',').map((l) => l.trim()).filter(Boolean),
      dueDate: dueDate || null,
    }).unwrap();
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('Delete this card?')) {
      await deleteCard({ cardId: card._id, boardId }).unwrap();
      onClose();
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment({ cardId: card._id, boardId, text: commentText }).unwrap();
    setCommentText('');
  };

  return (
    <Modal isOpen={Boolean(card)} onClose={onClose} title="Card details">
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">Labels (comma separated)</label>
            <input
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="mb-2 text-sm font-semibold">Comments</h3>
          <div className="mb-2 flex max-h-40 flex-col gap-2 overflow-y-auto">
            {card.comments.map((c, i) => (
              <div key={i} className="rounded bg-gray-100 p-2 text-sm">
                {c.text}
              </div>
            ))}
            {card.comments.length === 0 && <p className="text-xs text-gray-400">No comments yet.</p>}
          </div>
          <form onSubmit={submitComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment"
              className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
            />
            <Button type="submit">Post</Button>
          </form>
        </div>
      </div>
    </Modal>
  );
};
