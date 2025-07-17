import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { doc as firestoreDoc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

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
    createdAt: Timestamp;
    scheduledPostAt?: Timestamp;
    postedAt?: Timestamp;
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
    updatePostTitle: (agencyId: string, clientId: string, postId: string, newTitle: string) => Promise<void>;
    updatePostStatus: (agencyId: string, clientId: string, postId: string, newStatus: string) => Promise<void>;
    updateInternalNotes: (agencyId: string, clientId: string, postId: string, newNotes: string) => Promise<void>;
    updateTrainAI: (agencyId: string, clientId: string, postId: string, trainAI: boolean) => Promise<void>;
    updateInitialIdea: (agencyId: string, clientId: string, postId: string, initialIdeaPrompt: string, objective: string) => Promise<void>;
    regeneratePostFromIdea: (agencyId: string, clientId: string, postId: string, subClientId: string, initialIdeaPrompt: string, objective: string) => Promise<string | null>;
    updatePostScheduling: (agencyId: string, clientId: string, postId: string, newStatus: string, scheduledPostAt: Timestamp) => Promise<void>;
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
    updatePostTitle: async () => { },
    updatePostStatus: async () => { },
    updateInternalNotes: async () => { },
    updateTrainAI: async () => { },
    updateInitialIdea: async () => { },
    regeneratePostFromIdea: async () => null,
    updatePostScheduling: async () => { },
});

export const usePostDetails = () => useContext(PostDetailsContext);

