import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, MessageCircle, Instagram, Twitter, Facebook, Send, MoreHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';


export default function ShareSheet() {
    const { showToast, activeSharePost, setActiveSharePost } = useApp();
    const visible = !!activeSharePost;
    const onClose = () => setActiveSharePost(null);
    const postCaption = activeSharePost?.caption;
    const postUrl = activeSharePost?.url || '';

    const platforms = [
        {
            name: 'WhatsApp',
            icon: <MessageCircle className="w-6 h-6 text-[#25D366]" />,
            action: () => window.open(`https://wa.me/?text=${encodeURIComponent((postCaption || '') + ' ' + postUrl)}`)
        },
        {
            name: 'Instagram',
            icon: <Instagram className="w-6 h-6 text-[#E4405F]" />,
            action: () => {
                navigator.clipboard.writeText(postUrl);
                showToast('Link copied for Instagram! 📸', 'success');
                onClose();
            }
        },
        {
            name: 'X (Twitter)',
            icon: <Twitter className="w-6 h-6 text-black dark:text-white" />,
            action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postCaption || '')}&url=${encodeURIComponent(postUrl)}`)
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-6 h-6 text-[#1877F2]" />,
            action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`)
        },
        {
            name: 'Telegram',
            icon: <Send className="w-6 h-6 text-[#0088cc]" />,
            action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postCaption || '')}`)
        },
        {
            name: 'Copy Link',
            icon: <Copy className="w-6 h-6 text-zinc-500" />,
            action: async () => {
                await navigator.clipboard.writeText(postUrl);
                showToast('Link copied to clipboard! 🚀', 'success');
                onClose();
            }
        },
        {
            name: 'More',
            icon: <MoreHorizontal className="w-6 h-6 text-zinc-500" />,
            action: async () => {
                if (navigator.share) {
                    try {
                        await navigator.share({ title: 'Japap Social', text: postCaption, url: postUrl });
                    } catch (err) {
                        console.log('Share canceled or failed', err);
                    }
                } else {
                    showToast('Sharing not supported on this browser', 'info');
                }
                onClose();
            }
        }
    ];

    return (
        <AnimatePresence>
            {visible && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-[301]"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-[32px] z-[302] p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                    >
                        <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6" />

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-display font-black text-zinc-900 dark:text-white">Share to</h3>
                            <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                <X size={20} className="text-zinc-500" />
                            </button>
                        </div>

                        <div className="flex overflow-x-auto gap-6 pb-2 no-scrollbar px-2">
                            {platforms.map((platform) => (
                                <button
                                    key={platform.name}
                                    onClick={platform.action}
                                    className="flex flex-col items-center gap-3 min-w-[70px] group"
                                >
                                    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center group-active:scale-95 transition-all shadow-sm border border-zinc-100 dark:border-zinc-800">
                                        {platform.icon}
                                    </div>
                                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 text-center whitespace-nowrap">
                                        {platform.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
