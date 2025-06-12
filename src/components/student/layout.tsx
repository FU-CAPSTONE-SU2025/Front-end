import React from 'react';
import Header from './header';
import Footer from './footer';
import { Outlet } from 'react-router';

const StudentLayout: React.FC = () => {
  return (
  
     <>
      <Header />
     
        <Outlet />
     
      <Footer />
     </>
   
  );
};

export default StudentLayout;