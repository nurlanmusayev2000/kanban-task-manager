import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const Layout: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <main>
      <Outlet />
    </main>
  </div>
);
