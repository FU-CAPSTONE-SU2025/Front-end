import { Outlet } from 'react-router';
import ManagerHeader from './header';

const ManagerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerHeader />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout; 