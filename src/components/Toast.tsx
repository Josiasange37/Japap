import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ToastContainer() {
    const { toasts, removeToast } = useApp();

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-3 pointer-events-none w-full max-w-[90vw] sm:max-w-md items-center">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.2 } }}
                        className="pointer-events-auto"
                    >
                        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl px-5 py-4 flex items-center gap-4 min-w-[300px] ring-1 ring-black/5">
                            <div className={`p-2 rounded-xl flex-shrink-0 ${toast.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                    toast.type === 'error' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                        'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                }`}>
                                {toast.type === 'success' && <CheckCircle2 size={20} />}
                                {toast.type === 'error' && <AlertCircle size={20} />}
                                {toast.type === 'info' && <Info size={20} />}
                            </div>

                            <p className="flex-1 text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                                {toast.message}
                            </p>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
