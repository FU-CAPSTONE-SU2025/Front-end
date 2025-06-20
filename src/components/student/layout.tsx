import React from 'react';
import Header from './header';
import Footer from './footer';
import { Outlet } from 'react-router';


const StudentLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default StudentLayout;