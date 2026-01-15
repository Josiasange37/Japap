export type MediaType = 'text' | 'image' | 'video' | 'audio' | 'link';

export interface Post {
    id: string;
    type: MediaType;
    content: string; // URL for media, text content for text/link
    timestamp: number;
    caption?: string;
    author: {
        id: string;
        username: string;
        avatar: string | null;
    };
    stats: {
        likes: number;
        comments: number;
        views: number;
        dislikes: number;
    };
    liked?: boolean;
    // Audio specific
    title?: string;
    artist?: string;
    cover?: string;
    // UI specific
    bgGradient?: string;

    // Interactions
    disliked?: boolean;
    userReaction?: string;
    commentsList?: GossipComment[];
    category?: string;
}

export interface GossipComment {
    id: string;
    text: string;
    author: {
        id: string;
        username: string;
        avatar: string | null;
    };
    timestamp: number;
    replyTo?: {
        id: string;
        username: string;
        text: string;
    };
    userReaction?: string;
}

export interface UserProfile {
    pseudo: string;
    avatar: string | null;
    bio: string;
    onboarded: boolean;
}
