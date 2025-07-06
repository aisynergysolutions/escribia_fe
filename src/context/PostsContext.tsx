import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Firestore Timestamp type
export type Timestamp = {
  nanoseconds: number;
  seconds: number;
};

export type Hook = {
  text: string;
  selected: boolean;
  angle: string;
};

export type Draft = {
  version: number;
  createdAt: Timestamp;
  text: string;
  generatedByAI: boolean;
  notes: string;
};

export type PostDetails = {
  livePostUrl: string;
  internalNotes: string;
  id: string;
  generatedHooks: Hook[];
  status: string;
  clientId: string;
  actuallyPostedAt: Timestamp;
  updatedAt: Timestamp;
  initialIdeaPrompt: string;
  finalApprovedText: string;
  currentDraftText: string;
  scheduledPostAt: Timestamp;
  templateUsedId: string | null;
  title: string;
  createdAt: Timestamp;
  subClientId: string;
  objective: string;
  drafts: Draft[];
  profile: string;
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
  getPostDetails: (agencyId: string, clientId: string, postId: string) => Promise<PostDetails | null>;
  postDetails: PostDetails | null;
  postDetailsLoading: boolean;
  postDetailsError: string | null;
};

const PostsContext = createContext<PostsContextType>({
  posts: [],
  loading: false,
  error: null,
  fetchPosts: async () => {},
  getPostDetails: async () => null,
  postDetails: null,
  postDetailsLoading: false,
  postDetailsError: null,
});

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }: { children: ReactNode }) => {
  const [postsCache, setPostsCache] = useState<PostsCache>({});
  const [currentKey, setCurrentKey] = useState<PostsCacheKey | null>(null);
  const [posts, setPosts] = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [postDetailsLoading, setPostDetailsLoading] = useState(false);
  const [postDetailsError, setPostDetailsError] = useState<string | null>(null);

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
          title: data.title || '',
          profile: data.profile || '',
          status: data.status || '',
          lastUpdated: data.updatedAt || { nanoseconds: 0, seconds: 0 },
          scheduledPostAt: data.scheduledPostAt || { nanoseconds: 0, seconds: 0 },
          postId: data.postId || docSnap.id,
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

  // Fetch details for a single post (idea)
  const getPostDetails = async (
    agencyId: string,
    clientId: string,
    postId: string
  ): Promise<PostDetails | null> => {
    setPostDetailsLoading(true);
    setPostDetailsError(null);
    try {
      const postDocRef = doc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
      const postSnap = await getDoc(postDocRef);
      if (!postSnap.exists()) {
        setPostDetails(null);
        setPostDetailsLoading(false);
        return null;
      }
      const data = postSnap.data();
      const details: PostDetails = {
        livePostUrl: data.livePostUrl || '',
        internalNotes: data.internalNotes || '',
        id: data.postId || postSnap.id,
        generatedHooks: Array.isArray(data.generatedHooks) ? data.generatedHooks : [],
        status: data.status || '',
        clientId: data.clientId || '',
        actuallyPostedAt: data.actuallyPostedAt || { nanoseconds: 0, seconds: 0 },
        updatedAt: data.updatedAt || { nanoseconds: 0, seconds: 0 },
        initialIdeaPrompt: data.initialIdeaPrompt || '',
        finalApprovedText: data.finalApprovedText || '',
        currentDraftText: data.currentDraftText || '',
        scheduledPostAt: data.scheduledPostAt || { nanoseconds: 0, seconds: 0 },
        templateUsedId: data.templateUsedId ?? null,
        title: data.title || '',
        createdAt: data.createdAt || { nanoseconds: 0, seconds: 0 },
        subClientId: data.subClientId || '',
        objective: data.objective || '',
        drafts: Array.isArray(data.drafts) ? data.drafts : [],
        profile: data.profile || '',
      };
      setPostDetails(details);
      setPostDetailsLoading(false);
      return details;
    } catch (err: any) {
      setPostDetailsError(err.message || 'Failed to fetch post details');
      setPostDetails(null);
      setPostDetailsLoading(false);
      return null;
    }
  };

  // No auto-fetch on mount; fetchPosts must be called with agencyId and clientId

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        error,
        fetchPosts,
        getPostDetails,
        postDetails,
        postDetailsLoading,
        postDetailsError,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};