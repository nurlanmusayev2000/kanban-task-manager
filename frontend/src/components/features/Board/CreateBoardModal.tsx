import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateBoardMutation } from '../../../services/api/apiSlice';
import { Modal } from '../../common/Modal';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { getErrorMessage } from '../../../utils/errors';

interface CreateBoardForm {
  title: string;
  description?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const CreateBoardModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset } = useForm<CreateBoardForm>();
  const [color, setColor] = useState(COLORS[0]);
  const [createBoard, { isLoading, error }] = useCreateBoardMutation();

  const onSubmit = async (data: CreateBoardForm) => {
    await createBoard({ ...data, color }).unwrap();
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create board">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Title" {...register('title', { required: true })} autoFocus />
        <Input label="Description (optional)" {...register('description')} />
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">Color</span>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full border-2"
                style={{ backgroundColor: c, borderColor: color === c ? '#111827' : 'transparent' }}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{getErrorMessage(error)}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};
