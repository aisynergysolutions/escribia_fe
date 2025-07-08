import React, { createContext, useContext, useState, ReactNode } from 'react';
import { doc as firestoreDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export type Timestamp = {
    nanoseconds: number;
    seconds: number;
};

export type Hook = {
    angle: string;
    selected: boolean;
    text: string;
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
    objective: string;
    drafts: Draft[];
    subClientId: string;
    profile: string;
    profileRole: string;
    trainAI: boolean;
};

type PostsDetailsContextType = {
    getPostDetails: (agencyId: string, clientId: string, postId: string) => Promise<PostDetails | null>;
    postDetails: PostDetails | null;
    postDetailsLoading: boolean;
    postDetailsError: string | null;
    updatePostTitle: (agencyId: string, clientId: string, postId: string, newTitle: string) => Promise<void>;
    updatePostStatus: (agencyId: string, clientId: string, postId: string, newStatus: string) => Promise<void>;
    updateInternalNotes: (agencyId: string, clientId: string, postId: string, newNotes: string) => Promise<void>;
    updateTrainAI: (agencyId: string, clientId: string, postId: string, trainAI: boolean) => Promise<void>;
    saveNewDraft: (agencyId: string, clientId: string, postId: string, newText: string, notes?: string, generatedByAI?: boolean) => Promise<void>;
};

const PostsDetailsContext = createContext<PostsDetailsContextType>({
    getPostDetails: async () => null,
    postDetails: null,
    postDetailsLoading: false,
    postDetailsError: null,
    updatePostTitle: async () => { },
    updatePostStatus: async () => { },
    updateInternalNotes: async () => { },
    updateTrainAI: async () => { },
    saveNewDraft: async () => { },
});

export const usePostsDetails = () => useContext(PostsDetailsContext);

export const PostsDetailsProvider = ({ children }: { children: ReactNode }) => {
    const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
    const [postDetailsLoading, setPostDetailsLoading] = useState(false);
    const [postDetailsError, setPostDetailsError] = useState<string | null>(null);

    // Fetch details for a single post (idea)
    const getPostDetails = async (
        agencyId: string,
        clientId: string,
        postId: string
    ): Promise<PostDetails | null> => {
        setPostDetailsLoading(true);
        setPostDetailsError(null);
        try {
            const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
            const snapshot = await getDoc(postRef);

            if (!snapshot.exists()) {
                setPostDetailsError('Post not found');
                setPostDetails(null);
                return null;
            }

            const data = snapshot.data();

            // Convert drafts with proper timestamp handling
            const drafts = data.drafts || [];
            const convertedDrafts = drafts.map((draft: any) => ({
                version: draft.version || 1,
                createdAt: draft.createdAt
                    ? (typeof draft.createdAt === 'string'
                        ? { seconds: Math.floor(new Date(draft.createdAt).getTime() / 1000), nanoseconds: 0 }
                        : draft.createdAt)
                    : { nanoseconds: 0, seconds: 0 },
                text: draft.text || '',
                generatedByAI: draft.generatedByAI || false,
                notes: draft.notes || '',
            }));

            // Get the latest draft text (last element in drafts array)
            const latestDraft = convertedDrafts.length > 0
                ? convertedDrafts[convertedDrafts.length - 1]
                : null;
            const currentDraftText = latestDraft?.text || data.currentDraftText || '';

            const details: PostDetails = {
                livePostUrl: data.livePostUrl || '',
                internalNotes: data.internalNotes || '',
                id: snapshot.id,
                generatedHooks: data.generatedHooks || [],
                status: data.status || '',
                clientId: data.clientId || '',
                actuallyPostedAt: data.actuallyPostedAt || { nanoseconds: 0, seconds: 0 },
                updatedAt: data.lastUpdated
                    ? (typeof data.lastUpdated === 'string'
                        ? { seconds: Math.floor(new Date(data.lastUpdated).getTime() / 1000), nanoseconds: 0 }
                        : data.lastUpdated)
                    : { nanoseconds: 0, seconds: 0 },
                initialIdeaPrompt: data.initialIdeaPrompt || '',
                finalApprovedText: data.finalApprovedText || '',
                currentDraftText: currentDraftText, // Use latest draft text
                scheduledPostAt: data.scheduledPostAt || { nanoseconds: 0, seconds: 0 },
                templateUsedId: data.templateUsedId || null,
                title: data.title || '',
                createdAt: data.createdAt
                    ? (typeof data.createdAt === 'string'
                        ? { seconds: Math.floor(new Date(data.createdAt).getTime() / 1000), nanoseconds: 0 }
                        : data.createdAt)
                    : { nanoseconds: 0, seconds: 0 },
                objective: data.objective || '',
                drafts: convertedDrafts,
                subClientId: data.profileId || data.subClientId || '',
                profile: data.profileName || data.profile || '',
                profileRole: data.profileRole || '',
                trainAI: data.trainAI || false,
            };

            setPostDetails(details);
            return details;
        } catch (err: any) {
            console.error('[PostsDetailsContext] Error fetching post details:', err);
            setPostDetailsError(err.message || 'Failed to fetch post details');
            setPostDetails(null);
            return null;
        } finally {
            setPostDetailsLoading(false);
        }
    };

    // Update post title in Firestore and context
    const updatePostTitle = async (
        agencyId: string,
        clientId: string,
        postId: string,
        newTitle: string
    ) => {
        const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
        await updateDoc(postRef, { title: newTitle });

        // Update context postDetails if it's the same post
        setPostDetails(prev =>
            prev && prev.id === postId ? { ...prev, title: newTitle } : prev
        );
    };

    // Update post status in Firestore and context
    const updatePostStatus = async (
        agencyId: string,
        clientId: string,
        postId: string,
        newStatus: string
    ) => {
        const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
        await updateDoc(postRef, { status: newStatus });

        setPostDetails(prev =>
            prev && prev.id === postId ? { ...prev, status: newStatus } : prev
        );
    };

    // Update internal notes in Firestore and context
    const updateInternalNotes = async (
        agencyId: string,
        clientId: string,
        postId: string,
        newNotes: string
    ) => {
        const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
        await updateDoc(postRef, { internalNotes: newNotes });

        setPostDetails(prev =>
            prev && prev.id === postId ? { ...prev, internalNotes: newNotes } : prev
        );
    };

    // Update trainAI in Firestore and context
    const updateTrainAI = async (
        agencyId: string,
        clientId: string,
        postId: string,
        trainAI: boolean
    ) => {
        const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
        await updateDoc(postRef, { trainAI });

        setPostDetails(prev =>
            prev && prev.id === postId ? { ...prev, trainAI } : prev
        );
    };

    // Save a new draft to the drafts array in Firestore and update context
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
            const currentDrafts = postDetails?.drafts || [];
            const nextVersion = currentDrafts.length > 0
                ? Math.max(...currentDrafts.map(d => d.version)) + 1
                : 1;

            // Create new draft object
            const newDraft: Draft = {
                version: nextVersion,
                createdAt: {
                    seconds: Math.floor(Date.now() / 1000),
                    nanoseconds: 0
                },
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

            // Update context postDetails if it's the same post
            setPostDetails(prev =>
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

    return (
        <PostsDetailsContext.Provider
            value={{
                getPostDetails,
                postDetails,
                postDetailsLoading,
                postDetailsError,
                updatePostTitle,
                updatePostStatus,
                updateInternalNotes,
                updateTrainAI,
                saveNewDraft,
            }}
        >
            {children}
        </PostsDetailsContext.Provider>
    );
};

// Mock response handler function
export const handleMockResponse = async (
    agencyId: string,
    clientId: string,
    postId: string,
    mockResponse: {
        generatedHooks: { angle: string; selected: boolean; text: string }[];
        post_content: string;
        title: string;
    }
): Promise<void> => {
    try {
        const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);

        // Wait for 2 seconds before proceeding
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get current document to access existing drafts
        const docSnapshot = await getDoc(postRef);
        const currentData = docSnapshot.exists() ? docSnapshot.data() : {};
        const currentDrafts = currentData.drafts || [];

        // Determine the next version number
        const nextVersion = currentDrafts.length > 0
            ? Math.max(...currentDrafts.map((d: any) => d.version || 1)) + 1
            : 1;

        // Create new draft for the mock response
        const newDraft = {
            createdAt: new Date().toISOString(),
            text: mockResponse.post_content,
            version: nextVersion,
            generatedByAI: true,
            notes: 'Generated from mock response',
        };

        // Prepare the data to update
        const updateData = {
            generatedHooks: mockResponse.generatedHooks,
            drafts: [...currentDrafts, newDraft], // Append to existing drafts
            title: mockResponse.title,
            currentDraftText: mockResponse.post_content, // Also update currentDraftText for compatibility
        };

        // Update the Firestore document
        await updateDoc(postRef, updateData);

        console.log('Mock response data successfully uploaded to Firestore.');
    } catch (error) {
        console.error('Error uploading mock response data:', error);
        throw new Error('Failed to upload mock response data.');
    }
};
