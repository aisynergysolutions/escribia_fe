import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, getDocs, doc as firestoreDoc, setDoc, deleteDoc, Timestamp, getDoc, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, PostListFields } from '@/types/post';
import { v4 as uuidv4 } from 'uuid';

// Keep PostCard for backward compatibility during migration
export type PostCard = {
  title: string;
  profile: string;
  status: string;
  updatedAt: Timestamp;
  scheduledPostAt: Timestamp;
  postId: string;
};

type PostsCacheKey = `${string}_${string}`; // agencyId_clientId

type PostsCache = {
  [key in PostsCacheKey]: Post[];
};

type PostsContextType = {
  posts: Post[];
  loading: boolean;
  error: string | null;
  fetchPosts: (agencyId: string, clientId: string, detailed?: boolean) => Promise<void>;
  createPost: (
    agencyId: string,
    clientId: string,
    postData: {
      profileId: string;
      profileName: string;
      profileRole: string;
      objective: string;
      templateUsedId: string;
      templateUsedName: string;
      initialIdeaPrompt: string;
      status?: string;
      title?: string;
    },
    postId: string
  ) => Promise<void>;
  duplicatePost: (agencyId: string, clientId: string, postId: string) => Promise<string>;
  deletePost: (agencyId: string, clientId: string, postId: string) => Promise<void>;
  updatePostInContext: (
    agencyId: string,
    clientId: string,
    postId: string,
    updates: {
      title?: string;
      currentDraftText?: string;
      generatedHooks?: any[];
      status?: string;
      scheduledPostAt?: Timestamp;
    }
  ) => Promise<void>;
  updatePostInCache: (
    agencyId: string,
    clientId: string,
    postId: string,
    updates: {
      title?: string;
      status?: string;
      scheduledPostAt?: Timestamp;
    }
  ) => void;
};

