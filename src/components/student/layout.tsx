import React from 'react';
import Header from './header';
import Footer from './footer';
import { Outlet } from 'react-router';

const StudentLayout: React.FC = () => {
  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>
      <div className="bg-gradient-to-br from-orange-500 to-blue-900 pt-20 min-h-screen">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default StudentLayout;