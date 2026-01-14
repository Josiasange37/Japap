import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Bell, Zap, TrendingUp, MessageCircle, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Notifications() {
    const { t } = useLanguage();

    const notifications = [
        {
            id: 1,
            type: 'trending',
            title: t('notifications.trending.title'),
            message: t('notifications.trending.desc').replace('{name}', 'Le nouveau restaurant'),
            time: '2m',
            icon: TrendingUp,
            color: 'bg-orange-500'
        },
        {
            id: 2,
            type: 'new_post',
            title: t('notifications.new.title'),
            message: t('notifications.new.desc').replace('{name}', 'Campus Life'),
            time: '15m',
            icon: Zap,
            color: 'bg-pink-500'
        },
        {
            id: 3,
            type: 'reaction',
            title: t('notifications.like.title'),
            message: t('notifications.like.desc').replace('{name}', 'Anonymous Gossip'),
            time: '1h',
            icon: Heart,
            color: 'bg-red-500'
        },
        {
            id: 4,
            type: 'comment',
            title: t('notifications.comment.title'),
            message: t('notifications.comment.desc').replace('{name}', 'Quelqu\'un'),
            time: '3h',
            icon: MessageCircle,
            color: 'bg-blue-500'
        }
    ];

    return (
        <Layout>
            <div className="px-4 md:px-0">
                <div className="mb-8">
                    <h1 className="font-display text-4xl font-black tracking-tight">{t('notifications.title')}</h1>
                    <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-[0.2em] mt-1">{t('notifications.subtitle')}</p>
                </div>

                <div className="space-y-4">
                    {notifications.map((n, i) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-[28px] flex gap-4 items-start hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${n.color} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                                <n.icon size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-lg leading-none">{n.title}</h3>
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{n.time}</span>
                                </div>
                                <p className="text-[var(--text-muted)] font-medium leading-relaxed">{n.message}</p>
                            </div>
                        </motion.div>
                    ))}
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
