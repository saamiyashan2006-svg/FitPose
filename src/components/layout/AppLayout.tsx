import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block lg:w-72 lg:shrink-0">
        <Sidebar open={false} onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      {/* mobile sidebar */}
      <div className="lg:hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
    </div>
  );
}
