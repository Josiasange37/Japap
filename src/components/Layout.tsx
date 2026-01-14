import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, User } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import CommentsSheet from './CommentsSheet';
import ShareSheet from './ShareSheet';

const navItems = [
    { path: '/', icon: Home, label: 'Feed' },
    { path: '/create', icon: PlusSquare, label: 'Create' },
    { path: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    const renderNavButton = (item: typeof navItems[0]) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
            <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={clsx(
                    "relative flex items-center justify-center transition-all duration-200 group p-2 rounded-2xl",
                    !isActive && "hover:bg-blue-50/80 dark:hover:bg-zinc-800/50"
                )}
            >
                {isActive && (
                    <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-2xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <div className="flex flex-col items-center">
                    <Icon
                        size={24}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={clsx(
                            "transition-colors duration-200",
                            isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"
                        )}
                    />
                </div>
            </button>
        );
    };

    return (
        <div className="w-full h-screen bg-[#eff6ff] text-zinc-900 flex items-center justify-center overflow-hidden relative selection:bg-blue-500 selection:text-white">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),rgba(219,234,254,1))] dark:bg-zinc-950 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

            {/* Decorative Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-300/20 blur-[100px] pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-300/20 blur-[100px] pointer-events-none mix-blend-multiply" />

            <div className="relative flex w-full h-full">
                <main className="relative w-full h-full bg-white/50 flex flex-col overflow-hidden glass-panel transition-all duration-500">
                    <div className="flex-1 overflow-y-auto no-scrollbar relative">
                        <Outlet />
                    </div>

                    {/* Universal Bottom Navigation */}
                    <div className="flex h-20 bg-white border-t border-zinc-100 items-center justify-around px-6 pb-2 z-50">
                        {navItems.map((item) => renderNavButton(item))}
                    </div>

                    {/* Global Sheets (Absolute inside main) */}
                    <CommentsSheet />
                    <ShareSheet />
                </main>
            </div>
        </div>
    );
}
