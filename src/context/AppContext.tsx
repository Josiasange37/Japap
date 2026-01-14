import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    addDoc,
    updateDoc,
    doc,
    increment,
    arrayUnion,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';
import {
    onAuthStateChanged,
    signInAnonymously
} from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
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

    // Firestore Real-time Posts Sync
    useEffect(() => {
        const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as Post[];
            setPosts(postsData);
        }, (error) => {
            console.error("Firestore sync error:", error);
            showToast("Failed to sync posts", "error");
        });

        return () => unsubscribe();
    }, []);

    const updateUser = async (updates: Partial<UserProfile>) => {
        const newUser = user ? { ...user, ...updates } : updates as UserProfile;
        setUser(newUser);

        // Save to Firestore if we have an authenticated user
        if (auth.currentUser) {
            try {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                await setDoc(userRef, newUser, { merge: true });
            } catch (error) {
                console.error("Error updating user profile:", error);
            }
        }
    };

    const addPost = async (newPostData: Omit<Post, 'id' | 'author' | 'stats'>) => {
        if (!user) return;

        showToast("Uploading post...", "info");

        try {
            let mediaUrl = newPostData.content;

            // Handle base64 upload to Storage if it's media
            if (newPostData.type !== 'text' && newPostData.content.startsWith('data:')) {
                const storageRef = ref(storage, `posts/${Date.now()}`);
                await uploadString(storageRef, newPostData.content, 'data_url');
                mediaUrl = await getDownloadURL(storageRef);
            }

            const postDoc = {
                author: {
                    id: user.pseudo,
                    username: user.pseudo,
                    avatar: user.avatar
                },
                stats: { likes: 0, comments: 0, views: 0, dislikes: 0 },
                liked: false,
                disliked: false,
                timestamp: serverTimestamp(),
                ...newPostData,
                content: mediaUrl
            };

            await addDoc(collection(db, 'posts'), postDoc);
            showToast("Posted successfully!");
        } catch (error) {
            console.error("Error adding post:", error);
            showToast("Failed to upload post", "error");
        }
    };

    const likePost = async (id: string) => {
        const post = posts.find(p => p.id === id);
        if (!post) return;

        const wasLiked = post.liked;
        const wasDisliked = post.disliked;
        const newLiked = !wasLiked;

        try {
            const postRef = doc(db, 'posts', id);
            await updateDoc(postRef, {
                liked: newLiked,
                disliked: wasLiked ? false : wasDisliked ? false : post.disliked,
                'stats.likes': increment(newLiked ? 1 : -1),
                'stats.dislikes': increment(wasDisliked ? -1 : 0)
            });
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const dislikePost = async (id: string) => {
        const post = posts.find(p => p.id === id);
        if (!post) return;

        const wasLiked = post.liked;
        const wasDisliked = post.disliked;
        const newDisliked = !wasDisliked;

        try {
            const postRef = doc(db, 'posts', id);
            await updateDoc(postRef, {
                disliked: newDisliked,
                liked: wasDisliked ? false : wasLiked ? false : post.liked,
                'stats.dislikes': increment(newDisliked ? 1 : -1),
                'stats.likes': increment(wasLiked ? -1 : 0)
            });
        } catch (error) {
            console.error("Error disliking post:", error);
        }
    };

    const reactToPost = async (id: string, emoji: string | null) => {
        const post = posts.find(p => p.id === id);
        if (!post) return;

        try {
            const postRef = doc(db, 'posts', id);
            await updateDoc(postRef, {
                userReaction: (post.userReaction === emoji) ? null : (emoji || null)
            });
        } catch (error) {
            console.error("Error reacting to post:", error);
        }
    };

    const addComment = async (postId: string, text: string, replyTo?: Comment['replyTo']) => {
        if (!user) return;

        const newComment: Comment = {
            id: Math.random().toString(36).substr(2, 9),
            text,
            author: { id: user.pseudo, username: user.pseudo, avatar: user.avatar },
            timestamp: Date.now(),
            replyTo
        };

        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                commentsList: arrayUnion(newComment),
                'stats.comments': increment(1)
            });
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const reactToComment = async (postId: string, commentId: string, emoji: string | null) => {
        // Firebase array updates are tricky for nested items. 
        // For now, we'll refetch and replace or handle locally if needed.
        // Simplified: update the whole list or use a separate collection for comments.
        // For this demo, we'll stick to a simple replacement.
        const post = posts.find(p => p.id === postId);
        if (!post || !post.commentsList) return;

        const updatedComments = post.commentsList.map(c => {
            if (c.id === commentId) {
                return { ...c, userReaction: (c.userReaction === emoji) ? null : (emoji || null) };
            }
            return c;
        });

        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                commentsList: updatedComments
            });
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
