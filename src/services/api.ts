import type { Post, GossipComment, UserProfile } from '../types';
import { ref, set, get, child, push, runTransaction, serverTimestamp } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { rtdb, storage } from '../firebase';

/**
 * This service acts as the bridge between the UI and the Backend.
 * Centralized Firebase RTDB and Storage operations.
 */

const normalizePseudo = (pseudo: string) => pseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');

export const JapapAPI = {
    // User Management
    async checkPseudoAvailability(pseudo: string): Promise<boolean> {
        if (!pseudo) return false;
        const normalized = normalizePseudo(pseudo);
        try {
            const snapshot = await get(child(ref(rtdb), `users/${normalized}`));
            return !snapshot.exists();
        } catch (error) {
            console.error("Error checking pseudo:", error);
            return false;
        }
    },

    async registerUser(pseudo: string, avatar: string | null, bio: string): Promise<UserProfile> {
        const normalized = normalizePseudo(pseudo);
        const newUser: UserProfile = {
            pseudo,
            avatar,
            onboarded: true,
            bio: bio || "Spilling tea since forever"
        };
        await set(ref(rtdb, `users/${normalized}`), newUser);
        return newUser;
    },

    async updateUser(pseudo: string, updates: Partial<UserProfile>): Promise<void> {
        const normalized = normalizePseudo(pseudo);
        const userRef = ref(rtdb, `users/${normalized}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            await set(userRef, { ...snapshot.val(), ...updates });
        }
    },

    // Posts
    async getPosts(limitCount: number = 20): Promise<Post[]> {
        // This is now mainly handled by real-time listeners in AppContext, 
        // but kept for initial/one-off fetches.
        const postsRef = ref(rtdb, 'posts');
        const snapshot = await get(child(ref(rtdb), 'posts')); // Simplification for now
        const data = snapshot.val();
        if (!data) return [];

        return Object.keys(data).map(key => ({
            id: key,
            ...data[key],
            stats: { likes: 0, dislikes: 0, comments: 0, views: 0, ...data[key].stats }
        })).sort((a, b) => b.timestamp - a.timestamp);
    },

    async createPost(post: any): Promise<string> {
        const newPostRef = push(ref(rtdb, 'posts'));
        await set(newPostRef, {
            ...post,
            timestamp: serverTimestamp(),
            stats: { likes: 0, dislikes: 0, comments: 0, views: 0 },
            reactions: {}
        });
        return newPostRef.key as string;
    },

    async deletePost(postId: string): Promise<void> {
        await set(ref(rtdb, `posts/${postId}`), null);
    },

    // Interactions
    async toggleLike(postId: string, userPseudo: string): Promise<void> {
        const postRef = ref(rtdb, `posts/${postId}`);
        await runTransaction(postRef, (post) => {
            if (post) {
                if (!post.stats) post.stats = { likes: 0, dislikes: 0, comments: 0, views: 0 };
                const users = post.users || {};
                const userState = users[userPseudo] || {};

                if (userState.liked) {
                    post.stats.likes = (post.stats.likes || 1) - 1;
                    userState.liked = false;
                } else {
                    post.stats.likes = (post.stats.likes || 0) + 1;
                    userState.liked = true;
                    if (userState.disliked) {
                        post.stats.dislikes = (post.stats.dislikes || 1) - 1;
                        userState.disliked = false;
                    }
                }
                if (!post.users) post.users = {};
                post.users[userPseudo] = userState;
            }
            return post;
        });
    },

    async toggleDislike(postId: string, userPseudo: string): Promise<void> {
        const postRef = ref(rtdb, `posts/${postId}`);
        await runTransaction(postRef, (post) => {
            if (post) {
                if (!post.stats) post.stats = { likes: 0, dislikes: 0, comments: 0, views: 0 };
                const users = post.users || {};
                const userState = users[userPseudo] || {};

                if (userState.disliked) {
                    post.stats.dislikes = (post.stats.dislikes || 1) - 1;
                    userState.disliked = false;
                } else {
                    post.stats.dislikes = (post.stats.dislikes || 0) + 1;
                    userState.disliked = true;
                    if (userState.liked) {
                        post.stats.likes = (post.stats.likes || 1) - 1;
                        userState.liked = false;
                    }
                }
                if (!post.users) post.users = {};
                post.users[userPseudo] = userState;
            }
            return post;
        });
    },

    async addReaction(postId: string, userPseudo: string, emoji: string): Promise<void> {
        const postRef = ref(rtdb, `posts/${postId}`);
        await runTransaction(postRef, (post) => {
            if (post) {
                if (!post.reactions) post.reactions = {};
                const users = post.users || {};
                const userState = users[userPseudo] || {};
                const oldReaction = userState.reaction;

                if (oldReaction === emoji) {
                    post.reactions[emoji] = (post.reactions[emoji] || 1) - 1;
                    if (post.reactions[emoji] <= 0) delete post.reactions[emoji];
                    userState.reaction = null;
                } else {
                    if (oldReaction) {
                        post.reactions[oldReaction] = (post.reactions[oldReaction] || 1) - 1;
                        if (post.reactions[oldReaction] <= 0) delete post.reactions[oldReaction];
                    }
                    post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
                    userState.reaction = emoji;
                }
                if (!post.users) post.users = {};
                post.users[userPseudo] = userState;
            }
            return post;
        });
    },

    // Comments
    async addComment(postId: string, comment: any): Promise<string> {
        const newCommentRef = push(ref(rtdb, `comments/${postId}`));
        const commentId = newCommentRef.key as string;
        await set(newCommentRef, { ...comment, id: commentId, timestamp: Date.now() });

        // Increment count
        const postStatsRef = ref(rtdb, `posts/${postId}/stats/comments`);
        await runTransaction(postStatsRef, (current) => (current || 0) + 1);

        return commentId;
    },

    async addCommentReaction(postId: string, commentId: string, userPseudo: string, emoji: string): Promise<void> {
        const commentRef = ref(rtdb, `comments/${postId}/${commentId}`);
        await runTransaction(commentRef, (comment) => {
            if (comment) {
                if (!comment.reactions) comment.reactions = {};
                if (!comment.userReactions) comment.userReactions = {};

                const oldReaction = comment.userReactions[userPseudo];

                if (oldReaction === emoji) {
                    comment.reactions[emoji] = (comment.reactions[emoji] || 1) - 1;
                    if (comment.reactions[emoji] <= 0) delete comment.reactions[emoji];
                    delete comment.userReactions[userPseudo];
                } else {
                    if (oldReaction) {
                        comment.reactions[oldReaction] = (comment.reactions[oldReaction] || 1) - 1;
                        if (comment.reactions[oldReaction] <= 0) delete comment.reactions[oldReaction];
                    }
                    comment.reactions[emoji] = (comment.reactions[emoji] || 0) + 1;
                    comment.userReactions[userPseudo] = emoji;
                }
            }
            return comment;
        });
    },

    // Notifications
    async sendNotification(recipientPseudo: string, notification: any): Promise<void> {
        const normalized = normalizePseudo(recipientPseudo);
        const notifRef = push(ref(rtdb, `notifications/${normalized}`));
        await set(notifRef, { ...notification, timestamp: serverTimestamp(), read: false });
    },

    // Storage
    async uploadFile(file: File, folder: string = 'media'): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const sRef = storageRef(storage, `${folder}/${fileName}`);
        const snapshot = await uploadBytes(sRef, file);
        return await getDownloadURL(snapshot.ref);
    },

    async requestNotificationPermission(): Promise<boolean> {
        if (!('Notification' in window)) return false;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
};

