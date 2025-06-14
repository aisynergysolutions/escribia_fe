
import React, { useState } from 'react';
import { Search, ArrowUpDown, PlusCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import IdeaCard from '../ui/IdeaCard';
import CreatePostModal from '../CreatePostModal';
import { mockIdeas, Idea } from '../../types';

interface PostsSectionProps {
  clientId: string;
}

const PostsSection: React.FC<PostsSectionProps> = ({ clientId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'status'>('updated');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Find ideas for this client
  const clientIdeas = mockIdeas.filter(idea => idea.clientId === clientId);

  // Filter and sort posts
  const getFilteredAndSortedPosts = (): Idea[] => {
    let filtered = clientIdeas;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        idea.currentDraftText.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(idea => idea.status === statusFilter);
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return b.updatedAt.seconds - a.updatedAt.seconds;
        case 'created':
          return b.createdAt.seconds - a.createdAt.seconds;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    return filtered;
  };

  // Get allowed statuses for filter tabs
  const getAllowedStatuses = () => {
    return ['Drafting', 'Reviewed', 'Scheduled', 'Published'];
  };

  const filteredPosts = getFilteredAndSortedPosts();
  const allowedStatuses = getAllowedStatuses();

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            All ({clientIdeas.length})
          </TabsTrigger>
          {allowedStatuses.map(status => {
            const count = clientIdeas.filter(idea => idea.status === status).length;
            return (
              <TabsTrigger 
                key={status} 
                value={status} 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                {status} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Search and Sort Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search posts..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-9" 
              />
            </div>
          </div>
          
          {/* Sort and New Post Button */}
          <div className="flex gap-4 items-center">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[160px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="created">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            
            <CreatePostModal>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </CreatePostModal>
          </div>
        </div>
      </div>
      
      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map(idea => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
        
        {filteredPosts.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? "No posts match your filters." 
                : "No posts found for this client yet."
              }
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }} 
                className="mt-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsSection;
