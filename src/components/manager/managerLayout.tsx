import { Outlet } from 'react-router';
import ManagerHeader from './header';

const ManagerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <ManagerHeader />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout; 