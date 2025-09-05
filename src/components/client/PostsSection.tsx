import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, PlusCircle, MoreHorizontal, Copy, Trash2, X, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import StatusBadge from '../common/StatusBadge';
import CreatePostModal from '../CreatePostModal';
import { Post, getProfileName } from '@/types/post';
import { usePosts } from '@/context/PostsContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime, formatDateTime } from '@/utils/dateUtils';
import PostsSectionSkeleton from '@/skeletons/PostsSectionSkeleton';
import { useToast } from '@/hooks/use-toast';

interface PostsSectionProps {
  clientId: string;
}

type SortField = 'updated' | 'created' | 'title' | 'status' | 'profile' | 'scheduled' | 'posted';
type SortDirection = 'asc' | 'desc' | 'none';

const SORT_STORAGE_KEY = 'posts-sort-preferences';

const getSortFieldLabel = (field: SortField): string => {
  switch (field) {
    case 'updated': return 'LAST UPDATED';
    case 'created': return 'CREATED';
    case 'title': return 'POST';
    case 'status': return 'STATUS';
    case 'profile': return 'PROFILE';
    case 'scheduled': return 'SCHEDULED FOR';
    case 'posted': return 'PUBLISHED AT';
    default: return 'LAST UPDATED';
  }
};

