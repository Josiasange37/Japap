import { useState } from 'react';
import { Settings, Edit3, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Profile() {
    const { user, posts, updateUser } = useApp();
    const [showEdit, setShowEdit] = useState(false);

    // Edit States
    const [editBio, setEditBio] = useState(user?.bio || '');

    // Tab State
    type Tab = 'moments' | 'likes';
    const [activeTab, setActiveTab] = useState<Tab>('moments');

    if (!user) return null;

    // Filter posts based on active tab
    const displayedPosts = posts.filter(p => {
        if (activeTab === 'moments') {
            return p.author.id === 'me' || p.author.username === user.pseudo;
        }
        if (activeTab === 'likes') {
            return p.liked;
        }
        return false;
    });

    // Calculate total stats for the user (always based on their own posts)
    const myPosts = posts.filter(p => p.author.id === 'me' || p.author.username === user.pseudo);
    const totalLikes = myPosts.reduce((acc, curr) => acc + curr.stats.likes, 0);

    const handleSaveProfile = () => {
        updateUser({ bio: editBio });
        setShowEdit(false);
    };

    const handleCancelEdit = () => {
        setEditBio(user.bio || '');
        setShowEdit(false);
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Cover Image */}
            <div className="h-40 w-full bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 relative">
                <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                    <Settings size={20} />
                </button>
            </div>

            <div className="px-6 relative flex flex-col items-center -mt-16 text-center flex-1 overflow-y-auto pb-24 no-scrollbar">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 p-[4px] shadow-xl">
                    <div className="w-full h-full rounded-full bg-white relative overflow-hidden group">
                        {user.avatar ? (
                            <img src={user.avatar} className="object-cover w-full h-full" alt="profile" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-4xl">👤</div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <span className="text-white text-xs font-bold">CHANGE</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-col items-center gap-2 justify-center w-full">
                    {showEdit ? (
                        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                            <h2 className="text-2xl font-black font-display text-zinc-900">{user.pseudo}</h2>
                            <textarea
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                placeholder="Edit your bio..."
                                className="w-full font-medium text-sm text-zinc-600 bg-zinc-100 px-4 py-3 rounded-2xl outline-none text-center resize-none h-24"
                            />
                            <div className="flex gap-2">
                                <button onClick={handleSaveProfile} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-bold text-sm hover:scale-105 transition-transform">
                                    <Check size={16} /> Save
                                </button>
                                <button onClick={handleCancelEdit} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-600 rounded-full font-bold text-sm hover:bg-zinc-200 transition-colors">
                                    <X size={16} /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black font-display text-zinc-900">{user.pseudo}</h2>
                                <button
                                    onClick={() => setShowEdit(true)}
                                    className="p-1.5 bg-zinc-100 text-zinc-500 rounded-full hover:bg-zinc-200 transition-colors"
                                >
                                    <Edit3 size={14} />
                                </button>
                            </div>
                            <p className="text-zinc-500 font-bold text-sm max-w-[250px] leading-tight">
                                {user.bio || "No bio yet. Tap edit to add one! ✨"}
                            </p>
                        </>
                    )}
                </div>

                {/* Stats */}
                <div className="flex gap-4 mt-8 w-full">
                    <div className="flex-1 py-4 bg-white rounded-2xl flex flex-col items-center justify-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-zinc-100">
                        <span className="font-black text-2xl font-display">{myPosts.length}</span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1">Posts</span>
                    </div>
                    <div className="flex-1 py-4 bg-white rounded-2xl flex flex-col items-center justify-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-zinc-100">
                        <span className="font-black text-2xl font-display">{totalLikes}</span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1">Likes</span>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="w-full mt-8">
                    <div className="flex border-b border-zinc-100 relative">
                        <button
                            onClick={() => setActiveTab('moments')}
                            className={`flex-1 pb-4 text-sm font-bold transition-colors ${activeTab === 'moments' ? 'text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                            Moments
                        </button>
                        <button
                            onClick={() => setActiveTab('likes')}
                            className={`flex-1 pb-4 text-sm font-bold transition-colors ${activeTab === 'likes' ? 'text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                            Likes
                        </button>

                        {/* Animated Underline */}
                        <div
                            className="absolute bottom-0 h-0.5 bg-black transition-all duration-300 ease-[0.23,1,0.32,1]"
                            style={{
                                width: '50%',
                                left: activeTab === 'moments' ? '0%' : '50%'
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 w-full">
                        {displayedPosts.map(post => (
                            <div key={post.id} className="aspect-square bg-zinc-100 rounded-xl overflow-hidden relative">
                                {post.type === 'image' && (
                                    <img src={post.content} className="w-full h-full object-cover" alt="" />
                                )}
                                {post.type === 'video' && (
                                    <div className="w-full h-full bg-black relative">
                                        <video src={post.content} className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl text-white">🎥</span>
                                        </div>
                                    </div>
                                )}
                                {post.type === 'audio' && (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                                        <span className="text-2xl">🎵</span>
                                    </div>
                                )}
                                {post.type === 'text' && (
                                    <div className="w-full h-full bg-zinc-50 flex items-center justify-center p-2">
                                        <p className="text-[8px] font-bold text-center line-clamp-3">{post.content}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {displayedPosts.length === 0 && (
                        <div className="mt-20 flex flex-col items-center justify-center text-zinc-400">
                            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 text-2xl grayscale opacity-50">
                                {activeTab === 'moments' ? '📸' : activeTab === 'likes' ? '❤️' : '💬'}
                            </div>
                            <p className="text-sm font-medium">No {activeTab} yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
