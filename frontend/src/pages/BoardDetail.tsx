import { useParams } from 'react-router-dom';
import { KanbanBoard } from '../components/features/Kanban/KanbanBoard';

export default function BoardDetail() {
  const { boardId } = useParams<{ boardId: string }>();
  if (!boardId) return null;
  return <KanbanBoard boardId={boardId} />;
}
