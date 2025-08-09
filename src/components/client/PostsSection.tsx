import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, PlusCircle, MoreHorizontal, Copy, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import StatusBadge from '../common/StatusBadge';
import CreatePostModal from '../CreatePostModal';
import { Post, getProfileName } from '@/types/post';
import { Idea } from '../../types';
import { formatDateTime, formatRelativeTime } from '../../utils/dateUtils';
import { usePosts } from '@/context/PostsContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PostsSectionSkeleton from '../../skeletons/PostsSectionSkeleton';

interface PostsSectionProps {
  clientId: string;
}

type SortField = 'updated' | 'created' | 'title' | 'status' | 'profile' | 'scheduled';
type SortDirection = 'asc' | 'desc' | 'none';

const SORT_STORAGE_KEY = 'posts-sort-preferences';

const getSortFieldLabel = (field: SortField): string => {
  switch (field) {
    case 'updated': return 'LAST UPDATED';
    case 'created': return 'Date Created';
    case 'title': return 'POST';
    case 'status': return 'STATUS';
    case 'profile': return 'PROFILE';
    case 'scheduled': return 'SCHEDULED FOR';
    default: return 'LAST UPDATED';
  }
};

const PostsSection: React.FC<PostsSectionProps> = ({ clientId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Use PostsContext and AuthContext
  const { posts, loading, error, fetchPosts, deletePost } = usePosts();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Get the current agency ID from the authenticated user
  const agencyId = currentUser?.uid;

  // Fetch posts when clientId or agencyId changes
  useEffect(() => {
    if (agencyId && clientId) {
      console.log('[PostsSection] Fetching posts for agency:', agencyId, 'client:', clientId);
      fetchPosts(agencyId, clientId);
    } else {
      console.warn('[PostsSection] No agency ID or client ID available, skipping fetch');
    }
  }, [agencyId, clientId, fetchPosts]);

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

  // Replace mockIdeas with posts from context
  const clientIdeas = posts;

  // Filter and sort posts
  const getFilteredAndSortedPosts = (): typeof posts => {
    let filtered = clientIdeas;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected status
    if (selectedStatus) {
      filtered = filtered.filter(idea => idea.status === selectedStatus);
    }

    // Sort posts
    if (sortDirection !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
          case 'updated':
            comparison = a.updatedAt.seconds - b.updatedAt.seconds;
            break;
          case 'created':
            // If you add createdAt to PostCard, use it here
            comparison = 0;
            break;
          case 'scheduled':
            comparison = a.scheduledPostAt.seconds - b.scheduledPostAt.seconds;
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          case 'profile':
            comparison = getProfileName(a).localeCompare(getProfileName(b));
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
    return ['Drafted', 'Needs Visual', 'Waiting Approval', 'Approved', 'Scheduled', 'Posted'];
  };

  const filteredPosts = getFilteredAndSortedPosts();
  const allowedStatuses = getAllowedStatuses();

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

  const handleDelete = async (postId: string) => {
    if (!agencyId) {
      console.error('[PostsSection] No agency ID available for deleting post');
      alert('No agency ID available. Please ensure you are signed in.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        console.log('[PostsSection] Deleting post for agency:', agencyId, 'client:', clientId, 'post:', postId);
        await deletePost(agencyId, clientId, postId);
        console.log('Post deleted:', postId);
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete the post. Please try again.');
      }
    }
  };

  const getScheduledDate = (idea: Idea) => {
    if (idea.status === 'Scheduled' || idea.status === 'Posted') {
      return formatRelativeTime(idea.createdAt);
    }
    return '—';
  };

  const handleStatusSelect = (status: string) => {
    if (selectedStatus === status) {
      // Deselect if clicking the same status
      setSelectedStatus(null);
    } else {
      // Select the new status
      setSelectedStatus(status);
    }
  };

  // Show error if no agency ID is available
  if (!agencyId) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 font-semibold mb-2">Authentication Required</h3>
          <p className="text-red-600">
            No agency ID available. Please ensure you are signed in to view posts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <PostsSectionSkeleton rowCount={5} />
      ) : (
        <>
          {/* Unified Control Bar */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-6">
              {/* Left Side: Status Filter Tabs - Now Scrollable */}
              <div className="flex-1 relative">
                <div className="overflow-x-auto scrollbar-hide status-tabs-container">
                  <div className="flex w-max min-w-full">
                    {allowedStatuses.map(status => {
                      const count = clientIdeas.filter(idea => idea.status === status).length;
                      const displayStatus = status === 'Waiting for Approval' ? 'Waiting Approval' : status;
                      const isSelected = selectedStatus === status;

                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusSelect(status)}
                          className={`
                            flex-1 relative group px-4 py-2 mx-1 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap
                            ${isSelected
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          <span>
                            {displayStatus} ({count})
                          </span>
                          {isSelected && (
                            <X className="absolute top-1 right-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Gradient fade for overflow indication */}
                <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none opacity-0 status-gradient"></div>
              </div>

              {/* Right Side: Search & Primary Action - Fixed */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {/* Search Input - Made narrower */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 w-48 focus:border-indigo-600 focus:ring-indigo-600"
                  />
                </div>

                {/* New Post Button - Icon Only */}
                <CreatePostModal>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 h-10 w-10 p-0">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </CreatePostModal>
              </div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-white rounded-xl shadow-sm border">
            {error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredPosts.length > 0 ? (
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
                    {filteredPosts.map(post => (
                      <TableRow
                        key={post.postId}
                        className="cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                        onClick={() => navigate(`/clients/${clientId}/posts/${post.postId}`)}
                      >
                        <TableCell className="py-4">
                          <div className="font-semibold text-gray-900 max-w-xs truncate" title={post.title}>
                            {post.title.length > 80 ? post.title.slice(0, 80) + '…' : post.title}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-gray-600">
                          {getProfileName(post)}
                        </TableCell>
                        <TableCell className="py-4">
                          <StatusBadge status={post.status} type="idea" />
                        </TableCell>
                        <TableCell className="py-4 text-gray-600">
                          <Tooltip>
                            <TooltipTrigger>
                              {formatRelativeTime(post.updatedAt)}
                            </TooltipTrigger>
                            <TooltipContent>
                              {formatDateTime(post.updatedAt)}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="py-4 text-gray-600">
                          {post.scheduledPostAt.seconds > 0
                            ? formatRelativeTime(post.scheduledPostAt)
                            : '—'}
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
                                handleDuplicate(post.postId);
                              }}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(post.postId);
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
                  {searchTerm || selectedStatus
                    ? "No posts match your filters."
                    : "No posts found for this client yet."
                  }
                </p>
                {!(searchTerm || selectedStatus) && (
                  <CreatePostModal>
                    <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                      Create Post
                    </Button>
                  </CreatePostModal>
                )}
                {(searchTerm || selectedStatus) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus(null);
                    }}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PostsSection;
