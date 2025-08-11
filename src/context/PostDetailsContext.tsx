import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { doc as firestoreDoc, getDoc, Timestamp, updateDoc, deleteField } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/context/PostsContext';
import { Post, Draft, Hook, InitialIdea, Profile, Poll, postDetailsToPost } from '@/types/post';
import { format } from 'date-fns';

// Keep these types for backward compatibility during migration
export type { Draft, Hook, InitialIdea, Profile, Poll };

// Legacy type for backward compatibility
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
    linkedinPostUrl?: string;
    initialIdea: InitialIdea;
    profile: Profile;
    generatedHooks: Hook[];
    drafts: Draft[];
    images: string[];
    video?: string;
    poll?: Poll;
};

type PostDetailsContextType = {
    post: Post | null;
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
    cancelPostSchedule: (agencyId: string, clientId: string, postId: string) => Promise<void>;
    publishPostNow: (agencyId: string, clientId: string, postId: string, subClientId: string, content?: string) => Promise<{ success: boolean; linkedinPostId?: string; error?: string }>;
    uploadPostImages: (agencyId: string, clientId: string, postId: string, files: File[], replace?: boolean) => Promise<string[]>;
    removePostImage: (agencyId: string, clientId: string, postId: string, imageUrl: string) => Promise<void>;
    removeAllPostImages: (agencyId: string, clientId: string, postId: string) => Promise<void>;
    updatePostImages: (agencyId: string, clientId: string, postId: string, imageUrls: string[]) => Promise<void>;
    updatePostVideo: (agencyId: string, clientId: string, postId: string, videoUrl?: string) => Promise<void>;
    uploadPostVideo: (agencyId: string, clientId: string, postId: string, file: File) => Promise<string>;
    createPostPoll: (agencyId: string, clientId: string, postId: string, poll: Poll) => Promise<void>;
    updatePostPoll: (agencyId: string, clientId: string, postId: string, poll: Poll) => Promise<void>;
    removePostPoll: (agencyId: string, clientId: string, postId: string) => Promise<void>;
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
    cancelPostSchedule: async () => { },
    publishPostNow: async () => ({ success: false, error: 'Not implemented' }),
    uploadPostImages: async () => [],
    removePostImage: async () => { },
    removeAllPostImages: async () => { },
    updatePostImages: async () => { },
    updatePostVideo: async () => { },
    uploadPostVideo: async () => '',
    createPostPoll: async () => { },
    updatePostPoll: async () => { },
    removePostPoll: async () => { },
});

export const usePostDetails = () => useContext(PostDetailsContext);

