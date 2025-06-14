
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-grow pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
