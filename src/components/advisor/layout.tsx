import React from 'react';
import Header from './header';
import GlobalChatBox from './globalChatBox';
import { Outlet } from 'react-router';

const AdvisorLayout = () => {
  return (
   
    <>
      <Header />
      <main className="mt-15">
        <Outlet />
      </main>
      <GlobalChatBox />
    </>

  );
};

export default AdvisorLayout; 