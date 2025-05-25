
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ClientSidebar from './ClientSidebar';

const MainLayout = () => {
  const location = useLocation();
  
  // Check if we're on a client-specific page
  // This includes: /clients/[clientId], /clients/[clientId]/*, and /clients/[clientId]/ideas/[ideaId]
  const isClientPage = location.pathname.startsWith('/clients/') && 
                       location.pathname !== '/clients' &&
                       location.pathname.match(/^\/clients\/[^\/]+/); // Any path that starts with /clients/[clientId]

  return (
    <div className="flex h-screen">
      {isClientPage ? <ClientSidebar /> : <Sidebar />}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto bg-slate-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
