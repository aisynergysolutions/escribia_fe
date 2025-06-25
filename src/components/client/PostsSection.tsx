
import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, Plus, MoreHorizontal, Copy, Trash2, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import StatusBadge from '../common/StatusBadge';
import CreatePostModal from '../CreatePostModal';
import { mockIdeas, mockClients, Idea } from '../../types';
import { formatDate, formatDateTime, formatRelativeTime } from '../../utils/dateUtils';

interface PostsSectionProps {
  clientId: string;
}

type SortField = 'updated' | 'created' | 'title' | 'status' | 'profile' | 'scheduled';
type SortDirection = 'asc' | 'desc' | 'none';

const SORT_STORAGE_KEY = 'posts-sort-preferences';

const PostsSection: React.FC<PostsSectionProps> = ({ clientId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
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

    // Filter by status (only if statusFilter is not empty)
    if (statusFilter) {
      filtered = filtered.filter(idea => idea.status === statusFilter);
    }

    // Sort posts
    if (sortDirection !== 'none') {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (sortField) {
          case 'updated':
            comparison = a.updatedAt.seconds - b.updatedAt.seconds;
            break;
          case 'created':
            comparison = a.createdAt.seconds - b.createdAt.seconds;
            break;
          case 'scheduled':
            // For scheduled posts, compare the actual scheduled dates
            const aScheduled = getScheduledTimestamp(a);
            const bScheduled = getScheduledTimestamp(b);
            if (aScheduled && bScheduled) {
              comparison = aScheduled - bScheduled;
            } else if (aScheduled) {
              comparison = -1; // a has scheduled date, b doesn't
            } else if (bScheduled) {
              comparison = 1; // b has scheduled date, a doesn't
            } else {
              comparison = 0; // neither has scheduled date
            }
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          case 'profile':
            const clientA = getClientInfo(a.clientId)?.clientName || '';
            const clientB = getClientInfo(b.clientId)?.clientName || '';
            comparison = clientA.localeCompare(clientB);
            break;
          default:
            comparison = a.updatedAt.seconds - b.updatedAt.seconds;
        }
        
        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }
    
    return filtered;
  };

  // Get allowed statuses for filter tabs
  const getAllowedStatuses = () => {
    return ['Drafted', 'Needs Visual', 'Waiting Approval', 'Approved', 'Scheduled', 'Published'];
  };

  const filteredPosts = getFilteredAndSortedPosts();
  const allowedStatuses = getAllowedStatuses();
  const clientInfo = getClientInfo(clientId);

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through sort directions: asc -> desc -> none
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection('none');
        setSortField('updated'); // Reset to default
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      // For date columns, start with desc (newest first)
      if (field === 'updated' || field === 'created' || field === 'scheduled') {
        setSortDirection('desc');
      } else {
        // For text columns, start with asc (A-Z)
        setSortDirection('asc');
      }
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField === field && sortDirection !== 'none') {
      return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    }
    return null;
  };

  const handleDuplicate = (postId: string) => {
    console.log('Duplicating post:', postId);
  };

  const handleDelete = (postId: string) => {
    console.log('Deleting post:', postId);
  };

  const getScheduledTimestamp = (idea: Idea) => {
    if (idea.status === 'Scheduled' || idea.status === 'Published') {
      return idea.createdAt.seconds;
    }
    return null;
  };

  const getScheduledDate = (idea: Idea) => {
    const timestamp = getScheduledTimestamp(idea);
    if (timestamp) {
      return formatRelativeTime({ seconds: timestamp });
    }
    return '—';
  };

  const handleStatusFilterChange = (value: string) => {
    if (value === statusFilter) {
      // Clicking on active tab - deselect it
      setStatusFilter('');
    } else {
      setStatusFilter(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Unified Control Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between gap-6">
          {/* Left Side: Status Filter Tabs */}
          <div className="flex-1 min-w-0">
            <div className="relative group">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                <div className="flex gap-2">
                  {allowedStatuses.map(status => {
                    const count = clientIdeas.filter(idea => idea.status === status).length;
                    const isActive = statusFilter === status;
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusFilterChange(status)}
                        className={`
                          relative group/tab flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0
                          ${isActive 
                            ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        <span>{status} ({count})</span>
                        {isActive && (
                          <X className="h-3 w-3 opacity-0 group-hover/tab:opacity-100 transition-opacity" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Gradient fade for overflow indication */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>
          </div>
          
          {/* Right Side: Search & Primary Action */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search posts..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-9 h-10 w-40" 
              />
            </div>
            
            {/* New Post Button */}
            <CreatePostModal>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 h-10 w-10 p-0">
                      <div className="relative">
                        <Plus className="h-4 w-4" />
                        <div className="absolute -inset-1 border border-current rounded-full opacity-60" />
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    New Post
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CreatePostModal>
          </div>
        </div>
      </div>
      
      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        {filteredPosts.length > 0 ? (
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                    <button
                      onClick={() => handleColumnSort('title')}
                      className="flex items-center gap-2 hover:bg-gray-100 p-2 -m-2 rounded cursor-pointer transition-colors"
                    >
                      POST
                      {getSortIcon('title')}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                    <button
                      onClick={() => handleColumnSort('profile')}
                      className="flex items-center gap-2 hover:bg-gray-100 p-2 -m-2 rounded cursor-pointer transition-colors"
                    >
                      PROFILE
                      {getSortIcon('profile')}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                    <button
                      onClick={() => handleColumnSort('status')}
                      className="flex items-center gap-2 hover:bg-gray-100 p-2 -m-2 rounded cursor-pointer transition-colors"
                    >
                      STATUS
                      {getSortIcon('status')}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                    <button
                      onClick={() => handleColumnSort('updated')}
                      className="flex items-center gap-2 hover:bg-gray-100 p-2 -m-2 rounded cursor-pointer transition-colors"
                    >
                      LAST UPDATED
                      {getSortIcon('updated')}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                    <button
                      onClick={() => handleColumnSort('scheduled')}
                      className="flex items-center gap-2 hover:bg-gray-100 p-2 -m-2 rounded cursor-pointer transition-colors"
                    >
                      SCHEDULED FOR
                      {getSortIcon('scheduled')}
                    </button>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map(idea => (
                  <TableRow 
                    key={idea.id} 
                    className="cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                    onClick={() => window.location.href = `/clients/${idea.clientId}/ideas/${idea.id}`}
                  >
                    <TableCell className="py-4">
                      <div className="font-semibold text-gray-900">
                        {idea.title}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {clientInfo?.clientName || 'Unknown Client'}
                    </TableCell>
                    <TableCell className="py-4">
                      <StatusBadge status={idea.status} type="idea" />
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      <Tooltip>
                        <TooltipTrigger>
                          {formatRelativeTime(idea.updatedAt)}
                        </TooltipTrigger>
                        <TooltipContent>
                          {formatDateTime(idea.updatedAt)}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {getScheduledTimestamp(idea) ? (
                        <Tooltip>
                          <TooltipTrigger>
                            {getScheduledDate(idea)}
                          </TooltipTrigger>
                          <TooltipContent>
                            {formatDateTime({ seconds: getScheduledTimestamp(idea)! })}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-gray-100"
                            data-testid="post-actions-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(idea.id);
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(idea.id);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || statusFilter 
                ? "No posts match your filters." 
                : "No posts found for this client yet."
              }
            </p>
            {(searchTerm || statusFilter) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
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