// --- Provider ---
export const PostDetailsProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const [post, setPost] = useState<PostDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get the current agency ID from the authenticated user
    const agencyId = currentUser?.uid;

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
        if (!agencyId) {
            console.warn('[PostDetailsContext] No agency ID available, skipping fetch');
            setError('No agency ID available. Please ensure you are signed in.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log('[PostDetailsContext] Fetching post for agency:', agencyId, 'client:', clientId, 'post:', postId);
            const ref = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
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
                createdAt: data.createdAt,
                scheduledPostAt: data.scheduledPostAt,
                postedAt: data.postedAt,
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
    }, [agencyId]);

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
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for saving draft');
            throw new Error('No agency ID available');
        }

        try {
            console.log('[PostDetailsContext] Saving new draft for agency:', agencyId, 'client:', clientId, 'post:', postId);
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
                updatedAt: Timestamp.now()
            });

            // Update context post if it's the same post
            setPost(prev =>
                prev && prev.id === postId
                    ? {
                        ...prev,
                        drafts: updatedDrafts,
                        updatedAt: Timestamp.now()
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
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for generating hooks');
            return [];
        }

        try {
            console.log('[PostDetailsContext] Generating hooks for agency:', agencyId, 'client:', clientId, 'post:', postId);
            const hooks = await generateHooks(agencyId, clientId, postId, subClientId);

            // Update the post state with the new hooks if this is the current post
            if (post && post.id === postId) {
                setPost(prev => prev ? { ...prev, generatedHooks: hooks } : null);
            }

            return hooks;
        } catch (error) {
            console.error('Error generating hooks for post:', error);
            return [];
        }
    }, [post, agencyId]);

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
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for applying hook');
            return null;
        }

        try {
            console.log('[PostDetailsContext] Applying hook for agency:', agencyId, 'client:', clientId, 'post:', postId);
            return await applyHook(agencyId, clientId, postId, subClientId, postContent, hookText);
        } catch (error) {
            console.error('Error applying hook to post:', error);
            return null;
        }
    }, [agencyId]);

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
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for editing post');
            return null;
        }

        try {
            console.log('[PostDetailsContext] Editing post with instructions for agency:', agencyId, 'client:', clientId, 'post:', postId);
            return await editPostWithInstructions(agencyId, clientId, postId, subClientId, postContent, instructions);
        } catch (error) {
            console.error('Error editing post with instructions:', error);
            return null;
        }
    }, [agencyId]);

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
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for editing post partial');
            return null;
        }

        try {
            console.log('[PostDetailsContext] Editing post partial for agency:', agencyId, 'client:', clientId, 'post:', postId);
            return await editPostPartial(agencyId, clientId, postId, subClientId, selectedText, postContent, action, customPrompt);
        } catch (error) {
            console.error('Error editing post partial:', error);
            return null;
        }
    }, [agencyId]);

    const updatePostTitle = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        newTitle: string
    ): Promise<void> => {
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for updating title');
            throw new Error('No agency ID available');
        }

        try {
            console.log('[PostDetailsContext] Updating title for agency:', agencyId, 'client:', clientId, 'post:', postId);
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

            // Update Firestore with the new title
            await updateDoc(postRef, {
                title: newTitle,
                updatedAt: Timestamp.now()
            });

            // Update context post if it's the same post
            setPost(prev =>
                prev && prev.id === postId
                    ? {
                        ...prev,
                        title: newTitle,
                        updatedAt: Timestamp.now()
                    }
                    : prev
            );

            console.log('Post title updated successfully:', newTitle);
        } catch (error) {
            console.error('Error updating post title:', error);
            throw new Error('Failed to update post title');
        }
    }, []);

    const updatePostStatus = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        newStatus: string
    ): Promise<void> => {
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for updating status');
            throw new Error('No agency ID available');
        }

        try {
            console.log('[PostDetailsContext] Updating status for agency:', agencyId, 'client:', clientId, 'post:', postId);
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

            // Update Firestore with the new status
            await updateDoc(postRef, {
                status: newStatus,
                updatedAt: Timestamp.now()
            });

            // Update context post if it's the same post
            setPost(prev =>
                prev && prev.id === postId
                    ? {
                        ...prev,
                        status: newStatus,
                        updatedAt: Timestamp.now()
                    }
                    : prev
            );

            console.log('Post status updated successfully:', newStatus);
        } catch (error) {
            console.error('Error updating post status:', error);
            throw new Error('Failed to update post status');
        }
    }, []);

    const updateInternalNotes = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        newNotes: string
    ): Promise<void> => {
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for updating notes');
            throw new Error('No agency ID available');
        }

        try {
            console.log('[PostDetailsContext] Updating notes for agency:', agencyId, 'client:', clientId, 'post:', postId);
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

            // Update Firestore with the new internal notes
            await updateDoc(postRef, {
                internalNotes: newNotes,
                updatedAt: Timestamp.now()
            });

            // Update context post if it's the same post
            setPost(prev =>
                prev && prev.id === postId
                    ? {
                        ...prev,
                        internalNotes: newNotes,
                        updatedAt: Timestamp.now()
                    }
                    : prev
            );

            console.log('Post internal notes updated successfully');
        } catch (error) {
            console.error('Error updating post internal notes:', error);
            throw new Error('Failed to update post internal notes');
        }
    }, []);

    const updateTrainAI = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        trainAI: boolean
    ): Promise<void> => {
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for updating trainAI');
            throw new Error('No agency ID available');
        }

        try {
            console.log('[PostDetailsContext] Updating trainAI for agency:', agencyId, 'client:', clientId, 'post:', postId);
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

            // Update Firestore with the new trainAI setting
            await updateDoc(postRef, {
                trainAI: trainAI,
                updatedAt: Timestamp.now()
            });

            // Update context post if it's the same post
            setPost(prev =>
                prev && prev.id === postId
                    ? {
                        ...prev,
                        trainAI: trainAI,
                        updatedAt: Timestamp.now()
                    }
                    : prev
            );

            console.log('Post trainAI setting updated successfully:', trainAI);
        } catch (error) {
            console.error('Error updating post trainAI setting:', error);
            throw new Error('Failed to update post trainAI setting');
        }
    }, []);

    const updateInitialIdea = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        initialIdeaPrompt: string,
        objective: string
    ): Promise<void> => {
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for updating initial idea');
            throw new Error('No agency ID available');
        }

        try {
            console.log('[PostDetailsContext] Updating initial idea for agency:', agencyId, 'client:', clientId, 'post:', postId);
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

            // Update Firestore with the new initial idea and objective
            await updateDoc(postRef, {
                initialIdeaPrompt: initialIdeaPrompt,
                objective: objective,
                updatedAt: Timestamp.now()
            });

            // Update context post if it's the same post
            setPost(prev =>
                prev && prev.id === postId
                    ? {
                        ...prev,
                        initialIdea: {
                            ...prev.initialIdea,
                            initialIdeaPrompt: initialIdeaPrompt,
                            objective: objective
                        },
                        updatedAt: Timestamp.now()
                    }
                    : prev
            );

            console.log('Post initial idea and objective updated successfully');
        } catch (error) {
            console.error('Error updating post initial idea:', error);
            throw new Error('Failed to update post initial idea');
        }
    }, []);

    const regeneratePostFromIdea = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        subClientId: string,
        initialIdeaPrompt: string,
        objective: string
    ): Promise<string | null> => {
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for regenerating post');
            return null;
        }

        try {
            console.log('[PostDetailsContext] Regenerating post for agency:', agencyId, 'client:', clientId, 'post:', postId);
            const response = await fetch('https://web-production-2fc1.up.railway.app/api/v1/posts/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agency_id: agencyId,
                    client_id: clientId,
                    subclient_id: subClientId,
                    idea_id: postId,
                    save: true, // This should save to Firestore
                    create_title: false, // Don't overwrite the existing title
                    create_hooks: false, // Don't regenerate hooks
                    initial_idea_prompt: initialIdeaPrompt,
                    objective: objective
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.post_content) {
                return result.post_content;
            } else {
                console.error('API returned error:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error regenerating post from idea:', error);
            return null;
        }
    }, []);

    const updatePostScheduling = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        newStatus: string,
        scheduledPostAt: Timestamp
    ): Promise<void> => {
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for updating scheduling');
            throw new Error('No agency ID available');
        }

        try {
            console.log('[PostDetailsContext] Updating scheduling for agency:', agencyId, 'client:', clientId, 'post:', postId);
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

            // Update Firestore with the new status and scheduled time
            await updateDoc(postRef, {
                status: newStatus,
                scheduledPostAt: scheduledPostAt,
                updatedAt: Timestamp.now()
            });

            // Update context post if it's the same post
            setPost(prev =>
                prev && prev.id === postId
                    ? {
                        ...prev,
                        status: newStatus,
                        scheduledPostAt: scheduledPostAt,
                        updatedAt: Timestamp.now()
                    }
                    : prev
            );

            console.log('Post scheduling updated successfully:', { newStatus, scheduledPostAt });
        } catch (error) {
            console.error('Error updating post scheduling:', error);
            throw new Error('Failed to update post scheduling');
        }
    }, []);

    // Show authentication error if no agency ID
    if (!agencyId) {
        return (
            <PostDetailsContext.Provider value={{
                post: null,
                loading: false,
                error: 'No agency ID available. Please ensure you are signed in.',
                fetchPost: async () => { },
                clearPost: () => { },
                saveNewDraft: async () => { throw new Error('No agency ID available'); },
                generatePostHooks: async () => [],
                applyHook: async () => null,
                editPostWithInstructions: async () => null,
                editPostPartial: async () => null,
                updatePostTitle: async () => { throw new Error('No agency ID available'); },
                updatePostStatus: async () => { throw new Error('No agency ID available'); },
                updateInternalNotes: async () => { throw new Error('No agency ID available'); },
                updateTrainAI: async () => { throw new Error('No agency ID available'); },
                updateInitialIdea: async () => { throw new Error('No agency ID available'); },
                regeneratePostFromIdea: async () => null,
                updatePostScheduling: async () => { throw new Error('No agency ID available'); },
            }}>
                {children}
            </PostDetailsContext.Provider>
        );
    }

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
            editPostPartial: editPostPartialWrapper,
            updatePostTitle,
            updatePostStatus,
            updateInternalNotes,
            updateTrainAI,
            updateInitialIdea,
            regeneratePostFromIdea,
            updatePostScheduling
        }}>
            {children}
        </PostDetailsContext.Provider>
    );
};

