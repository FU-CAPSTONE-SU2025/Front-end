import React from 'react';
import Header from './header';
import Footer from './footer';
import { Outlet } from 'react-router';

const StudentLayout: React.FC = () => {
  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-orange-500 to-blue-900 min-h-screen  pt-16">
      <div className='container '>
      <Outlet />
      </div>
      </div>
      <Footer />
    </>
  );
};

export default StudentLayout;