const PostsContext = createContext<PostsContextType>({
  posts: [],
  loading: false,
  error: null,
  fetchPosts: async () => { },
  createPost: async () => { },
  duplicatePost: async () => { throw new Error('Not implemented'); },
  deletePost: async () => { },
  updatePostInContext: async () => { },
  updatePostInCache: () => { },
});

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }: { children: ReactNode }) => {
  const [postsCache, setPostsCache] = useState<PostsCache>({});
  const [currentKey, setCurrentKey] = useState<PostsCacheKey | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all posts (ideas) for a given agency and client, with caching
  const fetchPosts = async (agencyId: string, clientId: string, detailed: boolean = false) => {
    const key: PostsCacheKey = `${agencyId}_${clientId}`;
    setCurrentKey(key);

    // If already cached, use cache
    if (postsCache[key]) {
      setPosts(postsCache[key]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ideasCol = collection(db, 'agencies', agencyId, 'clients', clientId, 'ideas');
      const snapshot = await getDocs(ideasCol);
      const postsList: Post[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();

        // Create unified Post object (lightweight for list view)
        const post: Post = {
          id: docSnap.id,
          postId: data.postId || docSnap.id,
          title: data.title || 'Untitled Post',
          status: data.status || '',
          updatedAt: data.updatedAt || Timestamp.now(),
          profile: data.profile || data.profileName || '', // Simple string for list view
          profileId: data.profileId || data.subClientId || '',
          scheduledPostAt: data.scheduledPostAt || Timestamp.fromMillis(0),
        };

        // Add detailed fields if requested
        if (detailed) {
          post.createdAt = data.createdAt;
          post.postedAt = data.postedAt;
          post.linkedinPostUrl = data.linkedinPostUrl;
          post.internalNotes = data.internalNotes;
          post.trainAI = data.trainAI;

          // Convert profile to detailed object
          if (data.profileId && data.profileName) {
            post.profile = {
              profileId: data.profileId,
              profileName: data.profileName,
              profileRole: data.profileRole || '',
              imageUrl: data.imageUrl,
            };
          }

          post.initialIdea = data.objective || data.initialIdeaPrompt ? {
            objective: data.objective || '',
            initialIdeaPrompt: data.initialIdeaPrompt || '',
            templateUsedId: data.templateUsedId || '',
            templateUsedName: data.templateUsedName || '',
          } : undefined;

          post.generatedHooks = data.generatedHooks || [];
          post.drafts = data.drafts || [];
          post.images = data.images || [];
          post.video = data.video;
          post.poll = data.poll;
        }

        return post;
      });
      setPostsCache(prev => ({ ...prev, [key]: postsList }));
      setPosts(postsList);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
      setPosts([]);
    }
    setLoading(false);
  };

  // When currentKey or postsCache changes, update posts
  useEffect(() => {
    if (currentKey && postsCache[currentKey]) {
      setPosts(postsCache[currentKey]);
    }
  }, [currentKey, postsCache]);

  // Create a new post (idea) in Firestore and update context
  const createPost = async (
    agencyId: string,
    clientId: string,
    postData: {
      profileId: string;
      profileName: string;
      profileRole: string;
      objective: string;
      templateUsedId: string;
      templateUsedName: string;
      initialIdeaPrompt: string;
      status?: string;
      // Add optional title parameter for AI-generated titles
      title?: string;
    },
    postId: string
  ): Promise<void> => {
    try {
      const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
      const newPostFirestore = {
        profileId: postData.profileId,
        profileName: postData.profileName,
        profileRole: postData.profileRole,
        objective: postData.objective || '',
        templateUsedId: postData.templateUsedId || '',
        templateUsedName: postData.templateUsedName || '',
        initialIdeaPrompt: postData.initialIdeaPrompt,
        // Use provided title or fallback to initialIdeaPrompt
        title: postData.title || postData.initialIdeaPrompt,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: postData.status || 'Drafted',
        // Initialize with empty drafts array and currentDraftText
        drafts: [],
        currentDraftText: '',
        generatedHooks: [],
        internalNotes: '',
        trainAI: false,
      };

      await setDoc(postRef, newPostFirestore);

      // **FIX: Update the context cache immediately**
      const key: PostsCacheKey = `${agencyId}_${clientId}`;
      const newPostContext: Post = {
        id: postId,
        postId: postId,
        title: postData.title || postData.initialIdeaPrompt,
        profile: postData.profileName,
        profileId: postData.profileId,
        status: postData.status || 'Drafted',
        updatedAt: Timestamp.now(),
        scheduledPostAt: Timestamp.fromMillis(0),
      };

      // Update the cache
      setPostsCache(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), newPostContext],
      }));

      // Update the current posts if we're viewing this client
      if (currentKey === key) {
        setPosts(prev => [...prev, newPostContext]);
      }

    } catch (err) {
      console.error('[PostsContext] Error creating post:', err);
      throw new Error('Failed to create post');
    }
  };

  // Add a new function to update post title in context after AI generation
  const updatePostInContext = async (
    agencyId: string,
    clientId: string,
    postId: string,
    updates: {
      title?: string;
      currentDraftText?: string;
      generatedHooks?: any[];
      status?: string;
      scheduledPostAt?: Timestamp;
    }
  ): Promise<void> => {
    try {
      // First, update Firestore with the new data
      const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
      const firestoreUpdates: any = {
        updatedAt: new Date().toISOString()
      };

      if (updates.title) {
        firestoreUpdates.title = updates.title;
      }
      if (updates.currentDraftText) {
        firestoreUpdates.currentDraftText = updates.currentDraftText;
      }
      if (updates.generatedHooks) {
        firestoreUpdates.generatedHooks = updates.generatedHooks;
      }
      if (updates.status) {
        firestoreUpdates.status = updates.status;
      }
      if (updates.scheduledPostAt) {
        firestoreUpdates.scheduledPostAt = updates.scheduledPostAt;
      }

      await setDoc(postRef, firestoreUpdates, { merge: true });

      // Then update the local cache
      const key: PostsCacheKey = `${agencyId}_${clientId}`;

      setPostsCache(prev => {
        if (!prev[key]) return prev;
        return {
          ...prev,
          [key]: prev[key].map(post =>
            post.postId === postId
              ? {
                ...post,
                ...(updates.title && { title: updates.title }),
                ...(updates.status && { status: updates.status }),
                ...(updates.scheduledPostAt && { scheduledPostAt: updates.scheduledPostAt }),
                updatedAt: Timestamp.now()
              }
              : post
          ),
        };
      });

      // Update the current posts if we're viewing this client
      if (currentKey === key) {
        setPosts(prev => prev.map(post =>
          post.postId === postId
            ? {
              ...post,
              ...(updates.title && { title: updates.title }),
              ...(updates.status && { status: updates.status }),
              ...(updates.scheduledPostAt && { scheduledPostAt: updates.scheduledPostAt }),
              updatedAt: Timestamp.now()
            }
            : post
        ));
      }
    } catch (error) {
      console.error('[PostsContext] Error updating post in context:', error);
      throw new Error('Failed to update post');
    }
  };

  // Duplicate an existing post with a new ID
  const duplicatePost = async (agencyId: string, clientId: string, postId: string): Promise<string> => {
    try {
      // First, fetch the complete post data from Firestore
      const originalPostRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
      const originalPostSnap = await getDoc(originalPostRef);

      if (!originalPostSnap.exists()) {
        throw new Error('Original post not found');
      }

      const originalData = originalPostSnap.data();

      // Generate a new unique ID for the duplicated post
      const newPostId = uuidv4();

      // Create a clean copy of the original data, excluding problematic fields
      const {
        linkedinPostUrl,
        postedAt,
        ...cleanOriginalData
      } = originalData;

      // Create the duplicated post data with only the fields we want
      const duplicatedPostData = {
        ...cleanOriginalData,
        postId: newPostId,
        title: `Copy of ${originalData.title || 'Untitled Post'}`,
        status: 'Drafted', // Reset status to drafted
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledPostAt: Timestamp.fromMillis(0), // Reset scheduling
      };

      // Save the duplicated post to Firestore
      const newPostRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', newPostId);
      await setDoc(newPostRef, duplicatedPostData);

      // Update the context cache immediately
      const key: PostsCacheKey = `${agencyId}_${clientId}`;
      const newPostContext: Post = {
        id: newPostId,
        postId: newPostId,
        title: `Copy of ${originalData.title || 'Untitled Post'}`,
        profile: originalData.profileName || originalData.profile || '',
        profileId: originalData.profileId || '',
        status: 'Drafted',
        updatedAt: Timestamp.now(),
        scheduledPostAt: Timestamp.fromMillis(0),
      };

      // Update the cache
      setPostsCache(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), newPostContext],
      }));

      // Update the current posts if we're viewing this client
      if (currentKey === key) {
        setPosts(prev => [...prev, newPostContext]);
      }

      console.log('[PostsContext] Post duplicated successfully:', newPostId);
      return newPostId;

    } catch (err) {
      console.error('[PostsContext] Error duplicating post:', err);
      throw new Error('Failed to duplicate post');
    }
  };

  const deletePost = async (agencyId: string, clientId: string, postId: string): Promise<void> => {
    try {
      const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
      await deleteDoc(postRef);

      // Update the context cache
      const key: PostsCacheKey = `${agencyId}_${clientId}`;
      setPostsCache(prev => {
        if (!prev[key]) return prev;
        return {
          ...prev,
          [key]: prev[key].filter(post => post.postId !== postId),
        };
      });
      setPosts(prev => prev.filter(post => post.postId !== postId));
    } catch (err) {
      console.error('[PostsContext] Error deleting post:', err);
      throw new Error('Failed to delete post');
    }
  };

  // Cache-only update function (doesn't touch Firestore)
  const updatePostInCache = (
    agencyId: string,
    clientId: string,
    postId: string,
    updates: {
      title?: string;
      status?: string;
      scheduledPostAt?: Timestamp;
    }
  ): void => {
    const key: PostsCacheKey = `${agencyId}_${clientId}`;

    setPostsCache(prev => {
      if (!prev[key]) return prev;
      return {
        ...prev,
        [key]: prev[key].map(post =>
          post.postId === postId
            ? {
              ...post,
              ...(updates.title && { title: updates.title }),
              ...(updates.status && { status: updates.status }),
              ...(updates.scheduledPostAt && { scheduledPostAt: updates.scheduledPostAt }),
              updatedAt: Timestamp.now()
            }
            : post
        ),
      };
    });

    // Update the current posts if we're viewing this client
    if (currentKey === key) {
      setPosts(prev => prev.map(post =>
        post.postId === postId
          ? {
            ...post,
            ...(updates.title && { title: updates.title }),
            ...(updates.status && { status: updates.status }),
            ...(updates.scheduledPostAt && { scheduledPostAt: updates.scheduledPostAt }),
            updatedAt: Timestamp.now()
          }
          : post
      ));
    }
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        error,
        fetchPosts,
        createPost,
        duplicatePost,
        deletePost,
        updatePostInContext,
        updatePostInCache,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

