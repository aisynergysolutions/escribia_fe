
import React from 'react';
import { Search, Plus, Bell, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const TopBar = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="h-14 px-6 bg-neutral-50 flex items-center justify-between border-b border-neutral-200">
      {/* Left - Logo */}
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-semibold text-primary-600">escribia.io</h1>
      </div>

      {/* Center - Page Title */}
      <div className="flex-1 text-center">
        <h2 className="text-2xl font-semibold text-neutral-900">Dashboard</h2>
      </div>
      
      {/* Right - Date, Search, New Post, Avatar */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-600">
          Today • {formattedDate.replace(/,.*/, `, ${today.getFullYear()}`)}
        </span>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input 
            placeholder="Search..." 
            className="pl-9 w-64 h-9 bg-white border-neutral-300 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
        
        <Button className="bg-primary-600 hover:bg-primary-700 text-white h-9 px-4">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
        
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Bell className="h-5 w-5 text-neutral-600" />
        </Button>
        
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Settings className="h-5 w-5 text-neutral-600" />
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-primary-600 text-white text-sm">A</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default TopBar;
