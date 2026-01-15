import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Search,
    PlusSquare,
    Bell,
    User,
    Moon,
    Sun,
    Menu,
    X,
    TrendingUp,
    Zap,
    Languages,
    ShieldCheck,
    BookOpen,
    Globe
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import PWAInstallBanner from './PWAInstallBanner';
import AdUnit from './AdUnit';

import { useScrollPosition } from '../hooks/useScrollPosition';

export default function Layout({ children }: { children: React.ReactNode }) {
    const { theme, toggleTheme } = useTheme();
    const { user, notifications, trendingCount } = useApp();
    const { language, setLanguage, t } = useLanguage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const scrollY = useScrollPosition();
    const isAtTop = scrollY < 10;

    const unreadCount = notifications.length;

    const navItems = [
        { icon: Home, label: t('nav.home'), path: '/' },
        { icon: TrendingUp, label: t('nav.trending'), path: '/trending', badge: trendingCount },
        { icon: PlusSquare, label: t('nav.create'), path: '/create' },
        { icon: Bell, label: t('nav.notifications'), path: '/notifications', badge: unreadCount },
        { icon: User, label: t('nav.profile'), path: '/profile' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 border-r border-[var(--border)] h-screen sticky top-0 px-6 py-8 bg-[var(--card)]">
                <div className="flex items-center gap-2 mb-12 px-2">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-pink-500/20">
                        <img src="/app-icon.jpg" alt="Japap Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-display text-2xl font-black tracking-tight tracking-tighter italic">JAPAP</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group ${location.pathname === item.path
                                ? 'bg-[var(--brand)] text-white shadow-lg shadow-pink-500/20'
                                : 'hover:bg-[var(--bg-secondary)]'
                                }`}
                        >
                            <div className="relative">
                                <item.icon size={22} className={location.pathname === item.path ? '' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'} />
                                {(item.badge || 0) > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[var(--card)]">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            {item.label}
                        </Link>
                    ))}

                    <div className="mt-8">
                        <AdUnit slot="1234567890" format="rectangle" className="opacity-80 hover:opacity-100 transition-opacity" />
                    </div>
                </nav>

                <div className="mt-auto pt-8 border-t border-[var(--border)] space-y-6">
                    {/* Legal Links */}
                    <div className="px-4 flex flex-wrap gap-x-4 gap-y-1">
                        <Link to="/privacy" className="text-[10px] font-black uppercase text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">Privacy</Link>
                        <Link to="/guidelines" className="text-[10px] font-black uppercase text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">Guidelines</Link>
                    </div>

                    {/* Desktop Controls (Theme & Language Switchers) */}
                    <div className="space-y-3">
                        {/* Theme Switcher */}
                        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--border)]">
                            <button
                                onClick={() => theme !== 'light' && toggleTheme()}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black transition-all ${theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}
                            >
                                <Sun size={14} /> CLAIR
                            </button>
                            <button
                                onClick={() => theme !== 'dark' && toggleTheme()}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black transition-all ${theme === 'dark' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}
                            >
                                <Moon size={14} /> SOMBRE
                            </button>
                        </div>

                        {/* Language Switcher */}
                        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--border)]">
                            <button
                                onClick={() => setLanguage('fr')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black transition-all ${language === 'fr' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}
                            >
                                <Globe size={14} /> FRANÇAIS
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black transition-all ${language === 'en' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}
                            >
                                <Globe size={14} /> ENGLISH
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] overflow-hidden border-2 border-[var(--border)]">
                            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">👤</div>}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold truncate max-w-[120px]">{user?.pseudo || 'Anonymous'}</p>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest">Active Now</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header - Auto-hide on scroll */}
                <header className={`lg:hidden h-16 border-b border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl sticky top-0 z-40 px-4 flex items-center justify-between transition-transform duration-300 ${isAtTop ? 'translate-y-0' : '-translate-y-full'}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden">
                            <img src="/app-icon.jpg" alt="Japap Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-display text-xl font-black italic tracking-tighter">JAPAP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Quick Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl transition-colors"
                        >
                            {theme === 'light' ? <Moon size={18} className="text-zinc-900" /> : <Sun size={18} className="text-yellow-400" />}
                        </button>

                        {/* Quick Language Toggle */}
                        <button
                            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                            className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl transition-colors"
                        >
                            <Languages size={18} className="text-[var(--text-muted)]" />
                        </button>

                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2.5 hover:bg-[var(--bg-secondary)] rounded-xl transition-colors"
                        >
                            <Menu size={22} />
                        </button>
                    </div>
                </header>

                <div className="container max-w-2xl mx-auto px-0 md:px-4 py-0 md:py-8 min-h-screen">
                    {children}
                </div>

                <PWAInstallBanner />

                <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--glass)] backdrop-blur-xl border-t border-[var(--border)] z-40 flex items-center justify-around px-4 pb-safe">
                    {navItems.slice(0, 4).map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`relative p-2 rounded-xl transition-all ${location.pathname === item.path ? 'bg-[var(--brand)] text-white shadow-lg' : 'text-[var(--text-muted)]'}`}
                        >
                            <div className="relative">
                                <item.icon size={24} />
                                {(item.badge || 0) > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border border-[var(--card)]">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                    <Link to="/profile" className={`w-8 h-8 rounded-full border-2 overflow-hidden ${location.pathname === '/profile' ? 'border-[var(--brand)]' : 'border-[var(--border)]'}`}>
                        {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">👤</div>}
                    </Link>
                </nav>
            </main>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed right-0 top-0 bottom-0 w-80 bg-[var(--bg)] z-50 lg:hidden p-8 shadow-2xl"
                        >
                            <button onClick={() => setIsSidebarOpen(false)} className="absolute top-6 right-6 p-2">
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-2 mb-12">
                                <div className="w-10 h-10 rounded-xl overflow-hidden">
                                    <img src="/app-icon.jpg" alt="Japap Logo" className="w-full h-full object-cover" />
                                </div>
                                <span className="font-display text-2xl font-black italic tracking-tighter">JAPAP</span>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)]">
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Thème</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { toggleTheme(); }}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-white text-black shadow-sm' : 'bg-[var(--bg)] text-zinc-500'}`}
                                        >
                                            <Sun size={18} /> CLAIR
                                        </button>
                                        <button
                                            onClick={() => { toggleTheme(); }}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-zinc-800 text-white shadow-sm' : 'bg-[var(--bg)] text-zinc-500'}`}
                                        >
                                            <Moon size={18} /> SOMBRE
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)]">
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Langue</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setLanguage('fr')}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${language === 'fr' ? 'bg-white text-black shadow-sm' : 'bg-[var(--bg)] text-zinc-500'}`}
                                        >
                                            FR
                                        </button>
                                        <button
                                            onClick={() => setLanguage('en')}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${language === 'en' ? 'bg-white text-black shadow-sm' : 'bg-[var(--bg)] text-zinc-500'}`}
                                        >
                                            EN
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <AdUnit slot="9876543210" format="rectangle" className="opacity-90" />
                                </div>

                                <div className="pt-8 border-t border-[var(--border)]">
                                    <div className="flex flex-col gap-4">
                                        <Link
                                            to="/privacy"
                                            onClick={() => setIsSidebarOpen(false)}
                                            className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-secondary)] font-bold border border-[var(--border)] text-sm tracking-tight"
                                        >
                                            <ShieldCheck size={20} className="text-emerald-500" />
                                            <span>Privacy Policy</span>
                                        </Link>
                                        <Link
                                            to="/guidelines"
                                            onClick={() => setIsSidebarOpen(false)}
                                            className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-secondary)] font-bold border border-[var(--border)] text-sm tracking-tight"
                                        >
                                            <BookOpen size={20} className="text-pink-500" />
                                            <span>Guidelines</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
