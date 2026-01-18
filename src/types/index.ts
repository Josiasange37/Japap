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
    reactions?: Record<string, number>; // e.g. { "🔥": 12, "😂": 4 }
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
    // Media processing
    processing?: boolean;
    processingProgress?: number;
    processingError?: boolean;
    temporaryContent?: string | null;
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
    reactions?: Record<string, number>;
    userReactions?: Record<string, string>;
}

export type VerificationLevel = 'unverified' | 'basic' | 'verified' | 'premium';

export interface UserProfile {
    pseudo: string;
    avatar: string | null;
    bio: string;
    onboarded: boolean;
    // Verification & Stats
    verificationLevel?: VerificationLevel;
    verificationBadge?: string;
    joinedAt?: number;
    lastActive?: number;
    stats?: {
        postsCount: number;
        reputation: number;
        helpfulFlags: number;
        communityContribution: number;
    };
    categoryInterests?: Record<string, number>;
}

export interface JapapNotification {
    id: string;
    type: 'like' | 'dislike' | 'comment' | 'reaction' | 'post_live' | 'trending' | 'new_post' | 'follow' | 'system';
    from?: string;
    userId?: string; // ID of the user who triggered the notification
    userName?: string;
    userAvatar?: string;
    title: string;
    message: string;
    timestamp: number | object; // serverTimestamp() result or number
    read: boolean;
    postId?: string;
    time?: string; // UI specific formatted time
}

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface PaginatedFeedState {
    posts: Post[];
    nextCursor?: string;
    hasMore: boolean;
    isLoadingMore: boolean;
}
