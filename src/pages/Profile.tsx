import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Edit3,
    Check,
    X,
    Grid,
    Heart,
    MessageSquare,
    Zap,
    Bell,
    LogOut,
    Camera
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';

export default function Profile() {
    const { user, posts, updateUser } = useApp();
    const { t } = useLanguage();
    const [showEdit, setShowEdit] = useState(false);
    const [editBio, setEditBio] = useState(user?.bio || '');
    const [editPseudo, setEditPseudo] = useState(user?.pseudo || '');
    const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'saved'>('posts');

    if (!user) return null;

    const myPosts = posts.filter(p => p.author.username === user.pseudo);
    const likedPosts = posts.filter(p => p.liked);

    const displayPosts = activeTab === 'posts' ? myPosts : likedPosts;

    const handleSaveProfile = async () => {
        await updateUser({ bio: editBio, pseudo: editPseudo });
        setShowEdit(false);
    };

    return (
        <Layout>
            <div className="px-4 md:px-0">
                {/* Profile Header */}
                <div className="relative mb-8 bg-[var(--card)] border border-[var(--border)] rounded-[40px] overflow-hidden">
                    {/* Cover Area */}
                    <div className="h-48 bg-gradient-to-r from-[var(--brand)] via-purple-500 to-blue-500 opacity-20" />

                    <div className="px-8 pb-8 flex flex-col items-center -mt-20">
                        {/* Avatar */}
                        <div className="relative group mb-4">
                            <div className="w-40 h-40 rounded-full bg-[var(--bg)] p-2 shadow-2xl border border-[var(--border)]">
                                <div className="w-full h-full rounded-full bg-[var(--bg-secondary)] overflow-hidden flex items-center justify-center">
                                    {user.avatar ? (
                                        <img src={user.avatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-6xl">👤</span>
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-3 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform">
                                <Camera size={20} />
                            </button>
                        </div>

                        {showEdit ? (
                            <div className="w-full max-w-sm space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-4">{t('onboarding.profile.label')}</label>
                                    <input
                                        value={editPseudo}
                                        onChange={(e) => setEditPseudo(e.target.value)}
                                        className="w-full bg-[var(--bg-secondary)] px-6 py-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[var(--brand)] transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-4">The Bio</label>
                                    <textarea
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        className="w-full bg-[var(--bg-secondary)] px-6 py-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[var(--brand)] transition-all h-24 resize-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSaveProfile} className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-tighter">
                                        <Check size={18} /> {t('onboarding.profile.button')}
                                    </button>
                                    <button onClick={() => setShowEdit(false)} className="px-6 bg-[var(--bg-secondary)] py-4 rounded-2xl font-black text-sm active:scale-95 transition-transform">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <h1 className="font-display text-4xl font-black tracking-tight">{user.pseudo}</h1>
                                    <button onClick={() => setShowEdit(true)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors text-[var(--text-muted)]">
                                        <Edit3 size={20} />
                                    </button>
                                </div>
                                <p className="text-[var(--text-muted)] font-bold text-sm max-w-xs mx-auto leading-relaxed">
                                    {user.bio || "Spilling tea since forever"}
                                </p>

                                {/* Stats Pill */}
                                <div className="mt-6 flex bg-[var(--bg-secondary)] p-2 rounded-3xl gap-1">
                                    <div className="px-6 py-3 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
                                        <p className="font-black text-xl">{myPosts.length}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('profile.stats.scoops')}</p>
                                    </div>
                                    <div className="px-6 py-3 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
                                        <p className="font-black text-xl">{myPosts.reduce((acc, p) => acc + p.stats.likes, 0)}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('profile.stats.clarity')}</p>
                                    </div>
                                    <div className="px-6 py-3 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
                                        <p className="font-black text-xl">Top 5%</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('profile.stats.rank')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Tabs */}
                <div className="flex gap-4 mb-6 sticky top-20 z-10 py-2 bg-[var(--bg)]">
                    <TabButton
                        active={activeTab === 'posts'}
                        icon={Grid}
                        label={t('profile.scoops')}
                        onClick={() => setActiveTab('posts')}
                    />
                    <TabButton
                        active={activeTab === 'likes'}
                        icon={Heart}
                        label={t('profile.likes')}
                        onClick={() => setActiveTab('likes')}
                    />
                </div>

                {/* Profile Feed */}
                <div className="flex flex-col gap-6">
                    {displayPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                    {displayPosts.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
                            <Zap size={64} className="mb-4" />
                            <p className="font-black">Nothing to see here yet.<br />Go spill some tea!</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${active
                ? 'bg-black text-white shadow-xl shadow-black/10'
                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text)]'
                }`}
        >
            <Icon size={18} />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
