import { Timestamp } from 'firebase/firestore';

// Supporting types from PostDetailsContext
export type Draft = {
    text: string;
    createdAt: Timestamp;
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
    imageUrl?: string;
};

export type Poll = {
    question: string;
    options: string[];
    duration: string;
};

// Unified Post type with optional fields
export type Post = {
    // Core fields (always present)
    id: string;
    postId: string;           // For compatibility with current PostCard
    title: string;
    status: string;
    updatedAt: Timestamp;
    createdAt?: Timestamp;
    
    // Profile information (flexible for both simple and detailed)
    profile: string | Profile;    // Can be simple string or detailed Profile object
    profileId?: string;           // For when profile is a string
    
    // Optional detailed fields (only loaded when needed)
    scheduledPostAt?: Timestamp;
    postedAt?: Timestamp;
    linkedinPostUrl?: string;
    internalNotes?: string;
    trainAI?: boolean;
    
    // Complex nested objects (only for detailed views)
    initialIdea?: InitialIdea;
    generatedHooks?: Hook[];
    drafts?: Draft[];
    images?: string[];
    video?: string;
    poll?: Poll;
};

// Field selection types for different use cases
export type PostListFields = Pick<Post, 'id' | 'postId' | 'title' | 'status' | 'updatedAt' | 'profile' | 'profileId' | 'scheduledPostAt'>;
export type PostDetailFields = Post; // All fields

// Type guards to check if post has detailed fields loaded
export const isDetailedPost = (post: Post | null | undefined): post is PostDetailFields => {
    if (!post) return false;
    return post.createdAt !== undefined && 
           typeof post.profile === 'object' && 
           post.initialIdea !== undefined;
};

export const isSimplePost = (post: Post | null | undefined): post is PostListFields => {
    if (!post) return false;
    return typeof post.profile === 'string';
};

// Utility to get profile name regardless of profile type
export const getProfileName = (post: Post | null | undefined): string => {
    if (!post) return '';
    return typeof post.profile === 'string' ? post.profile : post.profile.profileName;
};

// Utility to get profile ID regardless of profile type
export const getProfileId = (post: Post | null | undefined): string => {
    if (!post) return '';
    if (typeof post.profile === 'string') {
        return post.profileId || '';
    }
    return post.profile.profileId;
};

// Utility to get profile role regardless of profile type
export const getProfileRole = (post: Post | null | undefined): string => {
    if (!post) return '';
    if (typeof post.profile === 'string') {
        return '';
    }
    return post.profile.profileRole || '';
};

// Utility to get profile image URL regardless of profile type
export const getProfileImageUrl = (post: Post | null | undefined): string | undefined => {
    if (!post) return undefined;
    if (typeof post.profile === 'string') {
        return undefined;
    }
    return post.profile.imageUrl;
};

// Utility to convert old PostCard to new Post type (for migration)
export const postCardToPost = (postCard: any): Post => {
    return {
        id: postCard.postId,
        postId: postCard.postId,
        title: postCard.title,
        status: postCard.status,
        updatedAt: postCard.updatedAt,
        profile: postCard.profile,
        profileId: postCard.profileId,
        scheduledPostAt: postCard.scheduledPostAt,
    };
};

// Utility to convert old PostDetails to new Post type (for migration)
export const postDetailsToPost = (postDetails: any): Post => {
    return {
        id: postDetails.id,
        postId: postDetails.id,
        title: postDetails.title,
        status: postDetails.status,
        updatedAt: postDetails.updatedAt,
        createdAt: postDetails.createdAt,
        profile: postDetails.profile,
        profileId: postDetails.profile.profileId,
        scheduledPostAt: postDetails.scheduledPostAt,
        postedAt: postDetails.postedAt,
        linkedinPostUrl: postDetails.linkedinPostUrl,
        internalNotes: postDetails.internalNotes,
        trainAI: postDetails.trainAI,
        initialIdea: postDetails.initialIdea,
        generatedHooks: postDetails.generatedHooks,
        drafts: postDetails.drafts,
        images: postDetails.images,
        video: postDetails.video,
        poll: postDetails.poll,
    };
};
