
import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { mockAgency } from '../../types';

const TopBar = () => {
  return (
    <div className="h-16 px-6 border-b bg-white flex items-center justify-between">
      <h2 className="text-xl font-semibold">{mockAgency.agencyName}</h2>
      
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-slate-100">
          <Bell className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-slate-100">
          <Settings className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="font-medium">Admin User</div>
          <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
            A
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
