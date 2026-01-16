import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart,
    MessageCircle,
    Share2,
    Repeat2,
    MoreHorizontal,
    ThumbsDown,
    Play,
    Volume2,
    AlertCircle,
    Flag,
    Copy,
    ExternalLink,
    Trash2,
    SmilePlus
} from 'lucide-react';
import type { Post } from '../types';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { parseTextWithHashtags } from '../utils/text';

import AdOverlay from './AdOverlay';
import ReactionPicker from './ReactionPicker';

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const { likePost, dislikePost, setActiveCommentsPostId, showToast, deletePost, user, addReaction } = useApp();
    const { t } = useLanguage();
    const [isLiked, setIsLiked] = useState(post.liked);
    const [isDisliked, setIsDisliked] = useState(post.disliked);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isReshared, setIsReshared] = useState(false);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);

    const isViral = post.stats.views > 1000 || post.stats.likes > 100;
    const [showAd, setShowAd] = useState(true);

    const isRiskyContent = post.content.toLowerCase().includes('leak') ||
        post.content.toLowerCase().includes('scandal') ||
        post.content.length > 500;

    // Sync local state with real data when it changes
    React.useEffect(() => {
        setIsLiked(post.liked);
        setIsDisliked(post.disliked);
    }, [post.liked, post.disliked]);

    const handleDoubleTap = () => {
        if (!isLiked) {
            handleLike();
        }
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 800);
    };

    const handleLike = () => {
        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        if (isDisliked && newIsLiked) setIsDisliked(false);
        likePost(post.id);
    };

    const handleDislike = () => {
        // Optimistic update
        const newIsDisliked = !isDisliked;
        setIsDisliked(newIsDisliked);
        if (isLiked && newIsDisliked) setIsLiked(false);
        dislikePost(post.id);
    };

    const handleReport = () => {
        showToast("Report submitted. Our shadow mods are on it");
        setShowOptions(false);
    };

    const handleShare = async (method: 'native' | 'copy') => {
        const shareText = `Vient voir le kongosa du moment sur JAPAP\n\n"${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}"\n\nCheck ça ici: `;
        const shareUrl = `${window.location.origin}/post/${post.id}`;

        if (method === 'native' && navigator.share) {
            try {
                await navigator.share({
                    title: 'JAPAP - Le Kongosa du Mboa',
                    text: shareText,
                    url: shareUrl,
                });
                showToast("Partagé avec succès");
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareText}${shareUrl}`);
                showToast("Lien du kongosa copié");
            } catch (err) {
                showToast("Échec de la copie. Réessaie.");
            }
        }
        setShowShareModal(false);
    };

    const handleReshare = () => {
        setIsReshared(!isReshared);
        if (!isReshared) {
            showToast("Scoop repartagé sur ton profil");
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[var(--card)] border-b md:border md:rounded-[32px] border-[var(--border)] mb-0 md:mb-6 group transition-all ${isRiskyContent ? 'border-amber-500/20 shadow-inner' : ''}`}
        >
            {isRiskyContent && (
                <div className="bg-amber-500/10 px-4 py-1.5 flex items-center gap-2 md:rounded-t-[32px]">
                    <AlertCircle size={14} className="text-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">Sensitive Content - Ads Offline</span>
                </div>
            )}

            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden flex items-center justify-center font-bold">
                        {post.author.avatar ? (
                            <img src={post.author.avatar} alt={post.author.username} className="w-full h-full object-cover" />
                        ) : (
                            <span>{(post.author.username || 'A')[0].toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm hover:underline cursor-pointer">{post.author.username || 'Anonymous'}</h3>
                        <p className="text-[10px] text-[var(--text-muted)] font-medium">
                            {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Gossip
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className={`p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors ${showOptions ? 'bg-[var(--bg-secondary)]' : ''}`}
                    >
                        <MoreHorizontal size={20} className="text-[var(--text-muted)]" />
                    </button>

                    <AnimatePresence>
                        {showOptions && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden"
                            >
                                <button
                                    onClick={handleReport}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <Flag size={18} /> Report Scoop
                                </button>
                                {(post.author.username === 'Anonymous Gossip' || post.author.username === user?.pseudo) && (
                                    <button
                                        onClick={() => {
                                            deletePost(post.id);
                                            setShowOptions(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
                                    >
                                        <Trash2 size={18} /> Delete Scoop
                                    </button>
                                )}
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors">
                                    <AlertCircle size={18} /> Why this ad?
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content - Double Tap Area */}
            <div
                className="px-4 pb-4 relative cursor-pointer"
                onDoubleClick={handleDoubleTap}
            >
                {/* Heart Animation Overlay */}
                <AnimatePresence>
                    {showHeartAnimation && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
                            animate={{ opacity: 1, scale: 1.5 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute top-1/2 left-1/2 z-20 pointer-events-none"
                        >
                            <Heart size={80} className="fill-pink-500 text-pink-500 drop-shadow-2xl" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {post.type === 'text' && (
                    <p className="text-[17px] leading-relaxed font-normal whitespace-pre-wrap select-none">
                        {parseTextWithHashtags(post.content)}
                    </p>
                )}

                {post.type === 'image' && (
                    <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)] mb-2 relative">
                        <img
                            src={post.content}
                            alt="Gossip Media"
                            className="w-full h-auto max-h-[500px] object-cover"
                        />
                    </div>
                )}

                {(post.type === 'video' || post.type === 'audio') && (
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-[var(--border)]">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                            <Play fill="white" className="text-white ml-1" size={32} />
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <Volume2 size={16} />
                                <span>PREVIEW - 0:15 / 0:45</span>
                            </div>
                            <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-md">NSFW BLUR OFF</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Reactions Display */}
            {post.reactions && Object.keys(post.reactions).length > 0 && (
                <div className="px-4 py-2 flex gap-2 flex-wrap">
                    {Object.entries(post.reactions).map(([emoji, count]) => (
                        <button
                            key={emoji}
                            onClick={() => addReaction(post.id, emoji)}
                            className={`px-2 py-1 rounded-full text-xs font-bold border flex items-center gap-1 transition-all ${post.userReaction === emoji
                                ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                                : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:bg-[var(--border)]'
                                }`}
                        >
                            <span>{emoji}</span>
                            <span>{count}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Stats Quick View */}
            <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-4 text-[11px] font-bold text-[var(--text-muted)]">
                <span>{post.stats.views.toLocaleString()} {t('post.views')}</span>
                <span>{post.stats.comments} {t('post.comments')}</span>
                <span>{Math.round((post.stats.likes / (post.stats.likes + post.stats.dislikes + 1)) * 100)}% {t('post.hot')}</span>
            </div>

            {/* Interactions */}
            <div className="px-2 py-1 flex items-center justify-between border-t border-[var(--border)]">
                <div className="flex items-center gap-1">
                    <ActionButton
                        icon={Heart}
                        active={isLiked}
                        activeColor="text-pink-500"
                        count={Math.max(0, post.stats.likes + (isLiked ? 1 : 0) - (post.liked ? 1 : 0))}
                        onClick={handleLike}
                    />
                    <ActionButton
                        icon={ThumbsDown}
                        active={isDisliked}
                        activeColor="text-blue-500"
                        count={Math.max(0, post.stats.dislikes + (isDisliked ? 1 : 0) - (post.disliked ? 1 : 0))}
                        onClick={handleDislike}
                    />
                    <div className="relative">
                        <ActionButton
                            icon={SmilePlus}
                            onClick={() => setShowReactionPicker(!showReactionPicker)}
                            active={!!post.userReaction}
                            activeColor="text-amber-500"
                        />
                        <ReactionPicker
                            visible={showReactionPicker}
                            onSelect={(emoji) => {
                                addReaction(post.id, emoji);
                                setShowReactionPicker(false);
                            }}
                            onClose={() => setShowReactionPicker(false)}
                            position="relative"
                        />
                    </div>
                    <ActionButton
                        icon={MessageCircle}
                        onClick={() => setActiveCommentsPostId(post.id)}
                        count={post.stats.comments}
                    />
                </div>

                <div className="flex items-center gap-1">
                    <ActionButton
                        icon={Repeat2}
                        active={isReshared}
                        activeColor="text-emerald-500"
                        onClick={handleReshare}
                    />
                    <div className="relative">
                        <ActionButton icon={Share2} onClick={() => setShowShareModal(!showShareModal)} />

                        <AnimatePresence>
                            {showShareModal && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10, x: -100 }}
                                    animate={{ opacity: 1, scale: 1, y: 0, x: -150 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10, x: -100 }}
                                    className="absolute bottom-12 right-0 w-56 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden p-2"
                                >
                                    <div className="p-2 border-b border-[var(--border)] mb-1">
                                        <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest text-center">Partager le kongosa</p>
                                    </div>
                                    <button
                                        onClick={() => handleShare('native')}
                                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold hover:bg-[var(--bg-secondary)] rounded-xl transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ExternalLink size={18} />
                                            <span>Via l'App</span>
                                        </div>
                                        <ChevronRight size={14} className="opacity-30" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('copy')}
                                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold hover:bg-[var(--bg-secondary)] rounded-xl transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Copy size={18} />
                                            <span>Copier le lien</span>
                                        </div>
                                        <ChevronRight size={14} className="opacity-30" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

function ActionButton({
    icon: Icon,
    active,
    activeColor,
    count,
    onClick
}: {
    icon: any,
    active?: boolean,
    activeColor?: string,
    count?: number,
    onClick?: () => void
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all hover:bg-[var(--bg-secondary)] ${active ? activeColor : 'text-[var(--text-muted)]'}`}
        >
            <motion.div
                animate={active ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.4 }}
            >
                <Icon size={20} className={active ? 'fill-current' : ''} />
            </motion.div>
            {count !== undefined && <span className="text-sm font-bold">{count}</span>}
        </motion.button>
    );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
}
