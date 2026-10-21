import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../store/slices/authSlice';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <Link to="/" className="text-lg font-bold text-blue-600">
        Kanban
      </Link>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.name}</span>
          <Button variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      )}
    </header>
  );
};
