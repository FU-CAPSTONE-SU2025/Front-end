import React from 'react';
import Header from './header';
import Footer from './footer';
import { Outlet } from 'react-router';

const StudentLayout = () => {
  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen w-full">
        <div className="flex-1 w-full">
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default StudentLayout;