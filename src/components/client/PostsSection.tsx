import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ArrowUp, ArrowDown, PlusCircle, Check } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '../common/StatusBadge';
import CreatePostModal from '../CreatePostModal';
import { mockIdeas, mockClients, Idea } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface PostsSectionProps {
  clientId: string;
}

type SortField = 'updated' | 'created' | 'title' | 'status';
type SortDirection = 'asc' | 'desc';

const SORT_STORAGE_KEY = 'posts-sort-preferences';

const getSortFieldLabel = (field: SortField): string => {
  switch (field) {
    case 'updated': return 'Last Updated';
    case 'created': return 'Date Created';
    case 'title': return 'Title';
    case 'status': return 'Status';
    default: return 'Last Updated';
  }
};

const PostsSection: React.FC<PostsSectionProps> = ({ clientId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Load sort preferences from localStorage
  const loadSortPreferences = () => {
    try {
      const stored = localStorage.getItem(SORT_STORAGE_KEY);
      if (stored) {
        const { field, direction } = JSON.parse(stored);
        return { field: field as SortField, direction: direction as SortDirection };
      }
    } catch (error) {
      console.error('Failed to load sort preferences:', error);
    }
    return { field: 'updated' as SortField, direction: 'desc' as SortDirection };
  };

  const [sortField, setSortField] = useState<SortField>(() => loadSortPreferences().field);
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => loadSortPreferences().direction);

  // Save sort preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify({ field: sortField, direction: sortDirection }));
    } catch (error) {
      console.error('Failed to save sort preferences:', error);
    }
  }, [sortField, sortDirection]);

  // Find ideas for this client
  const clientIdeas = mockIdeas.filter(idea => idea.clientId === clientId);

  // Get client information
  const getClientInfo = (clientId: string) => {
    return mockClients.find(client => client.id === clientId);
  };

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
      let comparison = 0;
      
      switch (sortField) {
        case 'updated':
          comparison = a.updatedAt.seconds - b.updatedAt.seconds;
          break;
        case 'created':
          comparison = a.createdAt.seconds - b.createdAt.seconds;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = a.updatedAt.seconds - b.updatedAt.seconds;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  };

  // Get allowed statuses for filter tabs
  const getAllowedStatuses = () => {
    return ['Drafted', 'Needs Visual', 'Waiting for Approval', 'Approved', 'Scheduled', 'Posted'];
  };

  const filteredPosts = getFilteredAndSortedPosts();
  const allowedStatuses = getAllowedStatuses();
  const clientInfo = getClientInfo(clientId);

  const handleSortFieldChange = (field: SortField) => {
    setSortField(field);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
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
        <div className="flex items-center gap-6 h-10">
          {/* Extended Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search posts..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-9 h-10" 
              />
            </div>
          </div>
          
          {/* Sort Control - Single Container with Split Interactivity */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="flex items-center h-10 border border-input bg-background rounded-lg overflow-hidden">
                {/* Arrow Icon (Left) - Toggles Direction */}
                <button
                  onClick={toggleSortDirection}
                  className="flex items-center justify-center w-10 h-full hover:bg-accent transition-colors border-r border-input"
                  aria-label="Toggle sort direction"
                  title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {sortDirection === 'asc' ? 
                    <ArrowUp className="h-4 w-4" /> : 
                    <ArrowDown className="h-4 w-4" />
                  }
                </button>

                {/* Dropdown Trigger (Rest of Container) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-between px-3 h-full min-w-[120px] hover:bg-accent transition-colors">
                      <span className="text-sm">{getSortFieldLabel(sortField)}</span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem 
                      onClick={() => handleSortFieldChange('updated')}
                      className="flex items-center justify-between"
                    >
                      Last Updated
                      {sortField === 'updated' && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleSortFieldChange('created')}
                      className="flex items-center justify-between"
                    >
                      Date Created
                      {sortField === 'created' && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleSortFieldChange('title')}
                      className="flex items-center justify-between"
                    >
                      Title
                      {sortField === 'title' && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleSortFieldChange('status')}
                      className="flex items-center justify-between"
                    >
                      Status
                      {sortField === 'status' && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* New Post Button */}
            <CreatePostModal>
              <Button className="bg-indigo-600 hover:bg-indigo-700 h-10">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </CreatePostModal>
          </div>
        </div>
      </div>
      
      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        {filteredPosts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Client</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map(idea => (
                <TableRow 
                  key={idea.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => window.location.href = `/clients/${idea.clientId}/ideas/${idea.id}`}
                >
                  <TableCell className="font-medium">
                    <div className="max-w-md">
                      <div className="font-medium text-gray-900 truncate" title={idea.title}>
                        {idea.title}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {idea.currentDraftText}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(idea.createdAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={idea.status} type="idea" />
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {clientInfo?.clientName || 'Unknown Client'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
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
