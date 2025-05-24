
import React from 'react';
import { Bell } from 'lucide-react';

const TopBar = () => {
  return (
    <div className="h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between">
      <div className="flex items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