// --- Provider ---
export const PostDetailsProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const { updatePostInCache } = usePosts();
    const [post, setPost] = useState<Post | null>(null);
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

            console.log('📥 Firebase data fetched:', {
                hasImages: !!(data.images && data.images.length > 0),
                hasVideo: !!data.video,
                'data.images': data.images,
                'data.video': data.video
            });

            // Fetch the profile data to get the LinkedIn picture
            let profileImageUrl = data.imageUrl; // Default to existing imageUrl
            if (data.profileId) {
                try {
                    const profileRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'subClients', data.profileId);
                    const profileSnap = await getDoc(profileRef);
                    if (profileSnap.exists()) {
                        const profileData = profileSnap.data();
                        // Use linkedinPicture from profile if available
                        profileImageUrl = profileData.linkedin?.linkedinPicture || data.imageUrl;
                    }
                } catch (profileError) {
                    console.warn('[PostDetailsContext] Could not fetch profile data:', profileError);
                    // Continue with existing imageUrl
                }
            }

            // Map Firestore data to unified Post type
            const postData: Post = {
                id: snap.id,
                postId: snap.id,
                title: data.title,
                status: data.status,
                updatedAt: data.updatedAt,
                createdAt: data.createdAt,
                scheduledPostAt: data.scheduledPostAt,
                postedAt: data.postedAt,
                linkedinPostUrl: data.linkedinPostUrl,
                internalNotes: data.internalNotes,
                trainAI: data.trainAI,
                profile: {
                    profileId: data.profileId,
                    profileName: data.profileName,
                    profileRole: data.profileRole,
                    imageUrl: profileImageUrl,
                },
                profileId: data.profileId,
                initialIdea: {
                    objective: data.objective,
                    initialIdeaPrompt: data.initialIdeaPrompt,
                    templateUsedId: data.templateUsedId,
                    templateUsedName: data.templateUsedName,
                },
                generatedHooks: (data.generatedHooks || []) as Hook[],
                drafts: (data.drafts || []) as Draft[],
                images: (data.images || []) as string[],
                video: data.video as string | undefined,
                poll: data.poll ? {
                    question: data.poll.question,
                    options: data.poll.options,
                    duration: data.poll.duration
                } as Poll : undefined,
            };
            setPost(postData);
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

            // Update PostsContext cache to keep it in sync
            try {
                updatePostInCache(agencyId, clientId, postId, { title: newTitle });
            } catch (cacheError) {
                console.warn('Failed to update PostsContext cache, but main update succeeded:', cacheError);
            }

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

            // Update PostsContext cache to keep it in sync
            try {
                updatePostInCache(agencyId, clientId, postId, {
                    status: newStatus
                });
            } catch (cacheError) {
                console.warn('Failed to update PostsContext cache, but main update succeeded:', cacheError);
            }

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

            // Update PostsContext cache to keep it in sync
            try {
                updatePostInCache(agencyId, clientId, postId, {
                    status: newStatus,
                    scheduledPostAt: scheduledPostAt
                });
            } catch (cacheError) {
                console.warn('Failed to update PostsContext cache, but main update succeeded:', cacheError);
            }

            console.log('Post scheduling updated successfully:', { newStatus, scheduledPostAt });
        } catch (error) {
            console.error('Error updating post scheduling:', error);
            throw new Error('Failed to update post scheduling');
        }
    }, []);

    const cancelPostSchedule = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string
    ): Promise<void> => {
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for cancelling schedule');
            throw new Error('No agency ID available');
        }

        try {
            console.log('[PostDetailsContext] Cancelling schedule for agency:', agencyId, 'client:', clientId, 'post:', postId);

            // Get the current post to find the scheduled date
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
            const postDoc = await getDoc(postRef);

            if (!postDoc.exists()) {
                throw new Error('Post not found');
            }

            const postData = postDoc.data();
            const scheduledPostAt = postData.scheduledPostAt;

            // 1. Remove from postEvents collection if scheduled
            if (scheduledPostAt) {
                const scheduledDate = new Date(scheduledPostAt.seconds * 1000);
                const yearMonth = format(scheduledDate, 'yyyy-MM');

                const postEventRef = firestoreDoc(
                    db,
                    'agencies', agencyId,
                    'clients', clientId,
                    'postEvents', yearMonth
                );

                // Get the current document and remove this specific post
                const postEventDoc = await getDoc(postEventRef);

                if (postEventDoc.exists()) {
                    await updateDoc(postEventRef, {
                        [postId]: deleteField()
                    });
                }
            }

            // 2. Update the post in the ideas collection
            await updateDoc(postRef, {
                status: 'Drafted', // Reset to drafted status
                scheduledPostAt: deleteField(), // Remove the scheduled date
                updatedAt: Timestamp.now()
            });

            // Update context post if it's the same post
            setPost(prev =>
                prev && prev.id === postId
                    ? {
                        ...prev,
                        status: 'Drafted',
                        scheduledPostAt: undefined,
                        updatedAt: Timestamp.now()
                    }
                    : prev
            );

            // Update PostsContext cache to keep it in sync
            try {
                updatePostInCache(agencyId, clientId, postId, {
                    status: 'Drafted',
                    scheduledPostAt: undefined
                });
            } catch (cacheError) {
                console.warn('Failed to update PostsContext cache, but main update succeeded:', cacheError);
            }

            console.log('Post schedule cancelled successfully for post:', postId);
        } catch (error) {
            console.error('Error cancelling post schedule:', error);
            throw new Error('Failed to cancel post schedule');
        }
    }, []);

    const publishPostNow = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        subClientId: string,
        content?: string
    ): Promise<{ success: boolean; linkedinPostId?: string; error?: string }> => {
        if (!agencyId) {
            console.error('[PostDetailsContext] No agency ID available for publishing post');
            return { success: false, error: 'No agency ID available' };
        }

        try {
            console.log('[PostDetailsContext] Publishing post for agency:', agencyId, 'client:', clientId, 'post:', postId);

            const response = await fetch('https://web-production-2fc1.up.railway.app/api/v1/posts/publish-now', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agency_id: agencyId,
                    client_id: clientId,
                    subclient_id: subClientId,
                    idea_id: postId,
                    ...(content && { content })
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API returned error:', response.status, errorText);
                return { success: false, error: `API error: ${response.status} - ${errorText}` };
            }

            const result = await response.json();

            if (result.success) {
                // Update context post with the new status and posted timestamp
                setPost(prev =>
                    prev && prev.id === postId
                        ? {
                            ...prev,
                            status: 'Posted',
                            postedAt: Timestamp.now(),
                            updatedAt: Timestamp.now(),
                            linkedinPostUrl: result.linkedin_post_url // Optional URL for LinkedIn post
                        }
                        : prev
                );

                // Update PostsContext cache to keep it in sync
                try {
                    updatePostInCache(agencyId, clientId, postId, {
                        status: 'Posted'
                    });
                } catch (cacheError) {
                    console.warn('Failed to update PostsContext cache, but post was published successfully:', cacheError);
                }

                console.log('Post published successfully:', {
                    linkedinPostId: result.linkedin_post_id,
                    content: result.post_content
                });

                return {
                    success: true,
                    linkedinPostId: result.linkedin_post_id
                };
            } else {
                console.error('API returned error:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error publishing post:', error);
            return { success: false, error: 'Network error occurred while publishing' };
        }
    }, []);

    // Image management functions
    const uploadPostImages = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        files: File[],
        replace: boolean = false
    ): Promise<string[]> => {
        if (!agencyId) {
            throw new Error('No agency ID available');
        }

        try {
            // If replacing, we need to delete old images from storage first
            if (replace && post?.images && post.images.length > 0) {
                console.log('Deleting old images before uploading new ones...');
                for (const oldImageUrl of post.images) {
                    try {
                        // Extract storage path from Firebase download URL and delete
                        const url = new URL(oldImageUrl);
                        if (url.hostname === 'firebasestorage.googleapis.com') {
                            const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);
                            if (pathMatch) {
                                const storagePath = decodeURIComponent(pathMatch[1]);
                                const storageRef = ref(storage, storagePath);
                                await deleteObject(storageRef);
                                console.log('Deleted old image from storage:', storagePath);
                            }
                        }
                    } catch (deleteError) {
                        console.warn('Failed to delete old image:', oldImageUrl, deleteError);
                        // Continue with other images even if one fails
                    }
                }
            }

            const uploadPromises = files.map(async (file) => {
                // Create a unique filename with timestamp
                const timestamp = Date.now();
                const fileName = `${agencyId}/${clientId}/${postId}/${timestamp}_${file.name}`;
                const storageRef = ref(storage, `post-images/${fileName}`);

                // Upload file to Firebase Storage
                const snapshot = await uploadBytes(storageRef, file);

                // Get download URL
                const downloadURL = await getDownloadURL(snapshot.ref);
                return downloadURL;
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            // Update the post in Firestore with new image URLs
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
            const currentImages = post?.images || [];
            const updatedImages = replace ? uploadedUrls : [...currentImages, ...uploadedUrls];

            await updateDoc(postRef, {
                images: updatedImages,
                updatedAt: Timestamp.now()
            });

            // Update local state
            setPost(prev => prev ? {
                ...prev,
                images: updatedImages,
                updatedAt: Timestamp.now()
            } : null);

            console.log('Images uploaded successfully:', uploadedUrls);
            return uploadedUrls;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    }, [post]);

    const removePostImage = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        imageUrl: string
    ): Promise<void> => {
        if (!agencyId) {
            throw new Error('No agency ID available');
        }

        try {
            // Extract storage path from Firebase download URL and delete from Firebase Storage
            try {
                // Firebase download URLs have this format: 
                // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
                // We need to extract the path between /o/ and ?alt=media
                const url = new URL(imageUrl);
                if (url.hostname === 'firebasestorage.googleapis.com') {
                    const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);
                    if (pathMatch) {
                        // Decode the URL-encoded path
                        const storagePath = decodeURIComponent(pathMatch[1]);
                        const storageRef = ref(storage, storagePath);
                        await deleteObject(storageRef);
                        console.log('Successfully deleted from Firebase Storage:', storagePath);
                    } else {
                        console.warn('Could not extract storage path from URL:', imageUrl);
                    }
                } else {
                    console.warn('URL is not a Firebase Storage URL:', imageUrl);
                }
            } catch (storageError) {
                console.warn('Could not delete from storage (file may not exist):', storageError);
                // Continue with Firestore update even if storage deletion fails
            }

            // Update the post in Firestore
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
            const currentImages = post?.images || [];
            const updatedImages = currentImages.filter(url => url !== imageUrl);

            await updateDoc(postRef, {
                images: updatedImages,
                updatedAt: Timestamp.now()
            });

            // Update local state
            setPost(prev => prev ? {
                ...prev,
                images: updatedImages,
                updatedAt: Timestamp.now()
            } : null);

            console.log('Image removed successfully:', imageUrl);
        } catch (error) {
            console.error('Error removing image:', error);
            throw error;
        }
    }, [post]);

    const removeAllPostImages = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string
    ): Promise<void> => {
        if (!agencyId) {
            throw new Error('No agency ID available');
        }

        try {
            const currentImages = post?.images || [];

            // Delete all images from Firebase Storage
            for (const imageUrl of currentImages) {
                try {
                    // Extract storage path from Firebase download URL and delete
                    const url = new URL(imageUrl);
                    if (url.hostname === 'firebasestorage.googleapis.com') {
                        const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);
                        if (pathMatch) {
                            const storagePath = decodeURIComponent(pathMatch[1]);
                            const storageRef = ref(storage, storagePath);
                            await deleteObject(storageRef);
                            console.log('Successfully deleted from Firebase Storage:', storagePath);
                        }
                    }
                } catch (deleteError) {
                    console.warn('Failed to delete image from storage:', imageUrl, deleteError);
                    // Continue with other images even if one fails
                }
            }

            // Clear images array in Firestore
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
            await updateDoc(postRef, {
                images: [],
                updatedAt: Timestamp.now()
            });

            // Update local state
            setPost(prev => prev ? {
                ...prev,
                images: [],
                updatedAt: Timestamp.now()
            } : null);

            console.log('All images removed successfully');
        } catch (error) {
            console.error('Error removing all images:', error);
            throw error;
        }
    }, [post]);

    const updatePostImages = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        imageUrls: string[]
    ): Promise<void> => {
        if (!agencyId) {
            throw new Error('No agency ID available');
        }

        try {
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

            await updateDoc(postRef, {
                images: imageUrls,
                updatedAt: Timestamp.now()
            });

            // Update local state
            setPost(prev => prev ? {
                ...prev,
                images: imageUrls,
                updatedAt: Timestamp.now()
            } : null);

            console.log('Images updated successfully:', imageUrls);
        } catch (error) {
            console.error('Error updating images:', error);
            throw error;
        }
    }, []);

    const updatePostVideo = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        videoUrl?: string
    ): Promise<void> => {
        if (!agencyId) {
            throw new Error('No agency ID available');
        }

        try {
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

            const updateData: any = {
                updatedAt: Timestamp.now()
            };

            // Set video URL or remove the field if videoUrl is undefined/null
            if (videoUrl) {
                updateData.video = videoUrl;
            } else {
                updateData.video = deleteField();
            }

            await updateDoc(postRef, updateData);

            // Update local state
            setPost(prev => prev ? {
                ...prev,
                video: videoUrl,
                updatedAt: Timestamp.now()
            } : null);

            console.log('Video updated successfully:', videoUrl);
        } catch (error) {
            console.error('Error updating video:', error);
            throw error;
        }
    }, []);

    const uploadPostVideo = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        file: File
    ): Promise<string> => {
        if (!agencyId) {
            throw new Error('No agency ID available');
        }

        try {
            // Create a unique filename with timestamp
            const timestamp = Date.now();
            const fileName = `${agencyId}/${clientId}/${postId}/${timestamp}_${file.name}`;
            const storageRef = ref(storage, `post-videos/${fileName}`);

            // Upload file to Firebase Storage
            const snapshot = await uploadBytes(storageRef, file);

            // Get download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Update the video field directly (without touching images array)
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
            await updateDoc(postRef, {
                video: downloadURL,
                updatedAt: Timestamp.now()
            });

            console.log('🎥 Video stored in Firebase:', {
                videoUrl: downloadURL,
                field: 'video',
                imagesArrayUntouched: true
            });

            // Update local state
            setPost(prev => prev ? {
                ...prev,
                video: downloadURL,
                updatedAt: Timestamp.now()
            } : null);

            console.log('Video uploaded successfully:', downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading video:', error);
            throw error;
        }
    }, []);

    // Poll management functions
    const createPostPoll = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        poll: Poll
    ): Promise<void> => {
        if (!agencyId) {
            throw new Error('No agency ID available');
        }

        try {
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

            await updateDoc(postRef, {
                poll: {
                    question: poll.question,
                    options: poll.options,
                    duration: poll.duration
                },
                updatedAt: Timestamp.now()
            });

            // Update local state
            setPost(prev => prev ? {
                ...prev,
                poll: poll,
                updatedAt: Timestamp.now()
            } : null);

            console.log('Poll created successfully:', poll);
        } catch (error) {
            console.error('Error creating poll:', error);
            throw error;
        }
    }, []);

    const updatePostPoll = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string,
        poll: Poll
    ): Promise<void> => {
        if (!agencyId) {
            throw new Error('No agency ID available');
        }

        try {
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

            await updateDoc(postRef, {
                poll: {
                    question: poll.question,
                    options: poll.options,
                    duration: poll.duration
                },
                updatedAt: Timestamp.now()
            });

            // Update local state
            setPost(prev => prev ? {
                ...prev,
                poll: poll,
                updatedAt: Timestamp.now()
            } : null);

            console.log('Poll updated successfully:', poll);
        } catch (error) {
            console.error('Error updating poll:', error);
            throw error;
        }
    }, []);

    const removePostPoll = useCallback(async (
        agencyId: string,
        clientId: string,
        postId: string
    ): Promise<void> => {
        if (!agencyId) {
            throw new Error('No agency ID available');
        }

        try {
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

            await updateDoc(postRef, {
                poll: null, // Remove the poll field
                updatedAt: Timestamp.now()
            });

            // Update local state
            setPost(prev => prev ? {
                ...prev,
                poll: undefined,
                updatedAt: Timestamp.now()
            } : null);

            console.log('Poll removed successfully');
        } catch (error) {
            console.error('Error removing poll:', error);
            throw error;
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
                cancelPostSchedule: async () => { throw new Error('No agency ID available'); },
                publishPostNow: async () => ({ success: false, error: 'No agency ID available' }),
                uploadPostImages: async () => { throw new Error('No agency ID available'); },
                removePostImage: async () => { throw new Error('No agency ID available'); },
                removeAllPostImages: async () => { throw new Error('No agency ID available'); },
                updatePostImages: async () => { throw new Error('No agency ID available'); },
                updatePostVideo: async () => { throw new Error('No agency ID available'); },
                uploadPostVideo: async () => { throw new Error('No agency ID available'); },
                createPostPoll: async () => { throw new Error('No agency ID available'); },
                updatePostPoll: async () => { throw new Error('No agency ID available'); },
                removePostPoll: async () => { throw new Error('No agency ID available'); },
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
            updatePostScheduling,
            cancelPostSchedule,
            publishPostNow,
            uploadPostImages,
            removePostImage,
            removeAllPostImages,
            updatePostImages,
            updatePostVideo,
            uploadPostVideo,
            createPostPoll,
            updatePostPoll,
            removePostPoll
        }}>
            {children}
        </PostDetailsContext.Provider>
    );
};

