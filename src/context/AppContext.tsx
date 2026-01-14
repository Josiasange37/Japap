import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    ref,
    onValue,
    push,
    set,
    update,
    runTransaction,
    off,
    remove
} from 'firebase/database';
import {
    onAuthStateChanged,
    signInAnonymously
} from 'firebase/auth';
import { getToken } from 'firebase/messaging';
import { rtdb, auth, messaging } from '../firebase';
import type { Post, UserProfile, Comment } from '../types';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface AppContextType {
    user: UserProfile | null;
    posts: Post[];
    updateUser: (updates: Partial<UserProfile>) => void;
    addPost: (post: Omit<Post, 'id' | 'author' | 'stats'>) => void;
    likePost: (id: string) => void;
    dislikePost: (id: string) => void;
    reactToPost: (id: string, emoji: string | null) => void;
    reactToComment: (postId: string, commentId: string, emoji: string | null) => void;
    addComment: (postId: string, text: string, replyTo?: Comment['replyTo']) => void;
    toasts: Toast[];
    showToast: (message: string, type?: Toast['type']) => void;
    removeToast: (id: string) => void;
    activeCommentsPostId: string | null;
    setActiveCommentsPostId: (id: string | null) => void;
    activeSharePost: { caption: string, url: string } | null;
    setActiveSharePost: (data: { caption: string, url: string } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial data is now empty as we fetch from Firestore
export function AppProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(() => {
        const stored = localStorage.getItem('japap_user');
        return stored ? JSON.parse(stored) : null;
    });

    const [posts, setPosts] = useState<Post[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
    const [activeSharePost, setActiveSharePost] = useState<{ caption: string, url: string } | null>(null);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Firebase Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (!authUser) {
                // If not signed in, we'll wait for onboarding or sign in anonymously
                signInAnonymously(auth).catch(err => console.error("Auth error:", err));
            }
        });
        return () => unsubscribe();
    }, []);

    // FCM Notification Support
    useEffect(() => {
        if (!messaging) return;

        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    // This VAPID key is a placeholder - user would normally provide their own
                    const token = await getToken(messaging!, {
                        vapidKey: 'BGHc0xO8y6_D_R9v_W7P_Q' // Example public VAPID key
                    });
                    if (token) {
                        console.log('FCM Token:', token);
                        // In a real app, send this token to your server to associate with user
                    }
                }
            } catch (err) {
                console.error('An error occurred while retrieving token. ', err);
            }
        };

        requestPermission();
    }, []);

    const showToast = (message: string, type: Toast['type'] = 'success') => {
        const id = Date.now().toString();
        const newToast: Toast = { id, message, type };
        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    // Sync user to local storage
    useEffect(() => {
        if (user) {
            localStorage.setItem('japap_user', JSON.stringify(user));
        }
    }, [user]);

    // Realtime Database Posts Sync
    useEffect(() => {
        const postsRef = ref(rtdb, 'posts');
        onValue(postsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Convert object to array and sort by reverse timestamp
                const postsArray = Object.keys(data).map(key => ({
                    ...data[key],
                    id: key
                })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) as Post[];
                setPosts(postsArray);
            } else {
                setPosts([]);
            }
        }, (error) => {
            console.error("RTDB sync error:", error);
            showToast("Failed to sync posts", "error");
        });

        return () => off(postsRef);
    }, []);

    // 7-Day Ephemeral Cleanup
    useEffect(() => {
        const cleanupPosts = () => {
            const postsRef = ref(rtdb, 'posts');
            onValue(postsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const now = Date.now();
                    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
                    Object.keys(data).forEach(async (key) => {
                        if (now - data[key].timestamp > ONE_WEEK) {
                            try {
                                await remove(ref(rtdb, `posts/${key}`));
                                console.log(`Deleted expired post: ${key}`);
                            } catch (e) {
                                console.error(`Error deleting expired post ${key}:`, e);
                            }
                        }
                    });
                }
            }, { onlyOnce: true });
        };

        const interval = setInterval(cleanupPosts, 1000 * 60 * 60); // Run every hour
        cleanupPosts(); // Initial run

        return () => clearInterval(interval);
    }, []);

    const updateUser = async (updates: Partial<UserProfile>) => {
        const newUser = user ? { ...user, ...updates } : updates as UserProfile;
        setUser(newUser);

        if (auth.currentUser) {
            try {
                const userRef = ref(rtdb, `users/${auth.currentUser.uid}`);
                await update(userRef, updates);
            } catch (error) {
                console.error("Error updating user profile:", error);
            }
        }
    };

    const uploadToCloudinary = async (file64: string, type: string) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        // Cloudinary handles image/video/raw (for audio)
        let resourceType = 'image';
        if (type === 'video') resourceType = 'video';
        if (type === 'audio') resourceType = 'video'; // Cloudinary treats audio as video

        const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

        const formData = new FormData();
        formData.append('file', file64);
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(url, { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Cloudinary upload failed');

        const data = await response.json();
        return data.secure_url;
    };

    const addPost = async (newPostData: Omit<Post, 'id' | 'author' | 'stats'>) => {
        if (!user) return;

        showToast("Uploading post...", "info");

        try {
            let mediaUrl = newPostData.content;

            // Handle base64 upload to Cloudinary if it's media
            if (newPostData.type !== 'text' && newPostData.content.startsWith('data:')) {
                mediaUrl = await uploadToCloudinary(newPostData.content, newPostData.type);
            }

            const postsRef = ref(rtdb, 'posts');
            const newPostRef = push(postsRef);

            const postDoc = {
                author: {
                    id: user.pseudo,
                    username: user.pseudo,
                    avatar: user.avatar
                },
                stats: { likes: 0, comments: 0, views: 0, dislikes: 0 },
                liked: false,
                disliked: false,
                timestamp: Date.now(),
                ...newPostData,
                content: mediaUrl
            };

            await set(newPostRef, postDoc);
            showToast("Posted successfully!");
        } catch (error) {
            console.error("Error adding post:", error);
            showToast("Failed to upload post", "error");
        }
    };

    const likePost = async (id: string) => {
        const postRef = ref(rtdb, `posts/${id}`);
        try {
            await runTransaction(postRef, (post) => {
                if (post) {
                    const wasLiked = post.liked;
                    const wasDisliked = post.disliked;
                    const newLiked = !wasLiked;

                    post.liked = newLiked;
                    post.disliked = wasLiked ? false : wasDisliked ? false : post.disliked;

                    if (!post.stats) post.stats = { likes: 0, dislikes: 0, comments: 0, views: 0 };
                    post.stats.likes = (post.stats.likes || 0) + (newLiked ? 1 : -1);
                    post.stats.dislikes = (post.stats.dislikes || 0) - (wasDisliked ? 1 : 0);
                }
                return post;
            });
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const dislikePost = async (id: string) => {
        const postRef = ref(rtdb, `posts/${id}`);
        try {
            await runTransaction(postRef, (post) => {
                if (post) {
                    const wasLiked = post.liked;
                    const wasDisliked = post.disliked;
                    const newDisliked = !wasDisliked;

                    post.disliked = newDisliked;
                    post.liked = wasDisliked ? false : wasLiked ? false : post.liked;

                    if (!post.stats) post.stats = { likes: 0, dislikes: 0, comments: 0, views: 0 };
                    post.stats.dislikes = (post.stats.dislikes || 0) + (newDisliked ? 1 : -1);
                    post.stats.likes = (post.stats.likes || 0) - (wasLiked ? 1 : 0);
                }
                return post;
            });
        } catch (error) {
            console.error("Error disliking post:", error);
        }
    };

    const reactToPost = async (id: string, emoji: string | null) => {
        const postRef = ref(rtdb, `posts/${id}/userReaction`);
        try {
            await runTransaction(postRef, (current) => {
                return (current === emoji) ? null : (emoji || null);
            });
        } catch (error) {
            console.error("Error reacting to post:", error);
        }
    };

    const addComment = async (postId: string, text: string, replyTo?: Comment['replyTo']) => {
        if (!user) return;

        const commentsRef = ref(rtdb, `posts/${postId}/commentsList`);
        const newCommentRef = push(commentsRef);

        const newComment: Comment = {
            id: newCommentRef.key || Math.random().toString(36).substr(2, 9),
            text,
            author: { id: user.pseudo, username: user.pseudo, avatar: user.avatar },
            timestamp: Date.now(),
            replyTo
        };

        try {
            await set(newCommentRef, newComment);
            const statsRef = ref(rtdb, `posts/${postId}/stats/comments`);
            await runTransaction(statsRef, (count) => (count || 0) + 1);
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const reactToComment = async (postId: string, commentId: string, emoji: string | null) => {
        // Find comment index and update emoji
        const post = posts.find(p => p.id === postId);
        if (!post || !post.commentsList) return;

        const updatedComments = post.commentsList.map(c => {
            if (c.id === commentId) {
                return { ...c, userReaction: (c.userReaction === emoji) ? null : (emoji || null) };
            }
            return c;
        });

        try {
            const commentsRef = ref(rtdb, `posts/${postId}/commentsList`);
            await set(commentsRef, updatedComments);
        } catch (error) {
            console.error("Error reacting to comment:", error);
        }
    };

    return (
        <AppContext.Provider value={{
            user,
            posts,
            updateUser,
            addPost,
            likePost,
            dislikePost,
            reactToPost,
            reactToComment,
            addComment,
            toasts,
            showToast,
            removeToast,
            activeCommentsPostId,
            setActiveCommentsPostId,
            activeSharePost,
            setActiveSharePost
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within a AppProvider');
    }
    return context;
}
