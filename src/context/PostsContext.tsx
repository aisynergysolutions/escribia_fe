import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, getDocs, doc as firestoreDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Firestore Timestamp type
export type Timestamp = {
  nanoseconds: number;
  seconds: number;
};

export type PostCard = {
  title: string;
  profile: string;
  status: string;
  lastUpdated: Timestamp;
  scheduledPostAt: Timestamp;
  postId: string;
};

type PostsCacheKey = `${string}_${string}`; // agencyId_clientId

type PostsCache = {
  [key in PostsCacheKey]: PostCard[];
};

type PostsContextType = {
  posts: PostCard[];
  loading: boolean;
  error: string | null;
  fetchPosts: (agencyId: string, clientId: string) => Promise<void>;
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
  deletePost: (agencyId: string, clientId: string, postId: string) => Promise<void>;
  updatePostInContext: (
    agencyId: string,
    clientId: string,
    postId: string,
    updates: {
      title?: string;
      currentDraftText?: string;
      generatedHooks?: any[];
    }
  ) => Promise<void>;
};

const PostsContext = createContext<PostsContextType>({
  posts: [],
  loading: false,
  error: null,
  fetchPosts: async () => { },
  createPost: async () => { },
  deletePost: async () => { },
  updatePostInContext: async () => { },
});

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }: { children: ReactNode }) => {
  const [postsCache, setPostsCache] = useState<PostsCache>({});
  const [currentKey, setCurrentKey] = useState<PostsCacheKey | null>(null);
  const [posts, setPosts] = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all posts (ideas) for a given agency and client, with caching
  const fetchPosts = async (agencyId: string, clientId: string) => {
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
      const postsList: PostCard[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          title: data.title || 'Untitled Post',
          profile: data.profile || data.profileName || '',
          status: data.status || '',
          lastUpdated: data.updatedAt || { nanoseconds: 0, seconds: 0 },
          scheduledPostAt: data.scheduledPostAt || { nanoseconds: 0, seconds: 0 },
          postId: data.postId || docSnap.id,
          profileId: data.profileId || data.subClientId || '',
        };
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
      const newPost = {
        profileId: postData.profileId,
        profileName: postData.profileName,
        profileRole: postData.profileRole,
        objective: postData.objective || '',
        templateUsedId: postData.templateUsedId || '',
        templateUsedName: postData.templateUsedName || '',
        initialIdeaPrompt: postData.initialIdeaPrompt,
        // Use provided title or fallback to initialIdeaPrompt
        title: postData.title || postData.initialIdeaPrompt,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: postData.status || 'Drafted',
        // Initialize with empty drafts array and currentDraftText
        drafts: [],
        currentDraftText: '',
        generatedHooks: [],
        internalNotes: '',
        trainAI: false,
      };

      await setDoc(postRef, newPost);

      // **FIX: Update the context cache immediately**
      const key: PostsCacheKey = `${agencyId}_${clientId}`;
      const newPostCard: PostCard = {
        // Use the provided title or fallback to initialIdeaPrompt
        title: postData.title || postData.initialIdeaPrompt,
        profile: postData.profileName,
        status: postData.status || 'Drafted',
        lastUpdated: { nanoseconds: 0, seconds: Math.floor(Date.now() / 1000) },
        scheduledPostAt: { nanoseconds: 0, seconds: 0 },
        postId: postId, // Use the explicit postId
      };

      // Update the cache
      setPostsCache(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), newPostCard],
      }));

      // Update the current posts if we're viewing this client
      if (currentKey === key) {
        setPosts(prev => [...prev, newPostCard]);
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
    }
  ): Promise<void> => {
    const key: PostsCacheKey = `${agencyId}_${clientId}`;
    
    // Update the cache
    setPostsCache(prev => {
      if (!prev[key]) return prev;
      return {
        ...prev,
        [key]: prev[key].map(post => 
          post.postId === postId 
            ? { 
                ...post, 
                ...(updates.title && { title: updates.title }),
                lastUpdated: { nanoseconds: 0, seconds: Math.floor(Date.now() / 1000) }
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
              lastUpdated: { nanoseconds: 0, seconds: Math.floor(Date.now() / 1000) }
            }
          : post
      ));
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

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        error,
        fetchPosts,
        createPost,
        deletePost,
        updatePostInContext, // Add this to the context
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

