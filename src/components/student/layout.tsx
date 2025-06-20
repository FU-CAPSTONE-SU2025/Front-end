import React from 'react';
import Header from './header';
import Footer from './footer';
import { Outlet } from 'react-router';

const StudentLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <Header />
      
        <Outlet />
     
      <Footer />
    </div>
  );
};

export default StudentLayout;