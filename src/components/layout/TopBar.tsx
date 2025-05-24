
import React from 'react';
import { Search, Plus, Bell } from 'lucide-react';
import { Button } from '../ui/button';

const TopBar = () => {
  return (
    <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients, posts, templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
        
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-sm">
            JD
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
