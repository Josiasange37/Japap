import type { Post, GossipComment, UserProfile } from '../types';

/**
 * This service acts as the bridge between the UI and the Backend.
 * To integrate a real DB, simply replace these mock calls with HTTP requests.
 */

// Mock Data
const MOCK_POSTS: Post[] = [
    {
        id: '1',
        type: 'text',
        content: "Heard that the new restaurant in town uses frozen ingredients for everything... 🧊 👀",
        author: { id: 'anon-1', username: 'Anonymous Gossip', avatar: null },
        timestamp: Date.now() - 3600000,
        stats: { likes: 120, dislikes: 5, comments: 45, views: 1200 },
        liked: false,
        disliked: false
    },
    {
        id: '2',
        type: 'image',
        content: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000",
        author: { id: 'japaper-99', username: 'TheOracle', avatar: 'https://i.pravatar.cc/150?u=oracle' },
        timestamp: Date.now() - 7200000,
        stats: { likes: 450, dislikes: 12, comments: 89, views: 5000 },
        liked: true,
        disliked: false
    },
    {
        id: '3',
        type: 'text',
        content: "The local coffee shop is changing its playlist to 100% jazz. Is this the end of my productive mornings",
        author: { id: 'anon-3', username: 'CaffeineQueen', avatar: null },
        timestamp: Date.now() - 86400000,
        stats: { likes: 85, dislikes: 10, comments: 12, views: 950 },
        liked: false,
        disliked: false
    },
    {
        id: '4',
        type: 'image',
        content: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000",
        author: { id: 'dev-42', username: 'CodeSpiller', avatar: 'https://i.pravatar.cc/150?u=dev42' },
        timestamp: Date.now() - 172800000,
        stats: { likes: 310, dislikes: 2, comments: 56, views: 3200 },
        liked: false,
        disliked: false
    },
    {
        id: '5',
        type: 'text',
        content: "Rumor has it the big CEO was spotted eating at a budget taco stand yesterday. Respect. 🌮👔",
        author: { id: 'anon-5', username: 'StreetSpy', avatar: null },
        timestamp: Date.now() - 259200000,
        stats: { likes: 1200, dislikes: 40, comments: 145, views: 15000 },
        liked: false,
        disliked: false
    },
    {
        id: '6',
        type: 'image',
        content: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1000",
        author: { id: 'music-fan', username: 'VibeCheck', avatar: 'https://i.pravatar.cc/150?u=music' },
        timestamp: Date.now() - 432000000,
        stats: { likes: 540, dislikes: 15, comments: 34, views: 6700 },
        liked: false,
        disliked: false
    },
    {
        id: '7',
        type: 'text',
        content: "Why are all the library chairs suddenly so squeaky? I can't even move my pinky without everyone staring. 📚🤫",
        author: { id: 'anon-7', username: 'StudyBug', avatar: null },
        timestamp: Date.now() - 604800000,
        stats: { likes: 45, dislikes: 5, comments: 20, views: 500 },
        liked: false,
        disliked: false
    },
    {
        id: '8',
        type: 'text',
        content: "Just saw a drone delivering a single donut to the park. The future is weird but delicious. 🍩🛸",
        author: { id: 'anon-8', username: 'TechWatcher', avatar: null },
        timestamp: Date.now() - 518400000,
        stats: { likes: 890, dislikes: 8, comments: 67, views: 9800 },
        liked: false,
        disliked: false
    },
    {
        id: '9',
        type: 'image',
        content: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1000",
        author: { id: 'studio-9', username: 'MicDrop', avatar: 'https://i.pravatar.cc/150?u=studio' },
        timestamp: Date.now() - 345600000,
        stats: { likes: 230, dislikes: 12, comments: 45, views: 4200 },
        liked: false,
        disliked: false
    },
    {
        id: '10',
        type: 'text',
        content: "The gym 'mystery smell' has finally been identified as the protein shake spill of 2025. Case closed",
        author: { id: 'anon-10', username: 'GymRat', avatar: null },
        timestamp: Date.now() - 172800000,
        stats: { likes: 120, dislikes: 20, comments: 35, views: 2400 },
        liked: false,
        disliked: false
    }
];

export const JapapAPI = {
    // Posts
    async getPosts(): Promise<Post[]> {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));
        return MOCK_POSTS;
    },

    async createPost(post: Omit<Post, 'id' | 'timestamp' | 'stats'>): Promise<Post> {
        const newPost: Post = {
            ...post,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            stats: { likes: 0, dislikes: 0, comments: 0, views: 0 }
        };
        return newPost;
    },

    // Engagement
    async toggleLike(postId: string): Promise<void> {
        console.log(`Liking post ${postId}`);
    },

    async toggleDislike(postId: string): Promise<void> {
        console.log(`Disliking post ${postId}`);
    },

    async addComment(_postId: string, text: string, author: UserProfile): Promise<GossipComment> {
        return {
            id: Math.random().toString(36).substr(2, 9),
            text,
            author: { id: author.pseudo, username: author.pseudo, avatar: author.avatar },
            timestamp: Date.now()
        };
    },

    // Notifications
    async requestNotificationPermission(): Promise<boolean> {
        if (!('Notification' in window)) return false;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
};
