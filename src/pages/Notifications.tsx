import React from 'react';
import Layout from '../components/Layout';
import AdUnit from '../components/AdUnit';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, TrendingUp, MessageCircle, Heart, UserPlus, Trash2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { formatRelativeTime } from '../utils/time';

import type { JapapNotification } from '../types';

// Use imported type instead of local definition

export default function Notifications() {
    const { user, notifications, markNotificationRead, removeNotification, clearAllNotifications } = useApp();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleNotificationClick = async (notification: JapapNotification) => {
        if (!notification.read) {
            await markNotificationRead(notification.id);
        }

        if (notification.postId) {
            navigate(`/?post=${notification.postId}`);
        } else if (notification.type === 'follow' && notification.userId) {
            navigate(`/profile/${notification.userId}`);
        }
    };

    const iconMap: Record<string, React.ElementType> = {
        trending: TrendingUp,
        new_post: Zap,
        reaction: Heart,
        comment: MessageCircle,
        like: Heart,
        follow: UserPlus,
        system: ShieldAlert
    };

    const getIcon = (type: string) => iconMap[type] || Bell;

    if (!user) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
                    <Bell size={64} className="text-[var(--text-muted)] mb-4" />
                    <h2 className="text-2xl font-bold mb-2">{t('notifications.empty')}</h2>
                    <p className="text-[var(--text-muted)]">{t('notifications.login_prompt')}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="px-4 md:px-0">
                <div className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:static md:z-0 mb-4 md:mb-8 border-b border-[var(--border)] md:border-none flex justify-between items-center">
                    <div>
                        <h1 className="font-display text-4xl font-black tracking-tight">{t('notifications.title')}</h1>
                        <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-[0.2em] mt-1">{t('notifications.subtitle')}</p>
                    </div>
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAllNotifications}
                            className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                            title={t('notifications.clear_all')}
                        >
                            <Trash2 size={24} />
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {notifications.map((n: JapapNotification, i: number) => {
                            const Icon = getIcon(n.type);
                            const color = n.type === 'like' || n.type === 'dislike' || n.type === 'reaction' ? 'bg-red-500' :
                                n.type === 'post_live' ? 'bg-green-500' :
                                    n.type === 'comment' ? 'bg-blue-500' :
                                        'bg-purple-500';

                            return (
                                <motion.div
                                    key={n.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 200, transition: { duration: 0.2 } }}
                                    whileDrag={{ scale: 1.02, zIndex: 10 }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={{ left: 0, right: 0.5 }}
                                    onDragEnd={(_, info) => {
                                        if (info.offset.x > 100) {
                                            removeNotification(n.id);
                                        }
                                    }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`bg-[var(--card)] border border-[var(--border)] p-5 rounded-[28px] flex gap-4 items-start hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group touch-pan-y relative ${!n.read ? 'bg-[var(--bg-secondary)]/30' : ''}`}
                                >
                                    {/* Swipe Indicator hint */}
                                    <div className="absolute inset-y-0 -left-20 w-20 flex items-center justify-end pr-4 text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity md:hidden">
                                        <span className="text-xs tracking-widest uppercase">Delete</span>
                                    </div>

                                    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-lg leading-none">{n.title}</h3>
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                                {formatRelativeTime(n.timestamp as number)}
                                            </span>
                                        </div>
                                        <p className="text-[var(--text-muted)] font-medium leading-relaxed">{n.message}</p>
                                    </div>
                                    {!n.read && (
                                        <div className="shrink-0 self-center">
                                            <div className="w-2.5 h-2.5 bg-[var(--brand)] rounded-full animate-pulse" />
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                    {notifications.length > 0 && <AdUnit slot="NOTIFICATIONS_SLOT" />}
                </div>

                {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6 opacity-50">
                        <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-6">
                            <Bell size={32} className="text-[var(--text-muted)]" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('notifications.no_notifications')}</h3>
                        <p className="text-[var(--text-muted)]">
                            {t('notifications.empty_state')}
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
