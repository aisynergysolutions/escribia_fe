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
    generatePostHooks: (clientId: string, postId: string, subClientId: string) => Promise<Hook[]>;
    applyHook: (clientId: string, postId: string, subClientId: string, postContent: string, hookText: string) => Promise<string | null>;
    editPostWithInstructions: (clientId: string, postId: string, subClientId: string, postContent: string, instructions: string) => Promise<string | null>;
    editPostPartial: (clientId: string, postId: string, subClientId: string, selectedText: string, postContent: string, action: string, customPrompt?: string) => Promise<string | null>;
};

const PostDetailsContext = createContext<PostDetailsContextType>({
    post: null,
    loading: false,
    error: null,
    fetchPost: async () => { },
    clearPost: () => { },
    saveNewDraft: async () => { },
    generatePostHooks: async () => [],
    applyHook: async () => null,
    editPostWithInstructions: async () => null,
    editPostPartial: async () => null,
});

export const usePostDetails = () => useContext(PostDetailsContext);

// --- Provider ---
export const PostDetailsProvider = ({ children }: { children: ReactNode }) => {
    const [post, setPost] = useState<PostDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate hooks function - moved from api.ts
    const generateHooks = async (
        agencyId: string,
        clientId: string,
        ideaId: string,
        subClientId: string,
        save: boolean = true
    ): Promise<Hook[]> => {
        try {
            const response = await fetch('https://web-production-2fc1.up.railway.app/api/v1/posts/generate-hooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agency_id: agencyId,
                    client_id: clientId,
                    idea_id: ideaId,
                    subclient_id: subClientId,
                    save
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.hooks) {
                return data.hooks;
            } else {
                console.error('API returned error:', data.error);
                return [];
            }
        } catch (error) {
            console.error('Error generating hooks:', error);
            return [];
        }
    };

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
                // currentDraftText: newText // Also update currentDraftText for compatibility
            });

            // Update context post if it's the same post
            setPost(prev =>
                prev && prev.id === postId
                    ? {
                        ...prev,
                        drafts: updatedDrafts,
                        // currentDraftText: newText
                    }
                    : prev
            );

            console.log('New draft saved successfully', { version: nextVersion, text: newText.substring(0, 50) + '...' });
        } catch (error) {
            console.error('Error saving new draft:', error);
            throw new Error('Failed to save new draft');
        }
    };

    const generatePostHooks = useCallback(async (clientId: string, postId: string, subClientId: string): Promise<Hook[]> => {
        try {
            const hooks = await generateHooks('agency1', clientId, postId, subClientId);

            // Update the post state with the new hooks if this is the current post
            if (post && post.id === postId) {
                setPost(prev => prev ? { ...prev, generatedHooks: hooks } : null);
            }

            return hooks;
        } catch (error) {
            console.error('Error generating hooks for post:', error);
            return [];
        }
    }, [post]);

    // Apply hook function
    const applyHook = async (
        agencyId: string,
        clientId: string,
        ideaId: string,
        subClientId: string,
        postContent: string,
        hookText: string
    ): Promise<string | null> => {
        try {
            const response = await fetch('https://web-production-2fc1.up.railway.app/api/v1/posts/apply-hook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agency_id: agencyId,
                    client_id: clientId,
                    subclient_id: subClientId,
                    idea_id: ideaId,
                    post_content: postContent,
                    hook_text: hookText
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.new_post_content) {
                return data.new_post_content;
            } else {
                console.error('API returned error:', data.error);
                return null;
            }
        } catch (error) {
            console.error('Error applying hook:', error);
            return null;
        }
    };

    const applyHookToPost = useCallback(async (
        clientId: string,
        postId: string,
        subClientId: string,
        postContent: string,
        hookText: string
    ): Promise<string | null> => {
        try {
            return await applyHook('agency1', clientId, postId, subClientId, postContent, hookText);
        } catch (error) {
            console.error('Error applying hook to post:', error);
            return null;
        }
    }, []);

    // Edit post with instructions function
    const editPostWithInstructions = async (
        agencyId: string,
        clientId: string,
        ideaId: string,
        subClientId: string,
        postContent: string,
        instructions: string
    ): Promise<string | null> => {
        try {
            const response = await fetch('https://web-production-2fc1.up.railway.app/api/v1/posts/edit/full', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agency_id: agencyId,
                    client_id: clientId,
                    subclient_id: subClientId,
                    idea_id: ideaId,
                    post_content: postContent,
                    action: 'custom_prompt',
                    custom_prompt: instructions
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.edited_content) {
                return data.edited_content;
            } else {
                console.error('API returned error:', data.error);
                return null;
            }
        } catch (error) {
            console.error('Error editing post with instructions:', error);
            return null;
        }
    };

    const editPostWithInstructionsWrapper = useCallback(async (
        clientId: string,
        postId: string,
        subClientId: string,
        postContent: string,
        instructions: string
    ): Promise<string | null> => {
        try {
            return await editPostWithInstructions('agency1', clientId, postId, subClientId, postContent, instructions);
        } catch (error) {
            console.error('Error editing post with instructions:', error);
            return null;
        }
    }, []);

    // Partial edit function for selected text
    const editPostPartial = async (
        agencyId: string,
        clientId: string,
        ideaId: string,
        subClientId: string,
        selectedText: string,
        postContent: string,
        action: string,
        customPrompt?: string
    ): Promise<string | null> => {
        try {
            const requestBody: any = {
                agency_id: agencyId,
                client_id: clientId,
                subclient_id: subClientId,
                idea_id: ideaId,
                selected_text: selectedText,
                post_content: postContent,
                action
            };

            // Add custom prompt if action is custom_prompt
            if (action === 'custom_prompt' && customPrompt) {
                requestBody.custom_prompt = customPrompt;
            }

            const response = await fetch('https://web-production-2fc1.up.railway.app/api/v1/posts/edit/partial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.full_edited_content) {
                return data.full_edited_content;
            } else {
                console.error('API returned error:', data.error);
                return null;
            }
        } catch (error) {
            console.error('Error editing post partial:', error);
            return null;
        }
    };

    const editPostPartialWrapper = useCallback(async (
        clientId: string,
        postId: string,
        subClientId: string,
        selectedText: string,
        postContent: string,
        action: string,
        customPrompt?: string
    ): Promise<string | null> => {
        try {
            return await editPostPartial('agency1', clientId, postId, subClientId, selectedText, postContent, action, customPrompt);
        } catch (error) {
            console.error('Error editing post partial:', error);
            return null;
        }
    }, []);

    return (
        <PostDetailsContext.Provider value={{
            post,
            loading,
            error,
            fetchPost,
            clearPost,
            saveNewDraft,
            generatePostHooks,
            applyHook: applyHookToPost,
            editPostWithInstructions: editPostWithInstructionsWrapper,
            editPostPartial: editPostPartialWrapper
        }}>
            {children}
        </PostDetailsContext.Provider>
    );
};

