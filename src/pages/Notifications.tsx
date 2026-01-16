import React from 'react';
import Layout from '../components/Layout';
import AdUnit from '../components/AdUnit';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, TrendingUp, MessageCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useScrollDirection } from '../hooks/useScrollDirection';

import { useApp } from '../context/AppContext';

export default function Notifications() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { notifications, removeNotification } = useApp();

    const iconMap: Record<string, any> = {
        trending: TrendingUp,
        new_post: Zap,
        reaction: Heart,
        comment: MessageCircle
    };

    const getIcon = (type: string) => iconMap[type] || Bell;

    const handleNotificationClick = (type: string, id: number) => {
        removeNotification(id);
        navigate(`/`);
    };

    return (
        <Layout>
            <div className="px-4 md:px-0">
                <div className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:static md:z-0 mb-4 md:mb-8 border-b border-[var(--border)] md:border-none">
                    <h1 className="font-display text-4xl font-black tracking-tight">{t('notifications.title')}</h1>
                    <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-[0.2em] mt-1">{t('notifications.subtitle')}</p>
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {notifications.map((n, i) => {
                            const Icon = getIcon(n.type);
                            const color = n.type === 'trending' ? 'bg-orange-500' : n.type === 'new_post' ? 'bg-pink-500' : n.type === 'reaction' ? 'bg-red-500' : 'bg-blue-500';
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
                                    onClick={() => handleNotificationClick(n.type, n.id)}
                                    className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-[28px] flex gap-4 items-start hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group touch-pan-y relative"
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
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{n.time}</span>
                                        </div>
                                        <p className="text-[var(--text-muted)] font-medium leading-relaxed">{n.message}</p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                    {notifications.length > 0 && <AdUnit slot="NOTIFICATIONS_SLOT" />}
                </div>

                {notifications.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center opacity-30">
                        <Bell size={64} className="mb-4" />
                        <p className="font-bold">{t('notifications.empty')}</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
