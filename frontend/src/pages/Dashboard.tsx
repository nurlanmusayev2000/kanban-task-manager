import { useState } from 'react';
import { useGetBoardsQuery } from '../services/api/apiSlice';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { BoardCard } from '../components/features/Board/BoardCard';
import { CreateBoardModal } from '../components/features/Board/CreateBoardModal';

export default function Dashboard() {
  const { data, isLoading } = useGetBoardsQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your boards</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ New board</Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : data?.boards.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {data.boards.map((board) => (
            <BoardCard key={board._id} board={board} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No boards yet. Create your first one.</p>
      )}

      <CreateBoardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
