import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { doc as firestoreDoc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


// --- Types ---
export type Draft = {
    text: string;
    createdAt: Timestamp; // Firestore Timestamp
    version: number;
    generatedByAI: boolean;
    notes: string;
};

export type Hook = {
    text: string;
    selected: boolean;
    angle: string;
};

export type InitialIdea = {
    objective: string;
    initialIdeaPrompt: string;
    templateUsedId: string;
    templateUsedName: string;
};

export type Profile = {
    profileId: string;
    profileName: string;
    profileRole: string;
};

export type PostDetails = {
    id: string;
    title: string;
    status: string;
    internalNotes: string;
    trainAI: boolean;
    updatedAt: Timestamp;
    lastUpdated: Timestamp;
    createdAt: Timestamp;
    initialIdea: InitialIdea;
    profile: Profile;
    generatedHooks: Hook[];
    drafts: Draft[];
};

type PostDetailsContextType = {
    post: PostDetails | null;
    loading: boolean;
    error: string | null;
    fetchPost: (clientId: string, postId: string) => Promise<void>;
    clearPost: () => void;
    saveNewDraft: (agencyId: string, clientId: string, postId: string, newText: string, notes?: string, generatedByAI?: boolean) => Promise<void>;
};

const PostDetailsContext = createContext<PostDetailsContextType>({
    post: null,
    loading: false,
    error: null,
    fetchPost: async () => { },
    clearPost: () => { },
    saveNewDraft: async () => { },


});

export const usePostDetails = () => useContext(PostDetailsContext);

// --- Provider ---
export const PostDetailsProvider = ({ children }: { children: ReactNode }) => {
    const [post, setPost] = useState<PostDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPost = useCallback(async (clientId: string, postId: string) => {
        setLoading(true);
        setError(null);
        try {
            console.log('[PostDetailsContext] Fetching post:', clientId, postId);
            const ref = firestoreDoc(db, 'agencies', 'agency1', 'clients', clientId, 'ideas', postId);
            const snap = await getDoc(ref);
            if (!snap.exists()) throw new Error('Post not found');
            const data = snap.data();

            // Map Firestore data to our types
            const postDetails: PostDetails = {
                id: snap.id,
                title: data.title,
                status: data.status,
                internalNotes: data.internalNotes,
                trainAI: data.trainAI,
                updatedAt: data.updatedAt,
                lastUpdated: data.lastUpdated,
                createdAt: data.createdAt,
                initialIdea: {
                    objective: data.objective,
                    initialIdeaPrompt: data.initialIdeaPrompt,
                    templateUsedId: data.templateUsedId,
                    templateUsedName: data.templateUsedName,
                },
                profile: {
                    profileId: data.profileId,
                    profileName: data.profileName,
                    profileRole: data.profileRole,
                },
                generatedHooks: (data.generatedHooks || []) as Hook[],
                drafts: (data.drafts || []) as Draft[],
            };
            setPost(postDetails);
        } catch (e: any) {
            setError(e.message || 'Unknown error');
            console.error('[PostDetailsContext] Error fetching post:', e);
            setPost(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Add this function to the context
    const clearPost = useCallback(() => {
        setPost(null);
        setError(null);
    }, []);
    const saveNewDraft = async (
        agencyId: string,
        clientId: string,
        postId: string,
        newText: string,
        notes: string = '',
        generatedByAI: boolean = false
    ) => {
        try {
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

            // Get current drafts to determine the next version number
            const currentDrafts = post?.drafts || [];
            const nextVersion = currentDrafts.length > 0
                ? Math.max(...currentDrafts.map(d => d.version)) + 1
                : 1;

            // Create new draft object
            const newDraft: Draft = {
                version: nextVersion,
                createdAt: Timestamp.now(),
                text: newText,
                generatedByAI,
                notes
            };

            // Update Firestore with the new draft appended to the drafts array
            const updatedDrafts = [...currentDrafts, newDraft];
            await updateDoc(postRef, {
                drafts: updatedDrafts,
                currentDraftText: newText // Also update currentDraftText for compatibility
            });

            // Update context post if it's the same post
            setPost(prev =>
                prev && prev.id === postId
                    ? {
                        ...prev,
                        drafts: updatedDrafts,
                        currentDraftText: newText
                    }
                    : prev
            );

            console.log('New draft saved successfully', { version: nextVersion, text: newText.substring(0, 50) + '...' });
        } catch (error) {
            console.error('Error saving new draft:', error);
            throw new Error('Failed to save new draft');
        }
    };


    // Update the provider
    return (
        <PostDetailsContext.Provider value={{ post, loading, error, fetchPost, clearPost, saveNewDraft }}>
            {children}
        </PostDetailsContext.Provider>
    );
};

