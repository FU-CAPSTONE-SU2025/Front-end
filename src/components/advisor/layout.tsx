import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';

const AdvisorLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdvisorLayout; 