import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Download, X, Zap, Share } from 'lucide-react';
import { JapapAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => void;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
    const { t } = useLanguage();

    // Initialize isIOS logic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkIsIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const [isIOS] = useState(checkIsIOS); // State is stable

    // Initialize show state
    const [show, setShow] = useState(() => {
        if (checkIsIOS()) {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const hasDismissed = localStorage.getItem('pwa_ios_dismissed');
            return !isStandalone && !hasDismissed;
        }
        return false;
    });

    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [step, setStep] = useState<'install' | 'notify'>('install');

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Only show if not already installed
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                setShow(true);
            }
        };

        // For Android/Chrome
        window.addEventListener('beforeinstallprompt', handler);

        // Also check for notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            // If installed (standalone), ask sooner (1.5s), otherwise wait longer (8s)
            const delay = isStandalone ? 1500 : 8000;

            const timeout = setTimeout(() => {
                setShow((prev) => {
                    if (!prev) {
                        setStep('notify');
                        return true;
                    }
                    return prev;
                });
            }, delay);
            return () => {
                clearTimeout(timeout);
                window.removeEventListener('beforeinstallprompt', handler);
            };
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []); // Empty dependency array is fine here as we only set up listeners

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShow(false);
            }
            setDeferredPrompt(null);
        } else if (isIOS) {
            // On iOS we can't trigger the prompt, we just show instructions
            // The banner itself has the instructions now
        }
    };

    const handleNotify = async () => {
        const granted = await JapapAPI.requestNotificationPermission();
        if (granted) {
            setShow(false);
        }
    };

    const handleDismiss = () => {
        setShow(false);
        if (isIOS) {
            localStorage.setItem('pwa_ios_dismissed', 'true');
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:w-96"
                >
                    <div className="bg-black text-white p-6 rounded-[32px] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand)] opacity-20 blur-3xl" />

                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-gradient-to-br from-[var(--brand)] to-pink-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/40">
                                {step === 'install' ? <Download size={24} /> : <Bell size={24} />}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-display text-xl font-black mb-1">
                                    {step === 'install' ? t('pwa.install.title') : t('pwa.notify.title')}
                                </h3>
                                <p className="text-zinc-400 text-sm font-bold leading-snug mb-4">
                                    {step === 'install'
                                        ? (isIOS ? t('pwa.install.ios') : t('pwa.install.desc'))
                                        : t('pwa.notify.desc')}
                                </p>

                                {step === 'install' && isIOS ? (
                                    <div className="flex items-center gap-2 text-[var(--brand)] font-black text-xs uppercase tracking-widest">
                                        <Share size={16} /> {t('pwa.install.ios').split('📲')[0]}
                                    </div>
                                ) : (
                                    <button
                                        onClick={step === 'install' ? handleInstall : handleNotify}
                                        className="w-full bg-white text-black py-3 rounded-xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {step === 'install' ? t('pwa.install.button') : t('pwa.notify.button')} <Zap size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