const PostsSection: React.FC<PostsSectionProps> = ({ clientId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Use PostsContext and AuthContext
  const { posts, loading, error, fetchPosts, deletePost, duplicatePost } = usePosts();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    } else {
      // When no status filter is active, exclude Posted posts
      filtered = filtered.filter(idea => idea.status !== 'Posted');
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
            const aCreated = a.createdAt && a.createdAt.seconds > 0 ? a.createdAt.seconds : 0;
            const bCreated = b.createdAt && b.createdAt.seconds > 0 ? b.createdAt.seconds : 0;
            comparison = aCreated - bCreated;
            break;
          case 'scheduled':
            comparison = (a.scheduledPostAt?.seconds || 0) - (b.scheduledPostAt?.seconds || 0);
            break;
          case 'posted':
            comparison = (a.postedAt?.seconds || 0) - (b.postedAt?.seconds || 0);
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

  // Determine which columns to show based on active status filter
  const getVisibleColumns = () => {
    if (selectedStatus === 'Scheduled') {
      return {
        showProfile: true,
        showStatus: false,
        showUpdated: false,
        showCreated: false,
        showScheduled: true,
        showPosted: false
      };
    }

    if (selectedStatus === 'Posted') {
      return {
        showProfile: true,
        showStatus: false,
        showUpdated: false,
        showCreated: false,
        showScheduled: false,
        showPosted: true
      };
    }

    // Default for All/Drafted/Needs Visual/Approval/Approved
    return {
      showProfile: true,
      showStatus: true,
      showUpdated: true,
      showCreated: true,
      showScheduled: false,
      showPosted: false
    };
  };

  const visibleColumns = getVisibleColumns();

  // Check if there are any posted posts (for queue message)
  const hasPostedPosts = clientIdeas.some(post => post.status === 'Posted');

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through sort directions: asc -> desc -> none
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection('none');
        // Don't reset the field when setting to 'none' - keep the same column
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      // Set default direction based on status and field
      const defaultDirection = getDefaultSortDirection(field);
      setSortDirection(defaultDirection);
    }
  };

  // Get default sort field based on active status filter
  const getDefaultSortField = (): SortField => {
    if (selectedStatus === 'Scheduled') return 'scheduled';
    if (selectedStatus === 'Posted') return 'posted';
    return 'updated';
  };

  // Get default sort direction based on field and status
  const getDefaultSortDirection = (field: SortField): SortDirection => {
    if (selectedStatus === 'Scheduled' && field === 'scheduled') {
      return 'asc'; // Soonest first for scheduled posts
    }
    if (selectedStatus === 'Posted' && field === 'posted') {
      return 'desc'; // Newest first for posted posts
    }
    // For date columns, start with desc (newest first), except scheduled when in Scheduled tab
    if (field === 'updated' || field === 'created' || field === 'posted') {
      return 'desc';
    }
    if (field === 'scheduled') {
      return selectedStatus === 'Scheduled' ? 'asc' : 'desc';
    }
    // For text columns, start with asc (A-Z)
    return 'asc';
  };

  // Update sort field and direction when status filter changes
  useEffect(() => {
    const defaultField = getDefaultSortField();
    const defaultDirection = getDefaultSortDirection(defaultField);
    setSortField(defaultField);
    setSortDirection(defaultDirection);
  }, [selectedStatus]);

  const getSortIcon = (field: SortField) => {
    if (sortField === field && sortDirection !== 'none') {
      return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    }
    return null;
  };

  const handleDuplicate = async (postId: string) => {
    if (!agencyId) {
      console.error('[PostsSection] No agency ID available for duplicating post');
      toast({
        title: "Authentication Error",
        description: "No agency ID available. Please ensure you are signed in.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('[PostsSection] Duplicating post for agency:', agencyId, 'client:', clientId, 'post:', postId);
      const newPostId = await duplicatePost(agencyId, clientId, postId);
      console.log('Post duplicated successfully. New post ID:', newPostId);

      toast({
        title: "Post Duplicated",
        description: "The post has been successfully duplicated and added to your posts list.",
      });

    } catch (error) {
      console.error('Error duplicating post:', error);
      toast({
        title: "Duplication Failed",
        description: "Failed to duplicate the post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!agencyId) {
      console.error('[PostsSection] No agency ID available for deleting post');
      toast({
        title: "Authentication Error",
        description: "No agency ID available. Please ensure you are signed in.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        console.log('[PostsSection] Deleting post for agency:', agencyId, 'client:', clientId, 'post:', postId);
        await deletePost(agencyId, clientId, postId);
        console.log('Post deleted:', postId);
        toast({
          title: "Post Deleted",
          description: "The post has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting post:', error);
        toast({
          title: "Deletion Failed",
          description: "Failed to delete the post. Please try again.",
          variant: "destructive"
        });
      }
    }
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
                    <PencilLine className="h-6 w-6" />
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
                      {/* Row Number Header */}
                      <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide w-16 text-center">
                        {/* # */}
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                        <button
                          onClick={() => handleColumnSort('title')}
                          className="flex items-center gap-2 hover:bg-gray-100 p-2 -m-2 rounded cursor-pointer transition-colors"
                        >
                          POST
                          {getSortIcon('title')}
                        </button>
                      </TableHead>
                      {visibleColumns.showProfile && (
                        <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                          <button
                            onClick={() => handleColumnSort('profile')}
                            className="flex items-center gap-2 hover:bg-gray-100 p-2 -m-2 rounded cursor-pointer transition-colors"
                          >
                            PROFILE
                            {getSortIcon('profile')}
                          </button>
                        </TableHead>
                      )}
                      {visibleColumns.showStatus && (
                        <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                          <button
                            onClick={() => handleColumnSort('status')}
                            className="flex items-center gap-2 hover:bg-gray-100 p-2 -m-2 rounded cursor-pointer transition-colors"
                          >
                            STATUS
                            {getSortIcon('status')}
                          </button>
                        </TableHead>
                      )}
                      {visibleColumns.showUpdated && (
                        <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                          <button
                            onClick={() => handleColumnSort('updated')}
                            className="flex items-center gap-2 hover:bg-gray-100 p-2 -m-2 rounded cursor-pointer transition-colors"
                          >
                            LAST UPDATED
                            {getSortIcon('updated')}
                          </button>
                        </TableHead>
                      )}
                      {visibleColumns.showCreated && (
                        <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                          <button
                            onClick={() => handleColumnSort('created')}
                            className="flex items-center gap-2 hover:bg-gray-100 p-2 -m-2 rounded cursor-pointer transition-colors"
                          >
                            CREATED
                            {getSortIcon('created')}
                          </button>
                        </TableHead>
                      )}
                      {visibleColumns.showScheduled && (
                        <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                          <button
                            onClick={() => handleColumnSort('scheduled')}
                            className="flex items-center gap-2 hover:bg-gray-100 p-2 -m-2 rounded cursor-pointer transition-colors"
                          >
                            SCHEDULED FOR
                            {getSortIcon('scheduled')}
                          </button>
                        </TableHead>
                      )}
                      {visibleColumns.showPosted && (
                        <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                          <button
                            onClick={() => handleColumnSort('posted')}
                            className="flex items-center gap-2 hover:bg-gray-100 p-2 -m-2 rounded cursor-pointer transition-colors"
                          >
                            PUBLISHED AT
                            {getSortIcon('posted')}
                          </button>
                        </TableHead>
                      )}
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post, index) => (
                      <TableRow
                        key={post.postId}
                        className="cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                        onClick={() => navigate(`/clients/${clientId}/posts/${post.postId}`)}
                      >
                        {/* Row Number Cell */}
                        <TableCell className="py-4 text-center text-gray-500 font-mono text-sm w-16">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="font-semibold text-gray-900 max-w-xs truncate" title={post.title}>
                            {post.title.length > 80 ? post.title.slice(0, 80) + '…' : post.title}
                          </div>
                        </TableCell>
                        {visibleColumns.showProfile && (
                          <TableCell className="py-4 text-gray-600">
                            {getProfileName(post)}
                          </TableCell>
                        )}
                        {visibleColumns.showStatus && (
                          <TableCell className="py-4">
                            <StatusBadge status={post.status} type="idea" />
                          </TableCell>
                        )}
                        {visibleColumns.showUpdated && (
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
                        )}
                        {visibleColumns.showCreated && (
                          <TableCell className="py-4 text-gray-600">
                            <Tooltip>
                              <TooltipTrigger>
                                {post.createdAt && post.createdAt.seconds > 0
                                  ? formatRelativeTime(post.createdAt)
                                  : '—'}
                              </TooltipTrigger>
                              <TooltipContent>
                                {post.createdAt && post.createdAt.seconds > 0
                                  ? formatDateTime(post.createdAt)
                                  : 'Not available'}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        )}
                        {visibleColumns.showScheduled && (
                          <TableCell className="py-4 text-gray-600">
                            <Tooltip>
                              <TooltipTrigger>
                                {(() => {
                                  // Debug logging for scheduled posts
                                  if (process.env.NODE_ENV === 'development' && post.scheduledPostAt && post.scheduledPostAt.seconds > 0) {
                                    console.log('PostsSection scheduledPostAt debug:', {
                                      postId: post.postId,
                                      title: post.title,
                                      scheduledPostAt: post.scheduledPostAt,
                                      seconds: post.scheduledPostAt.seconds,
                                      date: new Date(post.scheduledPostAt.seconds * 1000).toISOString()
                                    });
                                  }

                                  return post.scheduledPostAt && post.scheduledPostAt.seconds > 0
                                    ? formatRelativeTime(post.scheduledPostAt)
                                    : '—';
                                })()}
                              </TooltipTrigger>
                              <TooltipContent>
                                {post.scheduledPostAt && post.scheduledPostAt.seconds > 0
                                  ? formatDateTime(post.scheduledPostAt)
                                  : 'Not scheduled'}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        )}
                        {visibleColumns.showPosted && (
                          <TableCell className="py-4 text-gray-600">
                            <Tooltip>
                              <TooltipTrigger>
                                {post.postedAt && post.postedAt.seconds > 0
                                  ? formatRelativeTime(post.postedAt)
                                  : '—'}
                              </TooltipTrigger>
                              <TooltipContent>
                                {post.postedAt && post.postedAt.seconds > 0
                                  ? formatDateTime(post.postedAt)
                                  : 'Not published'}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        )}
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
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicate(post.postId);
                                }}
                              >
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

            {/* Queue message for non-posted tabs when there are posted posts */}
            {!selectedStatus && hasPostedPosts && (
              <div className="border-t bg-blue-50 p-4 text-center">
                <p className="text-sm text-blue-700">
                  Published posts don't appear here. View them in the <strong>Posted</strong> tab.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PostsSection;
