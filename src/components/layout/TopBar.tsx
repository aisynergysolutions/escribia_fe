
import React from 'react';
import { Search, Plus, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TopBar = () => {
  return (
    <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between">
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search clients, posts, templates..."
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
        
        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5 text-slate-600" />
        </button>
        
        <div className="flex items-center gap-3 ml-2">
          <div className="text-right">
            <div className="text-sm font-medium text-slate-900">JD</div>
          </div>
          <div className="h-8 w-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-medium">
            JD
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
